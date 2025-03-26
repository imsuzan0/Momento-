import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

const NoUsersFound = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
        <Ionicons name="person-add-outline" size={24} color={COLORS.primary} style={{marginBottom: 8}} />
      <Text style={{ fontSize: 20, color: COLORS.primary }}> No users found</Text>
    </View>
  );
};

export default NoUsersFound;
