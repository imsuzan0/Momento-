import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/auth.style";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Image } from "react-native";
import { useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

const login = () => {

  const {startSSOFlow}=useSSO()
  const router=useRouter()
  const handleGoogleSignIn=async()=>{
    try {
      const {createdSessionId,setActive}=await startSSOFlow({strategy:"oauth_google"})

      if(setActive && createdSessionId){
        setActive({session:createdSessionId})
        router.replace("/(tabs)")
      }
    } catch (error) {
      console.log("OAuth Error:",error)
    }
  }

  return (
    <View style={styles.container}>

      {/* Brand Section */}

      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>Momento</Text>
        <Text style={styles.tagline}>Don't miss anything</Text>
      </View>
      <View style={styles.illustrationContainer}>
        <Image
          source={require("@/assets/images/auth-bg.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Login Section */}

      <View style={styles.loginSection}>
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          style={styles.googleButton}
          activeOpacity={0.9}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

export default login;
