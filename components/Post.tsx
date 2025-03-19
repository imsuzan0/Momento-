import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from '@/styles/feed.style'
import { Link } from 'expo-router'
import { Image } from 'expo-image'


const Post = ({post}:{post:any}) => {

  return (
    <View style={styles.post}>
        {/* Post Header */}
        <View style={styles.postHeader}>
            <Link href={"/(tabs)/notification"}>
            <TouchableOpacity
            style={styles.postHeaderLeft}
            >
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
            
        </View>
    </View>
  )
}

export default Post