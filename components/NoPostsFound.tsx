import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { COLORS } from "@/constants/theme";

const NoPostsFound = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet</Text>
    </View>
  );
};

export default NoPostsFound;
