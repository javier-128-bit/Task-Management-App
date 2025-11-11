import { View, Text, Image, Dimensions, ActivityIndicator } from "react-native";
import { StackActions } from "@react-navigation/native";
import Splashscreen from "../assets/Splashscreen.png";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase";

const Splash = ({ navigation }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const imageSize = Math.min(screenWidth * 0.5, 200);

  const titleFontSize = Math.min(screenWidth * 0.06, 24);
  const subtitleFontSize = Math.min(screenWidth * 0.03, 12);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setTimeout(() => {
        setAuthChecked(true);

        if (navigation) {
          if (currentUser) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        }
      }, 1500);
    });

    return () => unsubscribe();
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        paddingHorizontal: 20,
      }}
    >
      <Image
        source={Splashscreen}
        style={{
          width: imageSize,
          height: imageSize,
          resizeMode: "contain",
        }}
      />
      <Text
        style={{
          marginTop: Math.min(screenHeight * 0.02, 20),
          color: "#7CB9E8",
          fontSize: titleFontSize,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Task Management App
      </Text>
      <Text
        style={{
          marginTop: 5,
          fontWeight: "500",
          fontSize: subtitleFontSize,
          textAlign: "center",
          color: "#666",
        }}
      >
        By Mochamad Javier Elsyera
      </Text>

      <ActivityIndicator
        size="small"
        color="#7CB9E8"
        style={{ marginTop: Math.min(screenHeight * 0.04, 30) }}
      />
    </View>
  );
};

export default Splash;
