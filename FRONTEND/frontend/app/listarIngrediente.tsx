'use client';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

export default function ListaProdutos() {
  const router = useRouter();

  const [ingredientes, setIngredientes] = useState<{ id_ingrediente: string; nome: string; preco: string; unidade: string }[]>([]);


  useEffect(() =>{
    async function carregarIngredientes(){
     try{ 
      const response = await fetch("http://192.168.100.69:8000/ingredientes");
      const data = await response.json() 
      setIngredientes(data);
     } catch(error) {
        console.error("Erro ao carregar ingredientes", error)
     }
    }
    carregarIngredientes();
  }, []);
  

  const editarIngredinete = (ingrediente: any) => {
    router.push({pathname: '/editarIngrediente', 
      params: { 
        id: ingrediente.id_ingrediente,
        nome: ingrediente.nome,
        preco: ingrediente.preco,
        unidade: ingrediente.unidade
       }
      }
    );
  };

  const excluirIngrediente = (ingredienteId: string) => {  
    Alert.alert(  
      'Excluir produto',  
      'Deseja realmente excluir este Ingrediente?',  
      [  
        { text: 'Cancelar', style: 'cancel' },  
        {  
          text: 'Excluir',  
          style: 'destructive',  
          onPress: async () => {  
            try {  
              // Usando método DELETE (recomendado)  
              const response = await fetch(`http://192.168.100.69:8000/ingredientes/${ingredienteId}`, {  
                method: 'DELETE',  
              });  
              const result = await response.json();  
              if (result.success) {  
                setIngredientes(ingredientes.filter(p => p.id_ingrediente !== ingredienteId));  
                Alert.alert('Sucesso', 'Ingrediente excluído com sucesso!');  
              } else {  
                Alert.alert('Erro', result.message || 'Erro ao excluir ingrediente.');  
              }  
            } catch (error) {  
              Alert.alert('Erro', 'Erro na requisição.');  
              console.error(error);  
            }  
          }  
        }  
      ]  
    );  
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerText}>Lista de Ingredientes</Text>
        </View>

        <FlatList
          contentContainerStyle={{ padding: 20, gap: 16 }}
          data={ingredientes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.preco}>R$ {item.preco}</Text>
              </View>

              <View style={styles.botoes}>
                <Pressable
                  style={styles.botaoAcao}
                  onPress={() => editarIngredinete(item)}
                >
                  <Text style={styles.textoBotao}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.botaoAcao}
                  onPress={() => excluirIngrediente(item.id_ingrediente)}
                >
                  <Text style={styles.textoBotao}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width,
    height,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#351B01',
    width: '100%',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    color: '#FFFFF2',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#351B01',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  preco: {
    fontSize: 14,
    color: '#333',
  },
  botoes: {
    gap: 8,
  },
  botaoAcao: {
    backgroundColor: '#351B01',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});