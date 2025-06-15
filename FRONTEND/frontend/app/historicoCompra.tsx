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
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

export default function HistoricoCompras() {
  const router = useRouter();

  const [pagamentos, setPagamentos] = useState<{id_pagamento: string; forma_pagamento: string; cpf_cnpj: string; valor_total: string}[]>([]);

  useEffect(() => {
    async function carregarPagamentos(){
      try{
        const response = await fetch("http://192.168.100.69:8000/pagamento");
        const data = await response.json()
        const pagamentosComId = data.map((item: any, index: number) => ({
          id_pagamento: item.id_pagamento, // <-- Corrigido aqui
          forma_pagamento: item.forma_pagamento,
          cpf_cnpj: item.cpf_cnpj, // <-- Corrigido aqui
          valor_total: item.valor_total,
        }));

        setPagamentos(pagamentosComId);

      } catch(error) {
          console.error("Erro ao carregar pagamentos", error)
      }
    }
    carregarPagamentos();
  }, []);

  const verDetalhes = (id_pagamento: string) => {
    router.push({
      pathname: 'detalhesCompra',
      params: { id_pagamento }
    });
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
          <Text style={styles.headerText}>Histórico de compra</Text>
        </View>

        <FlatList
          contentContainerStyle={{ padding: 20, gap: 16 }}
          data={pagamentos}
          keyExtractor={(item) => item.id_pagamento}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>Nº da compra: {item.id_pagamento}</Text>
                <Text style={styles.preco}>Valor total: {item.valor_total}</Text>
              </View>

              <Pressable
                style={styles.botaoDetalhes}
                onPress={() => verDetalhes(item.id_pagamento)}
              >
                <Text style={styles.textoBotao}>Detalhes</Text>
              </Pressable>
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
  botaoDetalhes: {
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