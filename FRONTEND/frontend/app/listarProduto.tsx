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

  const [produtos, setProdutos] = useState<{ id_produto: string; nome: string; preco: string }[]>([]);


  useEffect(() =>{
    async function carregarProdutos(){
     try{ 
      const response = await fetch("http://192.168.100.69:8000/produtos");
      const data = await response.json() 
      setProdutos(data);
     } catch(error) {
        console.error("Erro ao carregar produtos", error)
     }
    }
    carregarProdutos();
  }, []);
  

  const editarProduto = (produto: any) => {
    router.push({pathname: '/editarProduto', 
      params: { 
        id: produto.id_produto,
        nome: produto.nome,
        preco: produto.preco,
        ingredientes: JSON.stringify(produto.ingredientes || []),
       }
      }
    );
  };

  const excluirProduto = (produtoId: string) => {  
    Alert.alert(  
      'Excluir produto',  
      'Deseja realmente excluir este produto?',  
      [  
        { text: 'Cancelar', style: 'cancel' },  
        {  
          text: 'Excluir',  
          style: 'destructive',  
          onPress: async () => {  
            try {  
              // Usando método DELETE (recomendado)  
              const response = await fetch(`http://192.168.100.69:8000/produtos/${produtoId}`, {  
                method: 'DELETE',  
              });  
              const result = await response.json();  
              if (result.success) {  
                setProdutos(produtos.filter(p => p.id_produto !== produtoId));  
                Alert.alert('Sucesso', 'Produto excluído com sucesso!');  
              } else {  
                Alert.alert('Erro', result.message || 'Erro ao excluir produto.');  
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
          <Text style={styles.headerText}>Lista de produtos</Text>
        </View>

        <FlatList
          contentContainerStyle={{ padding: 20, gap: 16 }}
          data={produtos}
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
                  onPress={() => editarProduto(item)}
                >
                  <Text style={styles.textoBotao}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.botaoAcao}
                  onPress={() => excluirProduto(item.id_produto)}
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