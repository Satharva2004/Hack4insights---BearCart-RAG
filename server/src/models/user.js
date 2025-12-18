import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: false
        },
        image: {
            type: String,
            default: null
        },
        refresh_token: String,
        token_version: {
            type: Number,
            default: 0
        },
        date_of_birth: {
            type: String,
            default: null
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,
        verificationExpires: Date,
        otp: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ["asha_worker", "user"],
            default: "user"
        },
        ashaWorkerDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AshaWorker"
        },
        // Subscription fields
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan"
        },
        tokensUsed: {
            type: Number,
            default: 0
        },
        tokenResetDate: {
            type: Date,
            default: Date.now
        },
        subscriptionStatus: {
            type: String,
            enum: ["active", "canceled", "expired"],
            default: "active"
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        subscriptionId: String
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.refresh_token;
                delete ret.otp;
                delete ret.verificationToken;
                return ret;
            }
        }
    }
);

// Index for faster queries on verification
userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ verificationExpires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("User", userSchema);
