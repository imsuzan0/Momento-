import { styles } from "@/styles/feed.style";
import { Image, View, Text } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { MaterialIcons } from "@expo/vector-icons";

interface Comment {
  content: string;
  _creationTime: number;
  user: {
    fullname: string | undefined;
    image: string | undefined;
    username: string | undefined;
  };
}

const Comment = ({ comment }: { comment: Comment }) => {
  console.log(comment.user.username);
  return (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: comment.user.image }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.fullname}</Text>\
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
};

export default Comment;
