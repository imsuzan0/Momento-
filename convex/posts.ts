// Importing 'v' to define argument types and 'mutation/query' to define Convex server functions
import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { getAunthenticatedUser } from "./users";
import { Id } from "./_generated/dataModel";

// -------------------------
// Mutation: Generate Upload URL
// -------------------------
export const generateUploadUrl = mutation(async (ctx) => {
  // Get the currently logged-in user's identity using ctx.auth
  const identity = await ctx.auth.getUserIdentity();

  // If no identity (user not logged in), throw unauthorized error
  if (!identity) throw new Error("Unauthorized");

  // Generate a temporary upload URL for storing files on Convex storage
  return await ctx.storage.generateUploadUrl();
});

// -------------------------
// Mutation: Create a New Post
// -------------------------
export const createPost = mutation({
  // Defining the structure of input arguments for this mutation
  args: {
    caption: v.optional(v.string()), // Optional text caption for the post
    storageId: v.id("_storage"), // Required storage ID of the uploaded image
  },

  // Handler function for processing the post creation
  handler: async (ctx, args) => {
    // Get the identity of the currently logged-in user
    const identity = await ctx.auth.getUserIdentity();

    // If not logged in, throw an error
    if (!identity) throw new Error("Unauthorized");

    // Find the current user in "users" table using Clerk ID (identity.subject)
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // If no user is found in the database, throw an error
    if (!currentUser) throw new Error("User not found");

    // Fetch the public URL of the uploaded image using the storageId
    const imageUrl = await ctx.storage.getUrl(args.storageId);

    // If image URL is not found, throw an error
    if (!imageUrl) throw new Error("Image not found");

    // Insert a new post into the "posts" table
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id, // Reference to the user creating the post
      imageUrl, // Public URL of uploaded image
      storageId: args.storageId, // Storage ID of the image
      caption: args.caption, // Caption text (optional)
      likes: 0, // Initialize likes count
      comments: 0, // Initialize comments count
    });

    // Update user's post count by incrementing it by 1
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    // Return the newly created post's ID
    return postId;
  },
});

// -------------------------
// Query: Get Feed Posts
// -------------------------
export const getFeedPosts = query({
  handler: async (ctx) => {
    // Get the currently authenticated user
    const currentUser = await getAunthenticatedUser(ctx);

    // Fetch all posts from "posts" table in descending order (newest first)
    const posts = await ctx.db.query("posts").order("desc").collect();

    // If no posts exist, return empty array
    if (posts.length === 0) return [];

    // Enhance each post with author information and user interaction status
    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        // Get the author info from "users" table using post.userId
        const postAuthor = await ctx.db.get(post.userId);

        // Check if the current user has liked this post
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        // Check if the current user has bookmarked this post
        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        // Return the post enriched with author details and like/bookmark status
        return {
          ...post,
          author: {
            _id: postAuthor?._id,
            username: postAuthor?.username,
            image: postAuthor?.image,
          },
          isLiked: !!like, // true if post is liked by current user
          isBookmarked: !!bookmark, // true if post is bookmarked by current user
        };
      })
    );

    // Return the final feed with all enhanced posts
    return postsWithInfo;
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Get the currently authenticated user
    const currentUser = await getAunthenticatedUser(ctx);

    // Check if the current user has already liked the post
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existingLike) {
      //remove like
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false; //unlike
    } else {
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      //if this is not my post then create a notification

      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: args.postId,
        });
      }

      return true;
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAunthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);

    if (!post) throw new Error("Post not found");

    //verify ownership
    if (post.userId !== currentUser._id)
      throw new Error("Not authorized to delete this post");

    //delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    //delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    //delete associated bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    //delete associated notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    //delete the storage file
    await ctx.storage.delete(post.storageId);

    //delete the post
    await ctx.db.delete(args.postId);

    //decrement user's postcount by 1
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, 2),
    });
  },
});

export const getPostsByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = (await args.userId)
      ? await ctx.db.get(args.userId)
      : await getAunthenticatedUser(ctx);

    if (!user) throw new Error("User not found");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id || args.userId))
      .collect();

    return posts;
  },
});

export const getUserProfile = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");
    return user;
  },
});

export const isFollow = query({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAunthenticatedUser(ctx);

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    return !!follow;
  },
});

export const toogleFollow = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAunthenticatedUser(ctx);

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      //unfollow
      await ctx.db.delete(existing._id);
      await updateFollowCount(ctx, currentUser._id, args.followingId, false);
    } else {
      //follow
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.followingId,
      });
      await updateFollowCount(ctx, currentUser._id, args.followingId, true);

      //create a notification
      await ctx.db.insert("notifications",{
        receiverId: args.followingId,
        senderId: currentUser._id,
        type: "follow",
      })
    }
  },
});

async function updateFollowCount(
  ctx:MutationCtx,
  followerId:Id<"users">,
  followingId:Id<"users">,
  isFollow:boolean
) {
    const follower=await ctx.db.get(followerId)
    const following=await ctx.db.get(followingId)

    if(follower && following){
      await ctx.db.patch(followerId,{
        following:follower.following+(isFollow?1:-1)
      })

      await ctx.db.patch(followingId,{
        followers:following.followers+(isFollow?1:-1)
      })
    }
}
