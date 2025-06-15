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
  Modal,
  TouchableOpacity,
  Switch, 
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import uuid from 'react-native-uuid';

const { width, height } = Dimensions.get("window");



export default function CadastrarIngrediente() {
  const router = useRouter();
  const idIngrediente = uuid.v4() as string;
  const [nomeIngrediente, setNomeIngrediente] = useState('');
  const [precoIngrediente, setPrecoIngrediente] = useState('');
  const [unidadeIngrediente, setUnidadeIngrediente] = useState<'un' | 'gr'>('un');

  const alternarUnidade = () => {
    setUnidadeIngrediente(unidadeIngrediente === 'un' ? 'gr' : 'un');
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
          <Text style={styles.headerText}>Cadastrar ingrediente</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome do ingrediente</Text>
          <TextInput
            style={styles.input}
            value={nomeIngrediente}
            onChangeText={setNomeIngrediente}
          />

          <Text style={styles.label}>Unidade</Text>
          <View style={styles.inline}>
            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>un.</Text>
              <Switch
                value={unidadeIngrediente === 'gr'}
                onValueChange={alternarUnidade}
              />
              <Text style={styles.switchLabel}>gr</Text>
            </View>
          </View>

          <Text style={styles.label}>Preço</Text>
          <TextInput
            style={styles.input}
            value={precoIngrediente}
            onChangeText={setPrecoIngrediente}
            keyboardType="numeric"
          />

          <Pressable  style={styles.salvarBtn}
            onPress={async () => {
              const ingrediente = {
                id_ingrediente: idIngrediente,
                nome: nomeIngrediente,
                // quantidade: quantidadeIngrediente,
                unidade: unidadeIngrediente,
                preco: precoIngrediente,
              };

              try {
                const response = await fetch("http://192.168.100.69:8000/ingredientes", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(ingrediente),
                });
                const result = await response.json();
                console.log(result);

                if (result.success) {
                  alert("Ingrediente salvo com sucesso!");
                  router.back(); // ou limpar formulário
                } else {
                  alert(result.message || "Erro ao salvar ingrediente.");
                }
              } catch (error) {
                console.error("Erro:", error);
                alert("Erro na requisição.");
              }
            }}
          >
            <Text style={styles.salvarText}
            >Salvar</Text>
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
    backgroundColor: 'rgba(255,255,255,0.92)',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#351B01',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 14,
    color: '#000',
  },
  salvarBtn: {
    backgroundColor: '#351B01',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  salvarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
