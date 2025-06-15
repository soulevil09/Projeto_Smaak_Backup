// app/compras/sucesso.tsx
import { View, Text, ImageBackground, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function Sucesso() {
  const router = useRouter();

  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.backgroundImage}>
      <View style={styles.overlay} />
      <Pressable style={styles.close} onPress={() => router.replace('/home')}>
        <X size={24} color="#351B01" />
      </Pressable>
      <View style={styles.container}>
        <Text style={styles.title}>Pagamento{'\n'}Realizado com sucesso!</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/cadastrarCompra')}>
          <Text style={styles.buttonText}>Nova compra</Text>
        </Pressable>
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
  close: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#351B01',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#351B01',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
