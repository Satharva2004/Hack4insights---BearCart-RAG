import mongoose from "mongoose";

const iterationLogSchema = new mongoose.Schema(
    {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            required: true,
            index: true
        },
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
        iterationNumber: {
            type: Number,
            required: true
        },
        plannerResponse: {
            type: String,
            required: true
        },
        researcherEvaluation: {
            issues: [String],
            isSatisfied: Boolean,
            summary: String
        },
        issuesFromPrevious: {
            type: [String],
            default: []
        },
        tokensConsumed: {
            planner: { type: Number, default: 0 },
            researcher: { type: Number, default: 0 },
            total: { type: Number, default: 0 }
        },
        processingTimeMs: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Compound index for querying iterations per message
iterationLogSchema.index({ messageId: 1, iterationNumber: 1 });
iterationLogSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model("IterationLog", iterationLogSchema);
