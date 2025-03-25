import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { styles } from "@/styles/notification.style";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const notifications = useQuery(api.notications.getNotifications);

  if (notifications === undefined) return <Loader />;

  if (notifications.length === 0) return <NoNotificationsFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem notication={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default Notifications;

const NoNotificationsFound = () => {
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.white }}>
        No notifications yet...
      </Text>
    </View>
  );
};

const NotificationItem = ({ notication }: any) => {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        
        <Link href={`/user/${notication.sender._id}`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={notication.sender.image}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.iconBadge}>
              {notication.type === "like" ? (
                <Ionicons name="heart" size={14} color={COLORS.primary} />
              ) : notication.type === "follow" ? (
                <Ionicons name="person-add" size={14} color="#8B5CF6" />
              ) : (
                <Ionicons name="chatbubble" size={14} color="#3B82F6" />
              )}
            </View>
          </TouchableOpacity>
        </Link>
        <View style={styles.notificationInfo}>
        <Link href={`/user/${notication.sender._id}`} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>{notication.sender.username}</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.action}>
            {notication.type === "follow"
              ? "started following you"
              : notication.type === "like"
                ? "liked your post"
                : `commented: "${notication.comment}"`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notication._creationTime, { addSuffix: true })}
          </Text>
        </View>
      </View>

      {notication.post && (
        <Image
          source={notication.post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
};
