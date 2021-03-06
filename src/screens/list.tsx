import React, {useEffect, useState} from "react";
import {
  ButtonText, 
  Container, 
  DeleteIcon, 
  EditIcon, 
  EmptyList, 
  ItemList, 
  List, 
  Logo, 
  Player, 
  RegisterButton 
} from "../styles";
import tactical from './../../assets/tactical.png';
import { StackActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity } from "react-native";
import edit from './../../assets/edit.png';
import close from './../../assets/close.png';

export default function ListScreen() {
  const navigation = useNavigation()
  const registerAction = StackActions.push('Register')
  const [usersData, setUsersData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getUsers().then(res => {
       setUsersData(res)
       setIsLoading(false)
       setDeleting(false)
    }).catch(error => console.log(error)) 
        
  }, [deleting])

  const getUsers = async () => {
    let keys: any = []
    let values: any
    
    try {
      keys = await AsyncStorage.getAllKeys()
      
      try {
        values = await AsyncStorage.multiGet(keys)
      } catch (error) {
        console.log(error)
      }
      
    } catch (error) {
      console.log(error)
    }
    return values  
  }

  const deleteUser = async (cpf: string) => {
    try {
      await AsyncStorage.removeItem(`@time:${cpf}`)
    } catch (error) {
      console.log(error)
    }
  }

  const showAlert = (cpf: string) => {
    Alert.alert(
      "Deletar usuário",
      "Ao confirmar o usuário será deletado, deseja prosseguir?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => {
          deleteUser(cpf)
          setDeleting(true)
        }}
      ]
    );
  }

  const parseValues = (values: Array<any>) => {
    const result = values.map((item: {name: ''}, index: number) => {
      return (
        <ItemList key={index}>
          <Player> {JSON.parse(item[1]).name} </Player>
          <TouchableOpacity onPress={() => {
            const editAction = StackActions.push('Register', {user: JSON.parse(item[1])})
            navigation.dispatch(editAction)
          }}>
            <EditIcon source={edit} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            showAlert(JSON.parse(item[1]).cpf)
          }}>
            <DeleteIcon source={close} />
          </TouchableOpacity>
        </ItemList>
      )
    })
    return result
  }

  return(
    isLoading ? (
      <Container contentContainerStyle={{alignItems: 'center'}} style={{marginTop: 300}} >
        <ActivityIndicator size={'large'} color={'#3a9e9c'}/>
      </Container>
    ) : (
      <Container contentContainerStyle={{alignItems: 'center'}}>
        {usersData.length > 0 ? (
          <List>
            {parseValues(usersData)}
          </List>
        ) : (
          <>
            <EmptyList>Ainda não há participantes cadastrados</EmptyList>
            <Logo source={tactical} />
          </>
        )}
        
        <RegisterButton onPress={() => {
          navigation.dispatch(registerAction)
        }}>
          <ButtonText>Registrar</ButtonText>
        </RegisterButton>
      </Container>
    )
  )
}