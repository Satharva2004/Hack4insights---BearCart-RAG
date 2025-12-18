import { sendResponse } from "../utils/apiResonse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { statusType } from "../utils/statusType.js";
import User from "../models/user.js";

/**
 * Middleware to verify JWT token
 * Looks for token in cookies first, then in Authorization header
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
    // Get token from cookies or Authorization header
    const token = req.cookies?.token || 
                 req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return sendResponse(
            res,
            false,
            null,
            "Authentication required",
            statusType.UNAUTHORIZED
        );
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from the token
        const user = await User.findById(decoded.user_id).select("-password");

        if (!user) {
            return sendResponse(
                res,
                false,
                null,
                "User not found",
                statusType.UNAUTHORIZED
            );
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        return sendResponse(
            res,
            false,
            null,
            "Invalid or expired token",
            statusType.UNAUTHORIZED
        );
    }
});
