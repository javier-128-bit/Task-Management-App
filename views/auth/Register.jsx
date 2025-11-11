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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { auth } from "../../Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState, useCallback, useMemo } from "react";
import Toast from "react-native-toast-message";

const Register = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const inputWidth = Math.min(screenWidth - 40, 400);
  const titleFontSize = Math.min(screenWidth * 0.075, 30);
  const subtitleFontSize = Math.min(screenWidth * 0.04, 16);
  const inputFontSize = Math.min(screenWidth * 0.04, 16);
  const buttonWidth = Math.min(screenWidth * 0.5, 200);

  const validateEmail = useCallback((email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  const passwordStrength = useMemo(() => {
    if (!password) return { text: "", color: "" };
    if (password.length < 6) return { text: "Lemah", color: "#FF6B6B" };
    if (password.length < 8) return { text: "Sedang", color: "#FFA500" };
    return { text: "Kuat", color: "#51CF66" };
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleRegister = useCallback(
    async (email, password, confirmPassword) => {
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        Toast.show({
          type: "error",
          text1: "Gagal",
          text2: "Semua field harus diisi",
          visibilityTime: 2000,
        });
        return;
      }

      if (!validateEmail(email)) {
        Toast.show({
          type: "error",
          text1: "Gagal",
          text2: "Format email tidak valid",
          visibilityTime: 2000,
        });
        return;
      }

      if (password.length < 6) {
        Toast.show({
          type: "error",
          text1: "Gagal",
          text2: "Password minimal 6 karakter",
          visibilityTime: 2000,
        });
        return;
      }

      if (password !== confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Gagal",
          text2: "Password dan Konfirmasi Password tidak sama",
          visibilityTime: 2000,
        });
        return;
      }

      setLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        Toast.show({
          type: "success",
          text1: "Sukses",
          text2: "Akun berhasil dibuat",
          visibilityTime: 2000,
        });
        navigation.navigate("Login");
      } catch (error) {
        let errorMessage = "Gagal membuat akun";

        if (error.code === "auth/email-already-in-use") {
          errorMessage = "Email sudah terdaftar";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "Format email tidak valid";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "Password terlalu lemah";
        } else if (error.code === "auth/network-request-failed") {
          errorMessage = "Koneksi internet bermasalah";
        }

        Toast.show({
          type: "error",
          text1: "Gagal",
          text2: errorMessage,
          visibilityTime: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    [validateEmail, navigation]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
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
          paddingHorizontal: 20,
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
              marginBottom: Math.min(screenHeight * 0.06, 50),
              color: "#333",
              textAlign: "center",
            }}
          >
            DAFTARKAN AKUNMU DISINI
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
                paddingHorizontal: 15,
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

            <View style={{ alignSelf: "center", width: inputWidth }}>
              <View
                style={{
                  backgroundColor: "#F5F5F5",
                  padding: 7,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                }}
              >
                <FontAwesome name="lock" size={24} color="#7CB9E8" />
                <TextInput
                  placeholder="Password (min. 6 karakter)"
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
              {password.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                    paddingHorizontal: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: passwordStrength.color,
                      fontWeight: "600",
                    }}
                  >
                    Kekuatan: {passwordStrength.text}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ alignSelf: "center", width: inputWidth }}>
              <View
                style={{
                  backgroundColor: "#F5F5F5",
                  padding: 7,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: passwordsMatch === false ? "#FF6B6B" : "#E0E0E0",
                }}
              >
                <MaterialIcons name="password" size={24} color="#7CB9E8" />
                <TextInput
                  placeholder="Konfirmasi Password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
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
                  onPress={toggleConfirmPasswordVisibility}
                  disabled={loading}
                  style={{ padding: 5 }}
                >
                  <FontAwesome
                    name={showConfirmPassword ? "eye" : "eye-slash"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                    paddingHorizontal: 5,
                  }}
                >
                  {passwordsMatch ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#51CF66",
                        fontWeight: "600",
                      }}
                    >
                      ✓ Password cocok
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#FF6B6B",
                        fontWeight: "600",
                      }}
                    >
                      ✗ Password tidak cocok
                    </Text>
                  )}
                </View>
              )}
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
            onPress={() => handleRegister(email, password, confirmPassword)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Daftarkan
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
              Sudah punya akun?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              disabled={loading}
            >
              <Text
                style={{
                  color: "#7CB9E8",
                  fontWeight: "600",
                  fontSize: Math.min(screenWidth * 0.035, 14),
                }}
              >
                Masuk disini
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default Register;
