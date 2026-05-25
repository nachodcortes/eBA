import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { EyeOff } from "lucide-react-native";

export default function RegisterScreen() {
  const params = useLocalSearchParams();

  const intereses = params.intereses
    ? JSON.parse(params.intereses as string)
    : [];

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [edad, setEdad] = useState("");
  const [ciudad, setCiudad] = useState("Buenos Aires");
  const [pais, setPais] = useState("Argentina");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");

  const handleRegister = () => {
    const nuevoUsuario = {
      nombre,
      email,
      edad: Number(edad),
      ubicacionAproximada: {
        ciudad,
        pais,
      },
      bio,
      instagram,
      fotoPerfil,
      intereses,
      contrasenia,
    };

    console.log("Usuario a registrar:", nuevoUsuario);

    /*
    Más adelante, cuando conectemos el backend:

    fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoUsuario),
    });
    */

    Alert.alert("Registro", "Usuario creado correctamente");
    router.replace("/home" as any);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Image
          source={{ uri: "https://i.imgur.com/Oi6Zc3K.png" }}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Registrate <Text style={styles.dark}>a eBA</Text>
        </Text>

        <Text style={styles.subtitle}>
          Último paso para empezar a conectar.
        </Text>

        <View style={styles.selectedBox}>
          <Text style={styles.selectedTitle}>Intereses elegidos</Text>
          <Text style={styles.selectedText}>
            {intereses.length > 0 ? intereses.join(", ") : "Sin intereses"}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            placeholder="Natalia Favre"
            placeholderTextColor="#A8A5B3"
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="natalia@gmail.com"
            placeholderTextColor="#A8A5B3"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordBox}>
            <TextInput
              placeholder="Creá una contraseña"
              placeholderTextColor="#A8A5B3"
              secureTextEntry
              style={styles.passwordInput}
              value={contrasenia}
              onChangeText={setContrasenia}
            />
            <EyeOff size={18} color="#A8A5B3" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Edad</Text>
          <TextInput
            placeholder="21"
            placeholderTextColor="#A8A5B3"
            style={styles.input}
            value={edad}
            onChangeText={setEdad}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              placeholder="Buenos Aires"
              placeholderTextColor="#A8A5B3"
              style={styles.input}
              value={ciudad}
              onChangeText={setCiudad}
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>País</Text>
            <TextInput
              placeholder="Argentina"
              placeholderTextColor="#A8A5B3"
              style={styles.input}
              value={pais}
              onChangeText={setPais}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            placeholder="Me gusta salir a recitales y eventos techno"
            placeholderTextColor="#A8A5B3"
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Instagram</Text>
          <TextInput
            placeholder="@natifavre"
            placeholderTextColor="#A8A5B3"
            style={styles.input}
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Foto de perfil URL</Text>
          <TextInput
            placeholder="https://imageurl.com/profile.jpg"
            placeholderTextColor="#A8A5B3"
            style={styles.input}
            value={fotoPerfil}
            onChangeText={setFotoPerfil}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryText}>Volver a intereses</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.smallText}>¿Ya tenés cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/login" as any)}>
            <Text style={styles.loginLink}>Iniciá sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },
  container: {
    paddingHorizontal: 34,
    paddingTop: 52,
    paddingBottom: 50,
  },
  logo: {
    width: 120,
    height: 80,
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#4DA7FF",
    textAlign: "center",
    marginBottom: 8,
  },
  dark: {
    color: "#332047",
  },
  subtitle: {
    fontSize: 13,
    color: "#8D8A99",
    textAlign: "center",
    marginBottom: 22,
  },
  selectedBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E2DDF0",
  },
  selectedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#332047",
    marginBottom: 5,
  },
  selectedText: {
    fontSize: 13,
    color: "#8D8A99",
    lineHeight: 19,
  },
  field: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D2934",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8D5E2",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#332047",
    backgroundColor: "#FAFAFF",
    outlineStyle: "none" as any,
  },
  passwordBox: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8D5E2",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFF",
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#332047",
    outlineStyle: "none" as any,
  },
  row: {
    flexDirection: "row",
  },
  halfField: {
    flex: 1,
    marginRight: 10,
  },
  bioInput: {
    height: 86,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: "#7528F0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    marginBottom: 18,
  },
  secondaryText: {
    color: "#3A2451",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  smallText: {
    color: "#9A98A6",
    fontSize: 13,
  },
  loginLink: {
    color: "#7528F0",
    fontSize: 13,
    fontWeight: "800",
  },
});