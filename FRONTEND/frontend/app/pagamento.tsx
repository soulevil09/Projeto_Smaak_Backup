// app/compras/pagamento.tsx
import { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Pressable, TextInput, StyleSheet, Dimensions, Alert } from 'react-native';
import { useRouter, useLocalSearchParams  } from 'expo-router';
import { CreditCard, DollarSign, QrCode, Banknote } from 'lucide-react-native';
import axios from 'axios';
import uuid from 'react-native-uuid';

const { width, height } = Dimensions.get('window');

export default function Pagamento() {
  const router = useRouter();
  const { total, produtos } = useLocalSearchParams ();
  const produtosSelecionados = produtos ? JSON.parse(produtos as string) : [];
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('');

  const totalValue = Array.isArray(total) ? total[0] : total || '0';

  const formasPagamento = [
    { id: 'credito', nome: 'Cartão de crédito', Icon: CreditCard },
    { id: 'debito', nome: 'Cartão de débito', Icon: Banknote },
    { id: 'dinheiro', nome: 'Dinheiro', Icon: DollarSign },
    { id: 'pix', nome: 'Pix', Icon: QrCode },
  ];

  const handlePagamento = async () => {
    if (!formaPagamento) {
      Alert.alert('Erro', 'Selecione uma forma de pagamento');
      return;
    }

    const pagamento = {
      id_pagamento: uuid.v4() as string,
      data: new Date().toISOString(),
      forma_pagamento: formaPagamento,
      cpf_cnpj: cpfCnpj,
      valor_total: total,
      produtos: produtosSelecionados,
    };
    
    try {
      const response = await fetch('http://192.168.100.69:8000/pagamento', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagamento)
      });
      const result = await response.json();
      console.log(result);
      if (result.success) {
        Alert.alert('Sucesso', 'Pagamento salvo com sucesso!');
        router.push('/sucessoPagamento');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o pagamento');
        console.log('Erro detalhado:', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error("Erro: ",error);
      Alert.alert('Erro', 'Erro ao conectar com o servidor');
    }
  };

  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.backgroundImage}>
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Pagamento</Text>

        {/* Formas de pagamento */}
        <Text style={styles.sectionTitle}>Formas de pagamento</Text>
        <View style={styles.paymentGrid}>
          {formasPagamento.map(({ id, nome, Icon }) => (
            <Pressable
              key={id}
              style={[
                styles.paymentCard,
                pagamentoSelecionado === id && styles.paymentCardSelected,
              ]}
              onPress={() => {
                setFormaPagamento(nome);
                setPagamentoSelecionado(id);
              }}
            >
              <Icon color={pagamentoSelecionado === id ? '#FFF' : '#351B01'} />
              <Text
                style={[
                  styles.paymentText,
                  pagamentoSelecionado === id && styles.paymentTextSelected,
                ]}
              >
                {nome}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Campo CPF/CNPJ */}
        <Text style={styles.sectionTitle}>CPF/CNPJ na nota</Text>
        <TextInput
          value={cpfCnpj}
          onChangeText={setCpfCnpj}
          placeholder="Digite seu CPF ou CNPJ"
          style={styles.cpfInput}
        />

        {/* Resumo do pedido */}
        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>Resumo do pedido</Text>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalValue}>R$ {parseFloat(totalValue).toFixed(2)}</Text>
        </View>

        <View style={styles.footerButtons}>
          <Text style={styles.addMore} onPress={() => router.push('/cadastrarCompra')}>
            Adicionar mais itens
          </Text>
          <Pressable style={styles.payButton} onPress={handlePagamento}>
            <Text style={styles.payButtonText}>Pagar</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: '#351B01',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#351B01',
    marginBottom: 12,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentCard: {
    width: '48%',
    backgroundColor: '#FFFFF2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardSelected: {
    backgroundColor: '#351B01',
  },
  paymentText: {
    color: '#351B01',
    marginTop: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  paymentTextSelected: {
    color: '#FFF',
  },
  cpfInput: {
    backgroundColor: '#FFFFF2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
  },
  footer: {
    backgroundColor: '#FFFFF2',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#351B01',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#351B01',
  },
  footerButtons: {
    backgroundColor: '#351B01',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  addMore: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  payButton: {
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
