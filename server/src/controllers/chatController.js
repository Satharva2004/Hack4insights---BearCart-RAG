import Session from "../models/session.js";
import Message from "../models/message.js";
import IterationLog from "../models/iterationLog.js";
import geminiService from "../services/geminiService.js";
import { asyncHandler, statusType, sendResponse } from "../utils/index.js";
import { EventEmitter } from "events";

// Create a global event emitter for SSE
const chatEvents = new EventEmitter();

// Create a new chat session
const createSession = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { title } = req.body;

        // Create new session
        const session = await Session.create({
            userId,
            title: title || `Chat ${new Date().toLocaleDateString()}`,
            status: "active"
        });

        return sendResponse(
            res,
            true,
            {
                session: {
                    _id: session._id,
                    title: session.title,
                    createdAt: session.createdAt,
                    status: session.status
                }
            },
            "Chat session created successfully",
            statusType.CREATED
        );
    } catch (error) {
        console.error("Create session error:", error);
        return sendResponse(
            res,
            false,
            null,
            "Failed to create chat session",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// Get user's chat sessions
const getSessions = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 20, page = 1, status } = req.query;
        const skip = (page - 1) * limit;

        const filter = { userId };
        if (status) filter.status = status;

        const sessions = await Session.find(filter)
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("_id title status createdAt lastMessageAt metadata");

        const total = await Session.countDocuments(filter);

        return sendResponse(
            res,
            true,
            {
                sessions,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            },
            "Sessions retrieved successfully",
            statusType.OK
        );
    } catch (error) {
        console.error("Get sessions error:", error);
        return sendResponse(
            res,
            false,
            null,
            "Failed to retrieve sessions",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// Get messages for a session
const getSessionMessages = asyncHandler(async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;
        const { limit = 50, before } = req.query;

        // Verify session belongs to user
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) {
            return sendResponse(
                res,
                false,
                null,
                "Session not found or access denied",
                statusType.NOT_FOUND
            );
        }

        const query = { sessionId, userId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select("content role createdAt iterationData tokensUsed");

        return sendResponse(
            res,
            true,
            {
                messages: messages.reverse(), // Return in chronological order
                session: {
                    _id: session._id,
                    title: session.title,
                    status: session.status
                }
            },
            "Messages retrieved successfully",
            statusType.OK
        );
    } catch (error) {
        console.error("Get messages error:", error);
        return sendResponse(
            res,
            false,
            null,
            "Failed to retrieve messages",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// Send message with Planner-Researcher loop (SSE streaming)
const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { sessionId, content } = req.body;
        const userId = req.user._id;

        if (!sessionId || !content) {
            return sendResponse(
                res,
                false,
                null,
                "Session ID and message content are required",
                statusType.BAD_REQUEST
            );
        }

        // Verify session belongs to user
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) {
            return sendResponse(
                res,
                false,
                null,
                "Session not found or access denied",
                statusType.NOT_FOUND
            );
        }

        // Save user message
        const userMessage = await Message.create({
            sessionId,
            userId,
            content,
            role: "user"
        });

        // Update session last message timestamp
        await Session.findByIdAndUpdate(sessionId, {
            lastMessageAt: new Date()
        });

        // Set up SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // For nginx

        // Send initial event
        res.write(
            `event: session\ndata: ${JSON.stringify({
                sessionId,
                messageId: userMessage._id,
                status: "processing"
            })}\n\n`
        );

        // Initialize iteration variables
        let allIssues = [];
        let finalResponse = "";
        let iterationCount = 0;
        const maxIterations = 10; // Safety limit

        // Main Planner-Researcher loop
        while (iterationCount < maxIterations) {
            iterationCount++;

            // Call Planner
            const startTime = Date.now();
            const plannerResult = await geminiService.callPlanner(content, allIssues);

            // Call Researcher
            const researcherResult = await geminiService.callResearcher(
                content,
                plannerResult.response
            );

            const processingTime = Date.now() - startTime;

            // Save iteration log
            const iterationLog = await IterationLog.create({
                messageId: userMessage._id,
                sessionId,
                userId,
                iterationNumber: iterationCount,
                plannerResponse: plannerResult.response,
                researcherEvaluation: {
                    issues: researcherResult.issues || [],
                    isSatisfied: researcherResult.is_satisfied || false,
                    summary: researcherResult.planner_response_summary || ""
                },
                issuesFromPrevious: [...allIssues],
                tokensConsumed: {
                    planner: plannerResult.tokens,
                    researcher: researcherResult.tokens,
                    total: plannerResult.tokens + researcherResult.tokens
                },
                processingTimeMs: processingTime
            });

            // Send iteration progress via SSE
            res.write(
                `event: iteration\ndata: ${JSON.stringify({
                    iteration: iterationCount,
                    issuesFound: researcherResult.issues?.length || 0,
                    satisfied: researcherResult.is_satisfied || false,
                    tokensUsed: iterationLog.tokensConsumed.total
                })}\n\n`
            );

            // Check if researcher is satisfied
            if (researcherResult.is_satisfied) {
                finalResponse = plannerResult.response;

                // Send final response in chunks for streaming effect
                const chunkSize = 50;
                for (let i = 0; i < finalResponse.length; i += chunkSize) {
                    const chunk = finalResponse.slice(i, i + chunkSize);
                    res.write(
                        `event: chunk\ndata: ${JSON.stringify({
                            chunk,
                            complete: i + chunkSize >= finalResponse.length
                        })}\n\n`
                    );

                    // Small delay for streaming effect
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
                break;
            }

            // Add new issues to the list
            if (researcherResult.issues && researcherResult.issues.length > 0) {
                allIssues = [...allIssues, ...researcherResult.issues];

                // Limit issues to prevent context overflow
                if (allIssues.length > 20) {
                    allIssues = allIssues.slice(-10); // Keep only last 10 issues
                }
            }
        }

        // Create assistant message with final response
        const assistantMessage = await Message.create({
            sessionId,
            userId,
            content: finalResponse,
            role: "assistant",
            iterationData: {
                totalIterations: iterationCount,
                researcherSatisfied: true,
                finalResponse: finalResponse
            },
            tokensUsed: await IterationLog.aggregate([
                { $match: { messageId: userMessage._id } },
                { $group: { _id: null, total: { $sum: "$tokensConsumed.total" } } }
            ]).then((result) => result[0]?.total || 0)
        });

        // Update session metadata
        const totalSessions = await Message.countDocuments({ sessionId, role: "assistant" });
        const totalIterations = await IterationLog.countDocuments({ sessionId });

        await Session.findByIdAndUpdate(sessionId, {
            "metadata.totalIterations": totalIterations,
            "metadata.finalResponseLength": finalResponse.length,
            "metadata.averageIterations": totalSessions > 0 ? totalIterations / totalSessions : 0
        });

        // Send completion event
        res.write(
            `event: complete\ndata: ${JSON.stringify({
                messageId: assistantMessage._id,
                totalIterations: iterationCount,
                totalTokens: assistantMessage.tokensUsed,
                timestamp: new Date().toISOString()
            })}\n\n`
        );

        res.end();
    } catch (error) {
        console.error("Send message error:", error);

        // Send error via SSE if connection still open
        if (!res.headersSent) {
            res.write(
                `event: error\ndata: ${JSON.stringify({
                    error: "Failed to process message",
                    details: error.message
                })}\n\n`
            );
        }
        res.end();
    }
});

// Archive a session
const archiveSession = asyncHandler(async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await Session.findOneAndUpdate(
            { _id: sessionId, userId },
            { status: "archived" },
            { new: true }
        );

        if (!session) {
            return sendResponse(
                res,
                false,
                null,
                "Session not found or access denied",
                statusType.NOT_FOUND
            );
        }

        return sendResponse(
            res,
            true,
            { session: { _id: session._id, status: session.status } },
            "Session archived successfully",
            statusType.OK
        );
    } catch (error) {
        console.error("Archive session error:", error);
        return sendResponse(
            res,
            false,
            null,
            "Failed to archive session",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

export { createSession, getSessions, getSessionMessages, sendMessage, archiveSession, chatEvents };
