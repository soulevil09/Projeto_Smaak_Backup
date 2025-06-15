import React, { useState, useEffect } from "react";  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  ImageBackground,  
  ScrollView,  
  Dimensions,  
  StyleSheet,  
  ActivityIndicator,  
} from "react-native";  
import { PieChart } from "react-native-gifted-charts";  
import { Dropdown } from "react-native-element-dropdown";  
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";  
import { useRouter } from "expo-router";  
  
const { width, height } = Dimensions.get("window");  
  
const meses = [  
  { label: "Janeiro", value: "2025-01" },  
  { label: "Fevereiro", value: "2025-02" },  
  { label: "Março", value: "2025-03" },  
  { label: "Abril", value: "2025-04" },  
  { label: "Maio", value: "2025-05" },  
  { label: "Junho", value: "2025-06" },  
];  
  
const cores = [  
  "#351B01", "#5C3D1D", "#7B5226", "#A6703D", "#C88C54", "#E6B87A", "#FFD699"  
];  
  
const RelatorioFinanceiro = () => {  
  const router = useRouter();  
  const [mesSelecionado, setMesSelecionado] = useState(meses[0].value);  
  const [relatorio, setRelatorio] = useState(null);  
  const [loading, setLoading] = useState(false);  
  
  useEffect(() => {  
    setLoading(true);  
    fetch(`http://192.168.100.69:8000/relatorio-mensal/${mesSelecionado}`)  
    .then(res => res.json())  
    .then(data => {  
    setRelatorio(data);  
    setLoading(false);  
    })  
    .catch(err => {  
    setRelatorio(null);  
    setLoading(false);  
    });  
  }, [mesSelecionado]);  
  
  // Monta os dados do gráfico e tabela  
  const pieData = relatorio?.produtos_mais_vendidos?.slice(0, 5).map((item, idx) => ({  
    value: item.quantidade,  
    color: cores[idx % cores.length],  
    text: item.nome,  
    receita: item.receita,  
  })) || [];  
  
  const ganhos = relatorio?.total_receita || 0;  
  // Se quiser incluir despesas, busque de outro endpoint ou coleção  
  const despesas = 0;  
  const saldoLiquido = ganhos - despesas;
  return (  
    <ImageBackground  
    source={require("../assets/images/background.png")}  
    style={styles.backgroundImage}  
    >  
    <View style={styles.overlay} />  
  
    <ScrollView contentContainerStyle={styles.scrollContainer}>  
    {/* Topo */}  
    <View style={styles.topContainer}>  
    <TouchableOpacity onPress={() => router.back()}>  
    <Icon name="arrow-left" size={24} color="#FFFF2" />  
    </TouchableOpacity>  
  
    <View style={styles.topCenter}>  
    <Dropdown  
    style={styles.dropdown}  
    data={meses}  
    labelField="label"  
    valueField="value"  
    value={mesSelecionado}  
    placeholder={mesSelecionado}  
    placeholderStyle={styles.dropdownText}  
    selectedTextStyle={styles.dropdownText}  
    iconStyle={{ tintColor: "#FFFF2", width: 20, height: 20 }}  
    onChange={(item) => setMesSelecionado(item.value)}  
    />  
  
    <View style={styles.saldoContainer}>  
    <Text style={styles.saldoTitulo}>Saldo Líquido</Text>  
    <Text style={styles.saldoValor}>  
    R$ {saldoLiquido.toFixed(2).replace(".", ",")}  
    </Text>  
    </View>  
    </View>  
  
    <View style={{ width: 24 }} />  
    </View>  
  
    {/* Ganhos e Despesas */}  
    <View style={styles.ganhosDespesasContainer}>  
    <View style={styles.ganhosDespesasItem}>  
    <Icon name="trending-up" size={18} color="green" />  
    <Text style={styles.ganhosLabel}>Ganhos</Text>  
    <Text style={styles.ganhosValor}>  
    R$ {ganhos.toFixed(2).replace(".", ",")}  
    </Text>  
    </View>  
  
    <View style={styles.ganhosDespesasItem}>  
    <Icon name="trending-down" size={18} color="red" />  
    <Text style={styles.despesasLabel}>Despesas</Text>  
    <Text style={styles.despesasValor}>  
    R$ {despesas.toFixed(2).replace(".", ",")}  
    </Text>  
    </View>  
    </View>  
  
    {/* Gráfico com legenda */}  
    <Text style={styles.subtitulo}>Produtos mais vendidos</Text>  
    <View style={styles.graficoContainer}>  
    {loading ? (  
    <ActivityIndicator size="large" color="#351B01" />  
    ) : (  
    <>  
    <PieChart  
    data={pieData}  
    donut  
    radius={90}  
    innerRadius={60}  
    centerLabelComponent={() => (  
    <Text style={{ color: "#351B01", fontWeight: "bold" }}>  
    Top 5  
    </Text>  
    )}  
    />  
  
    <View style={styles.legendaContainer}>  
    {pieData.map((item, index) => (  
    <View key={index} style={styles.legendaItem}>  
    <View  
    style={[styles.legendaCor, { backgroundColor: item.color }]}  
    />  
    <Text style={styles.legendaTexto}>{item.text}</Text>  
    </View>  
    ))}  
    </View>  
    </>  
    )}  
    </View>  
  
    {/* Tabela */}  
    <Text style={styles.subtitulo}>Tabela detalhada</Text>  
    <View style={styles.tabela}>  
    <View style={styles.tabelaHeader}>  
    <Text style={styles.tabelaHeaderText}>Produto</Text>  
    <Text style={styles.tabelaHeaderText}>Vendidos</Text>  
    <Text style={styles.tabelaHeaderText}>Receita</Text>  
    </View>  
  
    {pieData.map((item, index) => (  
    <View key={index} style={styles.tabelaRow}>  
    <Text style={styles.tabelaCell}>{item.text}</Text>  
    <Text style={styles.tabelaCell}>{item.value}</Text>  
    <Text style={styles.tabelaCell}>  
    R$ {item.receita?.toFixed(2).replace(".", ",")}  
    </Text>  
    </View>  
    ))}  
    </View>  
    </ScrollView>  
    </ImageBackground>  
  );  
};

