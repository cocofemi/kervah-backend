import { PolicyDocument } from "../../models/policy.model";

interface Context {
    auth: boolean
    user?: string; 
}

export const policyDocumentResolvers = {
    Query: {
        businessPolicyDocument: async(_:any, {businessId}: {businessId:string}, ctx:Context) => {
             if (!ctx.auth || !ctx.user) throw new Error("Unauthorized");
             const currentUserId = ctx.user;

             return await PolicyDocument.find({ businessId })
                .populate("businessId uploadedBy")
                .sort({ createdAt: -1 })
        },
    },

    Mutation: {
        uploadPolicy: async(_:any, {input}:any, ctx:Context) => {
            const { documentUrl, name, category, businessId, fileType, fileSize,  description } = input;

            if(!ctx.auth || !ctx.user) throw new Error("Unauthorized")

            const policyDocument = await PolicyDocument.create({
                documentUrl,
                name,
                category, 
                businessId,
                fileType, 
                fileSize,
                uploadedBy: ctx?.user,
                description
            });
            const populatedPolicyDoc = PolicyDocument.findById(policyDocument._id)
            .populate("businessId uploadedBy")
            return await populatedPolicyDoc
            
        },

        removePolicyDocument: async(_:any, {documentId}: {documentId:string}, ctx:Context) => {
            if(!ctx.auth || !ctx.user) throw new Error("Unauthorized")
            const deleted =  await PolicyDocument.findByIdAndDelete(documentId)
            return !!deleted;
        }
    }
}