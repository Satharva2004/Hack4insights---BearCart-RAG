import express from "express";
import {
    createSession,
    getSessions,
    getSessionMessages,
    sendMessage,
    archiveSession
} from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication
// router.use(protect);

// Session management
router.post("/", createSession);
router.get("/", getSessions);
router.get("/:sessionId/messages", getSessionMessages);
router.patch("/:sessionId/archive", archiveSession);

// Message streaming endpoint
router.post("/messages", sendMessage);

export default router;
