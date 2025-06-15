import React, { useState, useEffect } from "react";  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  ScrollView,  
  StyleSheet,  
  ActivityIndicator,  
  Dimensions,  
  ImageBackground,  
  Alert,  
  Modal,  
} from "react-native";  
import { LineChart } from "react-native-gifted-charts";  
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";  
import { useRouter } from "expo-router";  
  
const { width } = Dimensions.get("window");  
  
const PrevisaoVendas = () => {  
  const router = useRouter();  
  const [previsao, setPrevisao] = useState(null);  
  const [loading, setLoading] = useState(false);  
  const [diasPrevisao, setDiasPrevisao] = useState(30);  
  const [dadosHistoricos, setDadosHistoricos] = useState(null);  
  const [modalAnalise, setModalAnalise] = useState(false);  
  
  const API_BASE = "http://192.168.100.69:8000";  
  
  // Buscar previsão ao trocar o período  
  useEffect(() => {  
    buscarPrevisao();  
  }, [diasPrevisao]);  
  
  // Função para buscar previsão existente (sempre atualiza ao trocar período)  
  const buscarPrevisao = async () => {  
    setLoading(true);  
    try {  
      const response = await fetch(`${API_BASE}/previsao-vendas-otimizada/${diasPrevisao}`);  
      const data = await response.json();  
      setPrevisao(data);  
    } catch (error) {  
      console.error('Erro ao buscar previsão:', error);  
      Alert.alert("Erro", "Falha ao buscar previsão");  
      setPrevisao(null);  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  // Função para analisar dados históricos  
  const analisarDadosHistoricos = async () => {  
    try {  
      const response = await fetch(`${API_BASE}/analisar-dados-limpos`);  
      const data = await response.json();  
      setDadosHistoricos(data);  
      setModalAnalise(true);  
    } catch (error) {  
      console.error('Erro ao analisar dados:', error);  
      Alert.alert("Erro", "Falha ao analisar dados históricos");  
    }  
  };  
  
  // Função para gerar nova previsão forçada  
  const gerarNovaPrevisao = async () => {  
    setLoading(true);  
    try {  
      const response = await fetch(`${API_BASE}/gerar-previsao-vendas-otimizada/${diasPrevisao}`, {  
        method: 'POST'  
      });  
      const data = await response.json();  
      // O endpoint retorna { previsao: ... }  
      if (data.previsao) {  
        setPrevisao(data.previsao);  
        Alert.alert("✅ Sucesso", "Nova previsão gerada com sucesso!");  
      }  
    } catch (error) {  
      console.error('Erro ao gerar previsão:', error);  
      Alert.alert("Erro", "Falha ao gerar nova previsão");  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  // Preparar dados para o gráfico  
  const dadosGrafico = previsao?.previsoes_diarias?.map((item) => ({  
    value: item.previsao,  
    label: new Date(item.data).getDate().toString(),  
    dataCompleta: item.data  
  })) || [];  
  
  return (  
    <ImageBackground  
      source={require("../assets/images/background.png")}  
      style={styles.backgroundImage}  
    >  
      <View style={styles.overlay} />  
  
      <ScrollView contentContainerStyle={styles.container}>  
        {/* Header */}  
        <View style={styles.header}>  
          <TouchableOpacity onPress={() => router.back()}>  
            <Icon name="arrow-left" size={24} color="#FFFF2" />  
          </TouchableOpacity>  
          <Text style={styles.titulo}>Previsão de Vendas</Text>  
          <TouchableOpacity onPress={buscarPrevisao}>  
            <Icon name="refresh" size={24} color="#FFFF2" />  
          </TouchableOpacity>  
        </View>  
  
        {/* Botões de ação */}  
        <View style={styles.botoesAutomaticoContainer}>  
          <TouchableOpacity  
            style={[styles.botaoAutomatico, styles.botaoAutomaticoSecundario]}  
            onPress={analisarDadosHistoricos}  
          >  
            <Icon name="chart-line" size={20} color="#351B01" />  
            <Text style={styles.textoBotaoAutomaticoSecundario}>Analisar Dados</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity  
            style={[styles.botaoAutomatico, styles.botaoAutomaticoSecundario]}  
            onPress={gerarNovaPrevisao}  
          >  
            <Icon name="refresh-circle" size={20} color="#351B01" />  
            <Text style={styles.textoBotaoAutomaticoSecundario}>Nova Previsão</Text>  
          </TouchableOpacity>  
        </View>  
  
        {/* Botões de período */}  
        <View style={styles.botoesContainer}>  
          {[7, 15, 30, 60].map(dias => (  
            <TouchableOpacity  
              key={dias}  
              style={[  
                styles.botaoPeriodo,  
                diasPrevisao === dias && styles.botaoPeriodoAtivo  
              ]}  
              onPress={() => setDiasPrevisao(dias)}  
            >  
              <Text style={[  
                styles.textoBotao,  
                diasPrevisao === dias && styles.textoBotaoAtivo  
              ]}>  
                {dias} dias  
              </Text>  
            </TouchableOpacity>  
          ))}  
        </View>  
  
        {/* Indicador de qualidade dos dados */}  
        {dadosHistoricos && (  
          <View style={styles.qualidadeContainer}>  
            <Text style={styles.qualidadeTitulo}>📊 Qualidade dos Dados</Text>  
            <View style={styles.qualidadeInfo}>  
              <Text style={styles.qualidadeTexto}>  
                ✅ Dias com vendas: {dadosHistoricos.estatisticas?.resumo_geral?.dias_com_vendas || 0}  
              </Text>  
              <Text style={styles.qualidadeTexto}>  
                ❌ Dias sem vendas: {dadosHistoricos.estatisticas?.resumo_geral?.dias_sem_vendas || 0}  
              </Text>  
              <Text style={styles.qualidadeTexto}>  
                💰 Média diária: R$ {dadosHistoricos.estatisticas?.vendas?.media_diaria?.toFixed(2) || "0,00"}  
              </Text>  
              <Text style={styles.qualidadeTexto}>  
                📅 Período: {dadosHistoricos.estatisticas?.resumo_geral?.periodo_completo || "N/A"}  
              </Text>  
            </View>  
          </View>  
        )}  
  
        {loading ? (  
          <ActivityIndicator size="large" color="#351B01" style={styles.loading} />  
        ) : (  
          <>  
            {/* Cards de resumo */}  
            {previsao?.resumo && (  
              <View style={styles.resumoContainer}>  
                <View style={styles.card}>  
                  <Text style={styles.cardTitulo}>Total Previsto</Text>  
                  <Text style={styles.cardValor}>  
                    R$ {previsao.resumo.total_previsto.toFixed(2).replace('.', ',')}  
                  </Text>  
                </View>  
                <View style={styles.card}>  
                  <Text style={styles.cardTitulo}>Média Diária</Text>  
                  <Text style={styles.cardValor}>  
                    R$ {previsao.resumo.media_diaria.toFixed(2).replace('.', ',')}  
                  </Text>  
                </View>  
              </View>  
            )}  
  
            {/* Gráfico */}  
            <View style={styles.graficoContainer}>  
              <Text style={styles.subtitulo}>Previsão Diária</Text>  
              {dadosGrafico.length > 0 && (  
                <LineChart  
                  data={dadosGrafico}  
                  width={width - 40}  
                  height={200}  
                  color="#351B01"  
                  thickness={2}  
                  dataPointsColor="#351B01"  
                  showVerticalLines  
                  verticalLinesColor="rgba(53, 27, 1, 0.2)"  
                  xAxisColor="#351B01"  
                  yAxisColor="#351B01"  
                  yAxisTextStyle={{ color: "#351B01" }}  
                  xAxisLabelTextStyle={{ color: "#351B01", fontSize: 10 }}  
                />  
              )}  
            </View>  
  
            {/* Lista detalhada */}  
            <View style={styles.listaContainer}>  
              <Text style={styles.subtitulo}>Detalhes por Dia</Text>  
              {previsao?.previsoes_diarias?.slice(0, 10).map((item, index) => (  
                <View key={index} style={styles.itemLista}>  
                  <Text style={styles.dataItem}>  
                    {new Date(item.data).toLocaleDateString('pt-BR')}  
                  </Text>  
                  <Text style={styles.valorItem}>  
                    R$ {item.previsao.toFixed(2).replace('.', ',')}  
                  </Text>  
                </View>  
              ))}  
            </View>  
          </>  
        )}  
      </ScrollView>  
  
      {/* Modal de análise detalhada */}  
      <Modal  
        visible={modalAnalise}  
        transparent={true}  
        animationType="slide"  
        onRequestClose={() => setModalAnalise(false)}  
      >  
        <View style={styles.modalContainer}>  
          <View style={styles.modalContent}>  
            <Text style={styles.modalTitulo}>📊 Análise Detalhada</Text>  
            {dadosHistoricos && (  
              <ScrollView style={styles.modalScroll}>  
                <Text style={styles.modalSecao}>📈 Estatísticas Gerais</Text>  
                <Text style={styles.modalTexto}>Total de dias: {dadosHistoricos.estatisticas?.resumo_geral?.total_dias}</Text>  
                <Text style={styles.modalTexto}>Dias com vendas: {dadosHistoricos.estatisticas?.resumo_geral?.dias_com_vendas}</Text>  
                <Text style={styles.modalTexto}>Dias sem vendas: {dadosHistoricos.estatisticas?.resumo_geral?.dias_sem_vendas}</Text>  
                <Text style={styles.modalSecao}>💰 Valores</Text>  
                <Text style={styles.modalTexto}>Valor mínimo: R$ {dadosHistoricos.estatisticas?.vendas?.valor_minimo?.toFixed(2)}</Text>  
                <Text style={styles.modalTexto}>Valor máximo: R$ {dadosHistoricos.estatisticas?.vendas?.valor_maximo?.toFixed(2)}</Text>  
                <Text style={styles.modalTexto}>Valor médio: R$ {dadosHistoricos.estatisticas?.vendas?.media_diaria?.toFixed(2)}</Text>  
                <Text style={styles.modalSecao}>📅 Período</Text>  
                <Text style={styles.modalTexto}>Período: {dadosHistoricos.estatisticas?.resumo_geral?.periodo_completo}</Text>  
                <Text style={styles.modalTexto}>Cobertura: {dadosHistoricos.estatisticas?.resumo_geral?.cobertura_temporal_dias} dias</Text>  
                <Text style={styles.modalSecao}>🎯 Qualidade do Modelo</Text>  
                <Text style={styles.modalTexto}>Adequado para previsão: {dadosHistoricos.estatisticas?.qualidade_dados?.adequado_para_previsao ? "✅ Sim" : "❌ Não"}</Text>  
                <Text style={styles.modalTexto}>Continuidade: {dadosHistoricos.estatisticas?.qualidade_dados?.continuidade_temporal}</Text>  
                <Text style={styles.modalTexto}>Variabilidade: {dadosHistoricos.estatisticas?.qualidade_dados?.variabilidade}</Text>  
              </ScrollView>  
            )}  
            <TouchableOpacity  
              style={styles.modalBotaoFechar}  
              onPress={() => setModalAnalise(false)}  
            >  
              <Text style={styles.modalBotaoTexto}>Fechar</Text>  
            </TouchableOpacity>  
          </View>  
        </View>  
      </Modal>  
    </ImageBackground>  
  );  
};
  
const styles = StyleSheet.create({  
  backgroundImage: {  
    flex: 1,  
    width: '100%',  
    height: '100%',  
  },  
  overlay: {  
    ...StyleSheet.absoluteFillObject,  
    backgroundColor: "rgba(255, 255, 255, 0.92)",  
  },  
  container: {  
    paddingBottom: 50,  
  },  
  header: {  
    backgroundColor: "#351B01",  
    paddingVertical: 15,  
    paddingHorizontal: 20,  
    flexDirection: "row",  
    alignItems: "center",  
    justifyContent: "space-between",  
  },  
  titulo: {  
    color: "#FFFFF2",  
    fontSize: 18,  
    fontWeight: "bold",  
  },  
  botoesAutomaticoContainer: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
    marginVertical: 15,  
    paddingHorizontal: 10,  
  },  
  botaoAutomatico: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingHorizontal: 12,  
    paddingVertical: 8,  
    borderRadius: 20,  
    gap: 5,  
  },  
  botaoAutomaticoPrimario: {  
    backgroundColor: "#351B01",  
  },  
  botaoAutomaticoSecundario: {  
    backgroundColor: "white",  
    borderWidth: 1,  
    borderColor: "#351B01",  
  },  
  textoBotaoAutomatico: {  
    color: "#FFFF2",  
    fontSize: 12,  
    fontWeight: "bold",  
  },  
  textoBotaoAutomaticoSecundario: {  
    color: "#351B01",  
    fontSize: 12,  
    fontWeight: "bold",  
  },  
  qualidadeContainer: {  
    margin: 20,  
    backgroundColor: "white",  
    padding: 15,  
    borderRadius: 10,  
    elevation: 2,  
  },  
  qualidadeTitulo: {  
    fontSize: 14,  
    fontWeight: "bold",  
    color: "#351B01",  
    marginBottom: 10,  
  },  
  qualidadeInfo: {  
    gap: 5,  
  },  
  qualidadeTexto: {  
    fontSize: 12,  
    color: "#351B01",  
  },  
  botoesContainer: {  
    flexDirection: "row",  
    justifyContent: "center",  
    gap: 10,  
    marginVertical: 20,  
  },  
  botaoPeriodo: {  
    paddingHorizontal: 20,  
    paddingVertical: 8,  
    borderRadius: 20,  
    borderWidth: 1,  
    borderColor: "#351B01",  
  },  
  botaoPeriodoAtivo: {  
    backgroundColor: "#351B01",  
  },  
  textoBotao: {  
    color: "#351B01",  
    fontSize: 14,  
  },  
  textoBotaoAtivo: {  
    color: "#FFFFF2",  
  },  
  loading: {  
    marginTop: 50,  
  },  
  resumoContainer: {  
    flexDirection: "row",  
    justifyContent: "space-around",  
    marginHorizontal: 20,  
    marginBottom: 20,  
  },  
  card: {  
    backgroundColor: "white",  
    padding: 15,  
    borderRadius: 10,  
    alignItems: "center",  
    elevation: 2,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    minWidth: 120,  
  },  
  cardTitulo: {  
    color: "#351B01",  
    fontSize: 12,  
    marginBottom: 5,  
  },  
  cardValor: {  
    color: "#351B01",  
    fontSize: 16,  
    fontWeight: "bold",  
  },  
  graficoContainer: {  
    margin: 20,  
    backgroundColor: "white",  
    padding: 15,  
    borderRadius: 10,  
    elevation: 2,  
  },  
  subtitulo: {  
    color: "#351B01",  
    fontSize: 16,  
    fontWeight: "bold",  
    marginBottom: 15,  
  },  
  listaContainer: {  
    margin: 20,  
    backgroundColor: "white",  
    padding: 15,  
    borderRadius: 10,  
    elevation: 2,  
  },  
  itemLista: {  
    flexDirection: "row",  
    justifyContent: "space-between",  
    paddingVertical: 8,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f0f0f0",  
  },  
  dataItem: {  
    color: "#351B01",  
    fontSize: 14,  
  },  
  valorItem: {  
    color: "#351B01",  
    fontSize: 14,  
    fontWeight: "bold",  
  },  
  modalContainer: {  
    flex: 1,  
    backgroundColor: "rgba(0,0,0,0.5)",  
    justifyContent: "center",  
    alignItems: "center",  
  },  
  modalContent: {  
    backgroundColor: "white",  
    margin: 20,  
    borderRadius: 10,  
    padding: 20,  
    maxHeight: "80%",  
    width: "90%",  
  },  
  modalTitulo: {  
    fontSize: 18,  
    fontWeight: "bold",  
    color: "#351B01",  
    marginBottom: 15,  
    textAlign: "center",  
  },  
  modalScroll: {  
    maxHeight: 300,  
  },  
  modalSecao: {  
    fontSize: 14,  
    fontWeight: "bold",  
    color: "#351B01",  
    marginTop: 15,  
    marginBottom: 5,  
  },  
  modalTexto: {  
    fontSize: 12,  
    color: "#351B01",  
    marginBottom: 3,  
  },  
  modalBotaoFechar: {  
    backgroundColor: "#351B01",  
    padding: 10,  
    borderRadius: 5,  
    marginTop: 15,  
    alignItems: "center",  
  },  
  modalBotaoTexto: {  
    color: "#FFFFF2",  
    fontWeight: "bold",  
  },  
});  
  
export default PrevisaoVendas;