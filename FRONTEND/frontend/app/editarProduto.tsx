'use client';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Modal from 'react-native-modal';

const { width, height } = Dimensions.get("window");

interface IngredienteSelecionado {
  id_ingrediente: string;
  quantidade: string;
}

export default function EditarProduto() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Preenche os campos com os dados recebidos por parâmetro
  const [nomeProduto, setNomeProduto] = useState(params.nome as string || '');
  const [preco, setPreco] = useState(params.preco as string || '');
  const [ingredientes, setIngredientes] = useState<IngredienteSelecionado[]>(
    params.ingredientes ? JSON.parse(params.ingredientes as string) : []
  );
  const [modalVisible, setModalVisible] = useState(false);

  const [nomeIngrediente, setNomeIngrediente] = useState('');
  const [quantidadeIngrediente, setQuantidadeIngrediente] = useState('');
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState<any | null>(null);

  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<any[]>([]);

  useEffect(() => {
    async function carregarIngredientes() {
      try {
        const response = await fetch("http://192.168.100.69:8000/ingredientes");
        const data = await response.json();
        setIngredientesDisponiveis(data); 
      } catch (error) {
        console.error("Erro ao carregar ingredientes:", error);
      }
    }
    carregarIngredientes();
  }, []);

  const ingredientesFiltrados = ingredientesDisponiveis
    .filter(i => i.nome.toLowerCase().includes(nomeIngrediente.toLowerCase()));

  const adicionarIngrediente = () => {
    if (!ingredienteSelecionado || !quantidadeIngrediente) {
      alert("Selecione um ingrediente e informe a quantidade.");
      return;
    }
    if (ingredientes.some(i => i.id_ingrediente === ingredienteSelecionado.id_ingrediente)) {
      alert("Ingrediente já adicionado.");
      return;
    }
    const novoIngrediente = {
      id_ingrediente: ingredienteSelecionado.id_ingrediente,
      quantidade: quantidadeIngrediente,
    };
    setIngredientes([...ingredientes, novoIngrediente]);
    setModalVisible(false);
    setNomeIngrediente('');
    setQuantidadeIngrediente('');
    setIngredienteSelecionado(null);
  };

  const removerIngrediente = (id_ingrediente: string) => {
    setIngredientes(ingredientes.filter(i => i.id_ingrediente !== id_ingrediente));
  };

  const salvarEdicao = async () => {
    if (!nomeProduto || !preco || ingredientes.length === 0) {
      alert("Preencha todos os campos obrigatórios e adicione pelo menos um ingrediente.");
      return;
    }
    const produtoAtualizado = {
      id_produto: params.id,
      nome: nomeProduto,
      preco: preco,
      ingredientes: ingredientes.map(i => ({  
        id_ingrediente: i.id_ingrediente,  
        quantidade: i.quantidade  
      }))
    };

    try {
      const response = await fetch(`http://192.168.100.69:8000/produtos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoAtualizado),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
        router.back();
      } else {
        Alert.alert('Erro', result.message || 'Erro ao atualizar produto.');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Erro na requisição.');
    }
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
          <Text style={styles.headerText}>Editar produto</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome do crepe</Text>
          <TextInput
            style={styles.input}
            value={nomeProduto}
            onChangeText={setNomeProduto}
          />

          <Text style={styles.label}>Preço</Text>
          <TextInput
            style={styles.input}
            value={preco}
            onChangeText={setPreco}
            keyboardType="numeric"
            editable={true}
          />

          <Text style={styles.label}>Ingredientes</Text>
          <View style={styles.ingredientesBox}>
            <Pressable onPress={() => setModalVisible(true)} style={styles.adicionarBtn}>
              <Feather name="plus-circle" size={16} color="#351B01" />
              <Text style={styles.adicionarText}>Adicionar ingrediente</Text>
            </Pressable>

            <FlatList
              data={ingredientes}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => {
                const info = ingredientesDisponiveis.find(i => i.id_ingrediente === item.id_ingrediente);
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.ingredienteItem}>
                      - {info?.nome} ({item.quantidade} {info?.unidade})
                    </Text>
                    <TouchableOpacity onPress={() => removerIngrediente(item.id_ingrediente)} style={{ marginLeft: 8 }}>
                      <Feather name="trash-2" size={18} color="#c00" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>

          <Pressable
            style={styles.salvarBtn}
            onPress={salvarEdicao}
          >
            <Text style={styles.salvarText}>Salvar</Text>
          </Pressable>
        </View>

        {/* Bottom Sheet Simples */}
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          onSwipeComplete={() => setModalVisible(false)}
          swipeDirection="down"
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.dragIndicator} />

              <Text style={styles.label}>Buscar ingrediente</Text>
              <TextInput
                placeholder="Digite o nome do ingrediente"
                style={styles.input}
                value={nomeIngrediente}
                onChangeText={text => {
                  setNomeIngrediente(text);
                  setIngredienteSelecionado(null);
                }}
              />

              <FlatList
                data={ingredientesFiltrados}
                keyExtractor={(item, index) => item.id_ingrediente || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setNomeIngrediente(item.nome);
                      setIngredienteSelecionado(item);
                    }}
                    style={{
                      backgroundColor: ingredienteSelecionado?.id_ingrediente === item.id_ingrediente ? '#eee' : 'transparent',
                      paddingVertical: 6,
                      paddingHorizontal: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{item.nome} ({item.unidade})</Text>
                  </TouchableOpacity>
                )}
              />

              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.input}
                value={quantidadeIngrediente}
                onChangeText={setQuantidadeIngrediente}
                keyboardType="numeric"
                editable={!!ingredienteSelecionado}
                placeholder={ingredienteSelecionado ? `Quantidade em ${ingredienteSelecionado.unidade}` : 'Selecione um ingrediente'}
              />

              <Pressable onPress={adicionarIngrediente} style={styles.salvarBtn}>
                <Text style={styles.salvarText}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  backgroundImage: { width, height, resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.92)' },
  container: { flex: 1 },
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
  headerText: { color: '#FFFFF2', fontSize: 18, fontWeight: '600' },
  form: { padding: 20, gap: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#351B01',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  ingredientesBox: {
    borderWidth: 1,
    borderColor: '#351B01',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    backgroundColor: '#fff',
  },
  adicionarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  adicionarText: { color: '#351B01', fontSize: 14 },
  ingredienteItem: { color: '#000', fontSize: 14, marginBottom: 4 },
  salvarBtn: {
    backgroundColor: '#351B01',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  salvarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  dragIndicator: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 8,
  },
});
