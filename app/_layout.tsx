// import { Stack } from "expo-router";
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// export default function RootLayout() {
//   return (
//     <SafeAreaProvider>
//       <SafeAreaView style={{flex:1,backgroundColor:"#fff"}}>
//       <Stack screenOptions={{headerShown:false}}/>
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, Platform, View } from "react-native";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { SplashScreen } from "expo-router";
import {useFonts} from "expo-font"
import { useCallback } from "react";

SplashScreen.preventAutoHideAsync()


export default function RootLayout() {
  const [fontsLoaded]=useFonts({
    "JetBrainsMono-Medium":require("../assets/fonts/JetBrainsMono-Medium.ttf")
  })

  const onLayoutRootView =useCallback(async()=>{

    if(fontsLoaded) SplashScreen.hideAsync()
  },[fontsLoaded])

  return (
    <ClerkAndConvexProvider>
        <SafeAreaProvider>
          {/* Set StatusBar settings */}
          <StatusBar
            backgroundColor="black" // Android only
            barStyle="light-content" // Light icons (time/battery) on both platforms
            translucent={Platform.OS === "android"} // Allows content to go behind StatusBar on Android
          />

          {/* View behind status bar for iOS to show black color */}
          {Platform.OS === "ios" && (
            <View style={{ backgroundColor: "black" }} />
          )}

          <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} onLayout={onLayoutRootView}>
            <InitialLayout/>
          </SafeAreaView>
        </SafeAreaProvider>
        </ClerkAndConvexProvider>

  );
}
