import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState, useCallback } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase";
import Toast from "react-native-toast-message";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const inputWidth = Math.min(screenWidth - 40, 400);
  const titleFontSize = Math.min(screenWidth * 0.075, 30);
  const subtitleFontSize = Math.min(screenWidth * 0.04, 16);
  const inputFontSize = Math.min(screenWidth * 0.04, 16);
  const buttonWidth = Math.min(screenWidth * 0.5, 200);

  const handleLogin = useCallback(async (email, password) => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Email dan Password harus diisi",
        visibilityTime: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.show({
        type: "success",
        text1: "Mantap!",
        text2: "Berhasil Login",
        visibilityTime: 2000,
      });
    } catch (error) {
      let errorMessage = "Password dan Email tidak cocok";

      if (error.code === "auth/invalid-email") {
        errorMessage = "Format email tidak valid";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Akun tidak ditemukan";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Password salah";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Terlalu banyak percobaan. Coba lagi nanti";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Koneksi internet bermasalah";
      }

      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: errorMessage,
        visibilityTime: 3000,
      });
      setEmail("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: Math.min(screenHeight * 0.05, 50),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: titleFontSize,
              fontWeight: "bold",
              color: "#7CB9E8",
              marginBottom: 10,
              textAlign: "center",
              paddingHorizontal: 10,
            }}
          >
            Task Management App
          </Text>
          <Text
            style={{
              fontSize: subtitleFontSize,
              fontWeight: "600",
              marginTop: 10,
              marginBottom: Math.min(screenHeight * 0.08, 60),
              color: "#333",
            }}
          >
            LOGIN AKUN
          </Text>

          <View style={{ gap: 20, marginBottom: 30, width: "100%" }}>
            <View
              style={{
                backgroundColor: "#F5F5F5",
                padding: 7,
                borderRadius: 10,
                width: inputWidth,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                alignSelf: "center",
              }}
            >
              <MaterialCommunityIcons name="email" size={24} color="#7CB9E8" />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={{
                  flex: 1,
                  fontSize: inputFontSize,
                  color: "#333",
                }}
              />
            </View>

            <View
              style={{
                backgroundColor: "#F5F5F5",
                padding: 7,
                borderRadius: 10,
                width: inputWidth,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                alignSelf: "center",
              }}
            >
              <FontAwesome name="lock" size={24} color="#7CB9E8" />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={{
                  flex: 1,
                  fontSize: inputFontSize,
                  color: "#333",
                }}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                disabled={loading}
                style={{ padding: 5 }}
              >
                <FontAwesome
                  name={showPassword ? "eye" : "eye-slash"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: loading ? "#A0D9F0" : "#7CB9E8",
              padding: 12,
              borderRadius: 10,
              width: buttonWidth,
              alignItems: "center",
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }}
            onPress={() => handleLogin(email, password)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Login
              </Text>
            )}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
              marginTop: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#666",
                fontWeight: "600",
                fontSize: Math.min(screenWidth * 0.035, 14),
              }}
            >
              Belum punya akun?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              disabled={loading}
            >
              <Text
                style={{
                  color: "#7CB9E8",
                  fontWeight: "600",
                  fontSize: Math.min(screenWidth * 0.035, 14),
                }}
              >
                Daftar disini
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default Login;
