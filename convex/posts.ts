// Importing 'v' to define argument types and 'mutation/query' to define Convex server functions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAunthenticatedUser } from "./users";

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
      userId: currentUser._id,     // Reference to the user creating the post
      imageUrl,                    // Public URL of uploaded image
      storageId: args.storageId,   // Storage ID of the image
      caption: args.caption,       // Caption text (optional)
      likes: 0,                    // Initialize likes count
      comments: 0,                 // Initialize comments count
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
          isLiked: !!like,           // true if post is liked by current user
          isBookmarked: !!bookmark, // true if post is bookmarked by current user
        };
      })
    );

    // Return the final feed with all enhanced posts
    return postsWithInfo;
  },
});
