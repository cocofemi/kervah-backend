import { Group } from "../../models/groups.model";
import { User } from "../../models/user.model";
import { Course } from "../../models/course.model";
import { Types } from "mongoose";
import { checkBusinessPermission } from "../../utils/checkBusinessPermision";
import { IGroup } from "../../interfaces/groups.types";

interface Context {
   auth: boolean;
   user?:  string;
}

export const groupResolver = {
    Query: {
        groupsByUser: async (_: any, {userId, businessId }: any, ctx: Context) => {
          if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
              const currentUserId = ctx.user;
          // await checkBusinessPermission(businessId, currentUserId, ["admin", "member"]);
          return await Group.find({ business: businessId, members: userId })
              .populate("members", "id name email")
              .populate("courses", "id title description duration category thumbnail")
        },

        groupsByBusiness: async (_: any, { businessId }: any, ctx: Context) => {
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user;
        await checkBusinessPermission(businessId, currentUserId, ["admin", "member", "super-admin"]);
        return await Group.find({ business: businessId })
            .populate("members", "id fname lname email")
            .populate("courses", "id title category thumbnail")
        },

        groupById: async (_: any, { id }: any, ctx: Context) => {
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
            const currentUserId = ctx.user;
       
        const group = await Group.findById(id)
            .populate("business")
            .populate("members", "id name email")
            .populate("courses", "id title category thumbnail")

        if (!group) throw new Error("Group not found");
        await checkBusinessPermission(group.business._id.toString(), currentUserId, ["admin", "member", "super-admin"]);
        return group;
        },
    },
    Mutation: {
        createGroup: async(_:any, {input}: {input: {businessId:string, 
        name:string, description:string,
        courseIds:string, retakeIntervalMonths:number}}, ctx:Context):Promise<IGroup | null> => {
        const { businessId, name, description, courseIds, retakeIntervalMonths } = input;

        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
        const currentUserId = ctx.user;
        const business = await checkBusinessPermission(businessId, currentUserId, ["admin", "super-admin"])

        const newGroup = await Group.create({
            business: business._id,
            name,
            description,
            courses: courseIds || [],
            retakeIntervalMonths: retakeIntervalMonths || 12,
        })

        const populatedGroup = await Group.findById(newGroup._id)
        .populate("business", "id name")
        .populate("courses", "id title category thumbnail")

        return populatedGroup;
    },
    
    editGroup: async (_: any, { input }: any, ctx: Context):Promise<IGroup | null> => {
      const { groupId, name, description, retakeIntervalMonths } = input;
      const group = await Group.findById(groupId);
      if (!group) throw new Error("Group not found");

    if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
    const currentUserId = ctx.user;
    await checkBusinessPermission(group.business.toString(), currentUserId, ["admin", "super-admin"])

      if (name) group.name = name;
      if (description) group.description = description;
      if (retakeIntervalMonths) group.retakeIntervalMonths = retakeIntervalMonths;

      await group.save();
      const populatedGroup = await Group.findById(group._id)
        .populate("members")
        .populate("courses");

      return populatedGroup
    },

    deleteGroup: async (_: any, { groupId }: any, ctx: Context) => {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");

    if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
    const currentUserId = ctx.user;
    await checkBusinessPermission(group.business.toString(), currentUserId, ["admin", "super-admin"])

    await group.deleteOne();
    return true;

    },

    addMemberToGroup: async (_: any, { input }: {input: {groupId:string, 
      memberIds:string}}, ctx: Context):Promise<IGroup | null> => {
      const { groupId, memberIds } = input;
      const group = await Group.findById(groupId);
      if (!group) throw new Error("Group not found");
      
        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
        const currentUserId = ctx.user;
        await checkBusinessPermission(group.business.toString(), currentUserId, ["admin", "super-admin"])

        // Fetch all valid users
        const validMembers = await User.find({ _id: { $in: memberIds } });
        if (!validMembers.length) throw new Error("No valid members found");


        // Convert existing IDs to strings for comparison
        const existingIds = group.members.map((c) => c.toString());

        // filter out existing ids
        const newMembers = validMembers.filter(
            (user) => !existingIds.includes(user._id.toString())
        );
        // Push only new members
        group.members.push(...newMembers.map((c) => c._id));
        await group.save();

        const populatedGroup = await Group.findById(group._id)
        .populate("business", "id name")
        .populate("members", "id fname lname email")
        .populate("courses", "id title category thumbnail")

        return populatedGroup
    },

    removeMemberFromGroup: async (_: any, { input }: {input: {groupId:string, memberIds:string[]}}, ctx: Context) => {
      const { groupId, memberIds } = input;
      const group = await Group.findById(groupId);
      if (!group) throw new Error("Group not found");
      
      if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
      const currentUserId = ctx.user;
      await checkBusinessPermission(group.business.toString(), currentUserId, ["admin", "super-admin"])

        // Convert memberIds to strings for comparison
      const idsToRemove = memberIds.map((id) => id.toString());

      // Filter out all matching members
      const originalCount = group.members.length;
      group.members = group.members.filter(
        (m) => !idsToRemove.includes(m.toString())
      );

      if (group.members.length === originalCount) {
        throw new Error("No matching members found in this group");
      }
      await group.save();

      const populated = await Group.findById(group._id)
      .populate("business", "id name")
      .populate("members", "id fname lname email")
      .populate("courses", "id title description category thumbnail")

      return populated
    },

    addCourseToGroup: async (_: any, { input }: {input: {groupId:string, 
      courseIds:string}}, ctx: Context):Promise<IGroup | null> => {
        const { groupId, courseIds } = input;

        const group = await Group.findById(groupId);
        if (!group) throw new Error("Group not found");

        if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
        const currentUserId = ctx.user; 

        await checkBusinessPermission(group.business.toString(), currentUserId, ["admin", "super-admin"]);
        // Fetch all valid courses
        const validCourses = await Course.find({ _id: { $in: courseIds } });
        if (!validCourses.length) throw new Error("No valid courses found");

        // Convert existing IDs to strings for comparison
        const existingIds = group.courses.map((c) => c.toString());

        // Filter only new, unique courses
        const newCourses = validCourses.filter(
            (course) => !existingIds.includes(course._id.toString())
        );

        if (!newCourses.length) throw new Error("All courses already exist in this group");

        // Push only new courses
        group.courses.push(...newCourses.map((c) => c._id));
        await group.save();

        const populated = await Group.findById(group._id)
        .populate("business", "id name")
        .populate("members", "id fname lname email")
        .populate("courses", "id title description duration category thumbnail")

        return populated
    },
    
    removeCourseFromGroup: async (_: any, { input }: {input: {groupId:string, courseIds:string[]}}, ctx: Context) => {
      const { groupId, courseIds } = input;
      const group = await Group.findById(groupId);
      if (!group) throw new Error("Group not found");
      
      if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
      const currentUserId = ctx.user; 
      await checkBusinessPermission(group.business.toString(), currentUserId, ["admin","super-admin"]);

      const idsToRemove = courseIds.map((id) => id.toString())

      const originalCount = group.courses.length
      group.courses = group.courses.filter((e) => 
        !idsToRemove.includes(e.toString()))
    
      if (group.courses.length === originalCount) {
        throw new Error("No matching courses found in this group");
      }
      await group.save();

       const populated = await Group.findById(group._id)
        .populate("business", "id name")
        .populate("members", "id fname lname email")
        .populate("courses", "id title description category thumbnail")

        return populated
    },
},
}