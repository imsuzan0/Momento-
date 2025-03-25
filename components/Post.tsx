import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "@/styles/feed.style";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CommentsModal from "./CommentsModal";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-expo";

type PostProps = {
  post: {
    _id: Id<"posts">;
    _creationTime: number;
    caption?: string;
    imageUrl: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
};

const Post = ({ post }: PostProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  // const [likesCount, setLikesCount] = useState(post.likes);
  // const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComment, setShowComment] = useState(false);

  const { user } = useUser(); //=>this user is stored in clerk

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  ); //=>this user is stored in convex(database)

  const toogleLike = useMutation(api.posts.toggleLike);
  const toogleBookmark = useMutation(api.bookmarks.toogleBookmark);
  const deletePost = useMutation(api.posts.deletePost);
  const handleLike = async () => {
    try {
      const newisLiked = await toogleLike({ postId: post._id });
      setIsLiked(newisLiked);
    } catch (error) {
      console.log("Error toggling like:", error);
    }
  };


  const handleBookmark = async () => {
    try {
      const newIsBookmark = await toogleBookmark({ postId: post._id });
      setIsBookmarked(newIsBookmark);
    } catch (error) {}
  };

  const handleDeletePost=async()=>{
    try {
      await deletePost({postId:post._id})
    } catch (error) {
      console.log("Error deleting post:",error)
    }
  }

  return (
    <View style={styles.post}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Link href={
          post.author._id === currentUser?._id
            ? "/(tabs)/profile"
            : `/user/${post.author._id}`
        }
        asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cache-policy="memory-disk"
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>

        {/* If i'm the owener of the post, show the delete button */}
        {post.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleDeletePost}>
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Image  */}
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cache-policy="memory-disk"
      />

      {/* Post Actions  */}

      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowComment(true)}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* Post Info  */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes > 0
            ? `${post.likes.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComment(true)}>
            <Text style={styles.commentsText}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComment}
        onClose={() => setShowComment(false)}
      />
    </View>
  );
};

export default Post;
