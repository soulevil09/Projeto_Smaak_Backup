// app/cadastrarCompra.tsx
import { View, Text, Image, ImageBackground, StyleSheet, Dimensions, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function CadastrarProdutos() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<{ id_produto: string; nome: string; preco: number; quantidade: number; ingredientes: any[] }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() =>{
    async function carregarProdutos(){
     try{ 
      const response = await fetch("http://192.168.100.69:8000/produtos");
      const data = await response.json()
      const produtosComId = data.map((item: any) => ({
        id_produto: item.id_produto,
        nome: item.nome,
        preco: parseFloat(item.preco),
        ingredientes: item.ingredientes,
        quantidade: 0,
      }));
  
      setProdutos(produtosComId);
     } catch(error) {
        console.error("Erro ao carregar produtos", error)
     }
    }
    carregarProdutos();
  }, []);
  
  // Função para atualizar a quantidade e recalcular o total
  const atualizarQuantidade = (id: string, operacao: 'add' | 'remove') => {
    const produtosAtualizados = produtos.map(produto => {
      if (produto.id_produto === id) {
        const novaQuantidade = operacao === 'add' ? produto.quantidade + 1 : Math.max(0, produto.quantidade - 1);
        return { ...produto, quantidade: novaQuantidade };
      }
      return produto;
    });
    setProdutos(produtosAtualizados);

    // Recalcula o total
    const novoTotal = produtosAtualizados.reduce((acc, produto) => acc + (produto.preco * produto.quantidade), 0);
    setTotal(novoTotal);
  };


  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.backgroundImage}>
      <View style={styles.overlay} />
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={styles.title}>Cadastrar compra</Text>

        <FlatList
          contentContainerStyle={{ padding: 20, gap: 16 }}
          data={produtos}
          keyExtractor={(item) => item.id_produto}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <Image source={require('../assets/images/placeholder.png')} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nome}</Text>
                <Text style={styles.price}>R$ {item.preco.toFixed(2)}</Text>
              </View>
              <View style={styles.counter}>
                <Pressable onPress={() => atualizarQuantidade(item.id_produto, 'remove')}>
                  <Text style={styles.counterBtn}>🗑️</Text>
                </Pressable>
                <Text style={styles.counterText}>{item.quantidade}</Text>
                <Pressable onPress={() => atualizarQuantidade(item.id_produto, 'add')}>
                  <Text style={styles.counterBtn}>➕</Text>
                </Pressable>
              </View>
            </View>
          )}
        />

        {/* Rodapé com total */}
        <View style={styles.footer}>
          <Text style={styles.total}>R$ {total.toFixed(2)}</Text>
            <Pressable
              style={styles.nextButton}
              onPress={() =>
                router.push({
                  pathname: '/pagamento',
                  params: { 
                    total: total.toFixed(2),
                    produtos: JSON.stringify(produtos.filter(p => p.quantidade > 0))
                  },
                })
              }
            >
              <Text style={styles.nextText}>Próximo</Text>
            </Pressable>
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#351B01',
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFF2',
    marginBottom: 12,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  name: { color: '#351B01', fontWeight: 'bold' },
  price: { color: '#351B01' },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#351B01',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  counterBtn: { color: '#FFF', paddingHorizontal: 6 },
  counterText: { color: '#FFF', fontWeight: 'bold' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#351B01',
  },
  nextButton: {
    backgroundColor: '#351B01',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nextText: { color: '#FFF', fontWeight: 'bold' },
});
