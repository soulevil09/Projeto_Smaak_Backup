import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const Home = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.replace("/"); // Volta para a tela de login
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require('../assets/images/curva-top.png')}
          style={styles.curvaSuperior}
        />

        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="logout" size={28} color="#fffff2" />
          </TouchableOpacity>
        </View>

        {/* Seção Crepes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crepes</Text>
          <View style={styles.buttonRow}>
            <SectionButton
              label="Cadastrar crepe"
              icon="plus-box"
              onPress={() => router.push("/cadastrarProduto")}
            />
            <SectionButton
              label="Listar crepes"
              icon="format-list-bulleted"
              onPress={() => router.push("/listarProduto")}
            />
          </View>
        </View>

        {/* Seção Financeiro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financeiro</Text>
          <View style={styles.buttonRow}>
            <SectionButton
              label="Cadastrar compra"
              icon="cart-plus"
              onPress={() => router.push("/cadastrarCompra")}
            />
            <SectionButton
              label="Histórico de compra"
              icon="history"
              onPress={() => router.push("/historicoCompra")}
            />
            <SectionButton
              label="Relatório financeiro"
              icon="file-chart"
              onPress={() => router.push("/relatorioFinanceiro")}
            />
            <SectionButton
              label="Previsão de vendas"
              icon="chart-line"
              onPress={() => router.push("/previsaoVendas")}
            />
          </View>
        </View>

        {/* Seção Estoque */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estoque</Text>
          <View style={styles.buttonRow}>
            <SectionButton
              label="Cadastrar ingredientes"
              icon="plus-box-multiple"
              onPress={() => router.push("/cadastrarIngrediente")}
            />
            <SectionButton
              label="Listar ingredientes"
              icon="format-list-bulleted-square"
              onPress={() => router.push("/listarIngrediente")}
            />
            <SectionButton
              label="Histórico de consumo"
              icon="history"
              onPress={() => router.push("/")}
            />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

type SectionButtonProps = {
  label: string;
  icon: keyof typeof Icon.glyphMap; // <- Corrigido aqui
  onPress: () => void;
};

const SectionButton = ({ label, icon, onPress }: SectionButtonProps) => (
  <TouchableOpacity style={styles.sectionButton} onPress={onPress}>
    <Icon name={icon} size={32} color="#351B01" />
    <Text style={styles.buttonLabel}>{label}</Text>
  </TouchableOpacity>
);

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
  curvaSuperior: {
    width: "100%",
    height: height * 0.18,
    resizeMode: "stretch",
  },
  logoutContainer: {
    position: "absolute",
    top: 35,
    right: 20,
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  section: {
    backgroundColor: "rgba(53, 27, 1, 0.85)",
    margin: 20,
    borderRadius: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#fffff2",
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 15,
  },
  sectionButton: {
    backgroundColor: "#fffff2",
    width: 90,
    height: 90,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  buttonLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#351B01",
    marginTop: 5,
  },
});

export default Home;
