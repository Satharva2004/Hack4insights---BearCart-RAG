import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            default: "New Chat Session",
            trim: true
        },
        status: {
            type: String,
            enum: ["active", "archived", "completed"],
            default: "active"
        },
        metadata: {
            totalIterations: { type: Number, default: 0 },
            finalResponseLength: { type: Number, default: 0 },
            averageIterations: { type: Number, default: 0 }
        },
        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

// Virtual for messages
sessionSchema.virtual("messages", {
    ref: "Message",
    localField: "_id",
    foreignField: "sessionId",
    count: true
});

sessionSchema.index({ userId: 1, lastMessageAt: -1 });
sessionSchema.index({ status: 1, lastMessageAt: -1 });

export default mongoose.model("Session", sessionSchema);
