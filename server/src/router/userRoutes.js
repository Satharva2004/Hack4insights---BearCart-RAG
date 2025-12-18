import express from "express";
const router = express.Router();

import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getCurrentUser 
} from "../controllers/user/userController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.use(verifyJWT);
router.get("/me", getCurrentUser);
router.post("/logout", logoutUser);

export const userRoute = router;
