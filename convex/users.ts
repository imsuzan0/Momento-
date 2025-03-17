import { v } from "convex/values"
import {mutation} from "./_generated/server"

export const createUser=mutation({
    args:{
        username:v.string(),
        fullname:v.string(),
        image:v.string(),
        bio:v.optional(v.string()),
        email:v.string(),
        clerkId:v.string(),
    },
        /**
         * Creates a new user in the convex db with the given info
         * If a user with the given clerkId already exists, does nothing
         * @param ctx - Convex context
         * @param args - User info to create a new user
         */
    handler:async (ctx,args)=>{

        const existingUser=await ctx.db.query("users")
        .withIndex("by_clerk_id",(q)=>q.eq("clerkId",args.clerkId))
        .first()

        if(existingUser) return 

        //create a user in db
        await ctx.db.insert("users",{
            username:args.username,
            fullname:args.fullname,
            image:args.image,
            bio:args.bio,
            email:args.email,
            clerkId:args.clerkId,
            followers:0,
            following:0,
            posts:0
        })
    }
})