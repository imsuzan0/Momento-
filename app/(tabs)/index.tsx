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
import { Image } from "expo-image";
import NoUsersFound from "@/components/NoUsersFound";
import { Link } from "expo-router";

const index = () => {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible,setModalVisible]=useState(false)
  const [searchText,setSearchText]=useState("")


  const posts = useQuery(api.posts.getFeedPosts);
  const users = useQuery(
    api.users.searchUsers,
    searchText.trim() ? { searchText } : "skip"
  );
  
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
          <TouchableOpacity onPress={()=>setModalVisible(true)}>
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

      {/* Search Modal  */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Users</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Search username..."
            placeholderTextColor={COLORS.grey}
            value={searchText}
            onChangeText={setSearchText}
          />

          {users && users.length > 0 ? (
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Link 
                href={`/user/${item._id}`} asChild
                >
                <TouchableOpacity style={styles.commentContainer}>
                  <Image
                  source={item.image}
                  style={styles.postAvatar}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                  />
                  <Text style={styles.searchUsername}>{item.username}</Text>
                </TouchableOpacity>
                </Link>
              )}
            />
          ) : (
            <NoUsersFound/>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default index;