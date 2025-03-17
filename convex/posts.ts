// Importing 'v' to define argument types and 'mutation' to define Convex server functions
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// -------------------------
// Generate Upload URL Mutation
// -------------------------
export const generateUploadUrl = mutation(async (ctx) => {
  // Get the currently logged-in user's identity
  const identity = await ctx.auth.getUserIdentity();

  // If user is not logged in, throw an error
  if (!identity) throw new Error("Unauthorized");

  // Generate and return a temporary URL to upload files to Convex storage
  return await ctx.storage.generateUploadUrl();
});

// -------------------------
// Create Post Mutation
// -------------------------
export const createPost = mutation({
  // Define the input arguments for this mutation
  args: {
    caption: v.optional(v.string()),      // Optional text caption for the post
    storageId: v.id("_storage"),          // Required ID of the uploaded image from Convex storage
  },

  // Handler function to process the mutation
  handler: async (ctx, args) => {
    // Get the logged-in user's identity
    const identity = await ctx.auth.getUserIdentity();

    // If user is not logged in, throw an error
    if (!identity) throw new Error("Unauthorized");

    // Find the current user in the "users" table by matching their Clerk ID
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // If user is not found in the database, throw an error
    if (!currentUser) throw new Error("User not found");

    // Get the public URL of the uploaded image using the storage ID
    const imageUrl = await ctx.storage.getUrl(args.storageId);

    // If image URL is not found, throw an error
    if (!imageUrl) throw new Error("Image not found");

    // Insert a new post into the "posts" table
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,       // Reference to the user who created the post
      imageUrl,                      // URL of the uploaded image
      storageId: args.storageId,     // ID of the image in storage
      caption: args.caption,         // Caption for the post (optional)
      likes: 0,                      // Initialize likes count to 0
      comments: 0,                   // Initialize comments count to 0
    });

    // Update the user's profile to increment their post count by 1
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    // Return the ID of the newly created post
    return postId;
  },
});
