import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        content: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: true
        },
        iterationData: {
            totalIterations: { type: Number, default: 0 },
            researcherSatisfied: { type: Boolean, default: false },
            finalResponse: { type: String, default: "" }
        },
        tokensUsed: {
            type: Number,
            default: 0
        },
        llmModel: {
            type: String,
            default: "gemini-pro"
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient querying
messageSchema.index({ sessionId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
