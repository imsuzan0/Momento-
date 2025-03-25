import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/feed.style";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import NoPostsFound from "@/components/NoPostsFound";
import Post from "@/components/Post";

const index = () => {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);


  const posts = useQuery(api.posts.getFeedPosts);

  if (posts === undefined) return <Loader />;

  if (posts.length === 0) return <NoPostsFound />;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Momento-</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      {/* FlatList for posts with stories as header */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
};

export default index;