const styles = StyleSheet.create({
  backgroundImage: {
    width,
    height,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  topContainer: {
    backgroundColor: "#351B01",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topCenter: {
    alignItems: "center",
  },
  dropdown: {
    height: 30,
    width: 130,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFF2",
    marginTop: 20,
  },
  dropdownText: {
    color: "#FFFFF2",
    fontSize: 14,
  },
  saldoContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  saldoTitulo: {
    color: "#FFFFF2",
    fontSize: 14,
  },
  saldoValor: {
    color: "#FFFFF2",
    fontSize: 24,
    fontWeight: "bold",
  },
  ganhosDespesasContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  ganhosDespesasItem: {
    alignItems: "center",
  },
  ganhosLabel: {
    color: "#351B01",
    fontSize: 14,
  },
  ganhosValor: {
    color: "green",
    fontWeight: "bold",
    fontSize: 14,
  },
  despesasLabel: {
    color: "#351B01",
    fontSize: 14,
  },
  despesasValor: {
    color: "red",
    fontWeight: "bold",
    fontSize: 14,
  },
  subtitulo: {
    marginLeft: 20,
    marginTop: 20,
    fontSize: 16,
    color: "#351B01",
    fontWeight: "bold",
  },
  graficoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 10,
    alignItems: "center",
  },
  legendaContainer: {
    justifyContent: "center",
    gap: 8,
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendaCor: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendaTexto: {
    color: "#351B01",
    fontSize: 13,
  },
  tabela: {
    margin: 20,
    borderWidth: 1,
    borderColor: "#351B01",
  },
  tabelaHeader: {
    flexDirection: "row",
    backgroundColor: "#351B01",
  },
  tabelaHeaderText: {
    flex: 1,
    color: "#FFFFF2",
    padding: 8,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  tabelaRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#351B01",
  },
  tabelaCell: {
    flex: 1,
    padding: 8,
    color: "#351B01",
    textAlign: "center",
    fontSize: 13,
  },
});

export default RelatorioFinanceiro;