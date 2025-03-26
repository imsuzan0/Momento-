import { View, Text, TouchableOpacity, ScrollView, Pressable, FlatList } from 'react-native'
import React from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Id } from '@/convex/_generated/dataModel'
import Loader from '@/components/Loader'
import { styles } from '@/styles/profile.style'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { Image } from 'expo-image'

const UserProfileScreen = () => {

    const router=useRouter()

    const {id}=useLocalSearchParams()
    const profile=useQuery(api.users.getUserProfile,{id:id as Id<"users">})
    const posts=useQuery(api.posts.getPostsByUser,{userId:id as Id<"users">})
    const isFollowing=useQuery(api.users.isFollow,{followingId:id as Id<"users">})

    const toogleFollow=useMutation(api.users.toogleFollow)

    const handleBack=()=>{
        if(router.canGoBack()) router.back()
        else router.replace("/(tabs)")
    }

    if(profile===undefined || posts===undefined || isFollowing===undefined) return <Loader/>

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
                <Ionicons name='arrow-back' size={24} color={COLORS.white}/>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{profile.username}</Text>
            <View style={{width:24}}/>
        </View>
        <ScrollView
        showsVerticalScrollIndicator={false}
        >
            <View style={styles.profileInfo}>
                <View style={styles.avatarAndStats}>
                    {/* Avatar  */}
                    <Image
                    source={profile.image}
                    style={styles.avatar}
                    cachePolicy="memory-disk"
                    contentFit='cover'
                    />

                    {/* Stats  */}

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.posts}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.followers}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.following}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.name}>{profile.fullname}</Text>
                {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                <Pressable
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={()=>toogleFollow({followingId:id as Id<"users">})}
                >
                    <Text style={[styles.followButtonText,isFollowing && styles.followingButtonText]}>
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Text>
                </Pressable>
            
            </View>
            <View style={styles.postsGrid}>
                {posts.length===0 ? (
                    <View style={styles.noPostsContainer}>
                        <Ionicons name="images-outline" size={48} color={COLORS.primary}/>
                        <Text style={styles.noPostsText}>No posts yet...</Text>
                    </View>
                ):(
                    <FlatList
                    data={posts}
                    numColumns={3}
                    scrollEnabled={false}
                    renderItem={({item})=>(
                        <TouchableOpacity
                        style={styles.gridItem}
                        >
                            <Image
                            style={{width:"100%",aspectRatio:1,flex:1,padding:1}}
                            source={item.imageUrl}
                            contentFit='cover'
                            cachePolicy="memory-disk"
                            />
                        </TouchableOpacity>
                    )}
                    />
                )}
            </View>
        </ScrollView>
    </View>
  )
}

export default UserProfileScreen