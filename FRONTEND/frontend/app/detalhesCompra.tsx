import {    
  View,    
  Text,    
  Pressable,    
  StyleSheet,    
  Dimensions,    
  ImageBackground,    
  FlatList,    
  ActivityIndicator,    
} from 'react-native';    
import { useRouter, useLocalSearchParams } from 'expo-router';    
import { Feather } from '@expo/vector-icons';    
import { useEffect, useState } from 'react';    
    
const { width, height } = Dimensions.get('window');    
    
export default function DetalhesCompra() {    
  const router = useRouter();    
  const { id_pagamento } = useLocalSearchParams();    
    
  const [compra, setCompra] = useState<null | {    
    id_pagamento: string;    
    forma_pagamento: string;    
    cpf_cnpj: string;    
    valor_total: string;    
    produtos: any[];    
    data: string;    
  }>(null);    
    
  const [loading, setLoading] = useState(true);    
    
  useEffect(() => {    
    async function carregarPagamento() {    
      try {    
        const response = await fetch(`http://192.168.100.69:8000/pagamento/${id_pagamento}`);    
        const data = await response.json();    
        setCompra(data);    
      } catch (error) {    
        console.error("Erro ao carregar Pagamento:", error);    
      } finally {    
        setLoading(false);    
      }    
    }    
    carregarPagamento();    
  }, [id_pagamento]);    
    
  if (loading) {    
    return (    
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>    
        <ActivityIndicator size="large" color="#351B01" />    
      </View>    
    );    
  }    
    
  if (!compra) {    
    return (    
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>    
        <Text>Compra não encontrada.</Text>    
      </View>    
    );    
  }    
    
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
          <Text style={styles.headerText}>Detalhes da Compra</Text>    
        </View>    
    
        <View style={styles.infoBox}>  
          <Text style={styles.infoText}>ID da compra: {compra.id_pagamento}</Text>  
          <Text style={styles.infoText}>Data da compra: {compra.data}</Text>  
          <Text style={styles.infoText}>Forma de pagamento: {compra.forma_pagamento}</Text>  
          <Text style={styles.infoText}>CPF/CNPJ: {compra.cpf_cnpj}</Text>  
        </View>  
    
        <Text style={styles.subtitulo}>Produtos comprados:</Text>    
    
        <FlatList    
          data={compra.produtos}    
          keyExtractor={(_, index) => index.toString()}    
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}    
          renderItem={({ item }) => {    
            const totalItem = (item.quantidade || 1) * (item.preco || 0);    
            return (    
              <View style={styles.card}>    
                <Text style={styles.nome}>{item.nome}</Text>    
                <Text style={styles.item}>    
                  Unidades: {item.quantidade} | Preço un.: R$ {item.preco?.toFixed(2)}    
                </Text>    
                <Text style={styles.totalItem}>    
                  Total do item: R$ {totalItem.toFixed(2)}    
                </Text>    
              </View>    
            );    
          }}    
        />    
    
        <View style={styles.totalBox}>    
          <Text style={styles.totalText}>Valor total da compra:</Text>    
          <Text style={styles.totalValue}>R$ {parseFloat(compra.valor_total).toFixed(2)}</Text>    
        </View>    
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
  infoBox: {
    padding: 20,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#351B01',
    fontWeight: '500',
  },
  subtitulo: {
    marginLeft: 20,
    fontSize: 16,
    color: '#351B01',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#351B01',
    gap: 4,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  item: {
    fontSize: 14,
    color: '#333',
  },
  totalItem: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  totalBox: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#351B01',
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#351B01',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#351B01',
    marginTop: 4,
  },
});
