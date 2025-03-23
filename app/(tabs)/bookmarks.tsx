import { View, Text, Pressable, FlatList } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { styles } from "@/styles/feed.style";
import { Image } from "expo-image";


const Bookmarks = () => {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPost);

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {/* Posts using FlatList */}
      <FlatList
        data={bookmarkedPosts}
        keyExtractor={(item) => item._id}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 8 }}
        columnWrapperStyle={{ gap: 2, marginBottom: 2 }}
        renderItem={({ item }) => {
          if (!item) return null;
          return (
            <View style={{ flex: 1 / 3, padding: 1 }}>
              <Image
                source={item.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default Bookmarks;

const NoBookmarksFound = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ color: COLORS.primary, fontSize: 22 }}>
        No bookmarked post yet...
      </Text>
      <Pressable onPress={handleRedirect}>
        <Text
          style={{
            color: COLORS.primary,
            textDecorationLine: "underline",
            marginTop: 16,
          }}
        >
          Explore posts and start bookmarking!
        </Text>
      </Pressable>
    </View>
  );
};
