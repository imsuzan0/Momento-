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

import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, Platform, View } from "react-native";
import { tokenCache } from "@/cache";
import InitialLayout from "@/components/InitialLayout";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
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

          <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <InitialLayout/>
          </SafeAreaView>
        </SafeAreaProvider>
       </ClerkLoaded>
     </ClerkProvider>
  );
}
