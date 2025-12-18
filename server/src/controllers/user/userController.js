// In userController.js
import User from "../../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler, statusType, sendResponse } from "../../utils/index.js";

// Token generator function with 30 days expiration
const generateAuthToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign(
        { 
            user_id: user._id,
            email: user.email,
            role: user.role || 'user' 
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return sendResponse(
            res,
            false,
            null,
            "Please provide all required fields: name, email, and password",
            statusType.BAD_REQUEST
        );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return sendResponse(
            res,
            false,
            null,
            "Please provide a valid email address",
            statusType.BAD_REQUEST
        );
    }

    // Validate password strength
    if (password.length < 6) {
        return sendResponse(
            res,
            false,
            null,
            "Password must be at least 6 characters long",
            statusType.BAD_REQUEST
        );
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(
                res,
                false,
                { email: "This email is already registered" },
                "Registration failed",
                statusType.CONFLICT
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isVerified: true
        });

        // Generate token
        const token = generateAuthToken(user);

        // Set token in cookie
        res.cookie('token', token, cookieOptions);

        // Return user data (without password)
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return sendResponse(
            res,
            true,
            { user: userData, token },
            "Registration successful! Welcome to our platform.",
            statusType.CREATED
        );

    } catch (error) {
        console.error("Registration error:", error);
        return sendResponse(
            res,
            false,
            null,
            "An error occurred during registration. Please try again.",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return sendResponse(
            res,
            false,
            { email: !email ? "Email is required" : undefined },
            !password ? "Password is required" : "Please provide both email and password",
            statusType.BAD_REQUEST
        );
    }

    try {
        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return sendResponse(
                res,
                false,
                { email: "No account found with this email" },
                "Login failed",
                statusType.UNAUTHORIZED
            );
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendResponse(
                res,
                false,
                { password: "Incorrect password" },
                "Login failed",
                statusType.UNAUTHORIZED
            );
        }

        // Generate token
        const token = generateAuthToken(user);

        // Set token in cookie
        res.cookie('token', token, cookieOptions);

        // Return user data (without password)
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return sendResponse(
            res,
            true,
            { user: userData, token },
            "Login successful! Welcome back.",
            statusType.OK
        );

    } catch (error) {
        console.error("Login error:", error);
        return sendResponse(
            res,
            false,
            null,
            "An error occurred during login. Please try again.",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// User Logout
const logoutUser = asyncHandler(async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token');
        
        return sendResponse(
            res,
            true,
            null,
            "You have been successfully logged out",
            statusType.OK
        );
    } catch (error) {
        console.error("Logout error:", error);
        return sendResponse(
            res,
            false,
            null,
            "An error occurred during logout",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        // The user is already attached to the request by the auth middleware
        const user = req.user;
        
        if (!user) {
            return sendResponse(
                res,
                false,
                null,
                "User not found. Please log in again.",
                statusType.NOT_FOUND
            );
        }

        return sendResponse(
            res,
            true,
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            "User profile retrieved successfully",
            statusType.OK
        );
    } catch (error) {
        console.error("Get current user error:", error);
        return sendResponse(
            res,
            false,
            null,
            "An error occurred while fetching user data",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

export { registerUser, loginUser, logoutUser, getCurrentUser };