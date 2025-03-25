import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },
  /**
   * Creates a new user in the convex db with the given info
   * If a user with the given clerkId already exists, does nothing
   * @param ctx - Convex context
   * @param args - User info to create a new user
   */
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) return;

    //create a user in db
    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      image: args.image,
      bio: args.bio,
      email: args.email,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});

export async function getAunthenticatedUser(ctx: QueryCtx | MutationCtx) {
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

  return currentUser;
}

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return user;
  },
});

export const updateProfile=mutation({
  args:{
    fullname:v.string(),
    bio:v.optional(v.string())
  },
  handler:async (ctx,args)=>{
    const currentUser=await getAunthenticatedUser(ctx)

    await ctx.db.patch(currentUser._id,{
      fullname:args.fullname,
      bio:args.bio,
    })
  }
})

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

