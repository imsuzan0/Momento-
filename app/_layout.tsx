import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, Platform, View } from "react-native";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useCallback, useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, [Platform.OS]);

  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded]);

  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <StatusBar
          backgroundColor="black"
          barStyle="light-content"
          translucent={Platform.OS === "android"}
        />
        
        {/* Background View for iOS */}
        {Platform.OS === "ios" && <View style={{ backgroundColor: "black", height: 44 }} />}

        <SafeAreaView
          style={{ flex: 1, backgroundColor: "black" }}
          onLayout={onLayoutRootView}
        >
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
