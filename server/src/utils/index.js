import { asyncHandler } from "./asyncHandler.js";
import { deleteOnCloudinary,uploadOnCloudinary } from "./cloudinary.js";
import { statusType } from "./statusType.js";
import { sendResponse } from "./apiResonse.js";
import { verifyGoogleToken } from "./googleAuth.js";
import { chatLimiter } from "./rateLimiter.js";

const trackTokens = (userId, tokensUsed) => {
    // Implement token tracking logic based on user's plan
    // This would update user's token usage in database
    // Return remaining tokens or throw error if exceeded
    return { success: true, remaining: 1000 }; // Placeholder
};

// Streaming response helper
const sendStreamChunk = (res, event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

// Validation for chat inputs
const validateChatInput = (content) => {
    if (!content || content.trim().length === 0) {
        return { valid: false, error: "Message content cannot be empty" };
    }
    if (content.length > 5000) {
        return { valid: false, error: "Message too long (max 5000 characters)" };
    }
    return { valid: true };
};
export {
  validateChatInput,
  sendStreamChunk,
  trackTokens,
  asyncHandler,
  deleteOnCloudinary,
  uploadOnCloudinary,
  statusType,
  sendResponse,
  chatLimiter,
  verifyGoogleToken
}