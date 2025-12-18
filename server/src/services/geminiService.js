import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined in environment variables");
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.plannerModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        this.researcherModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async callPlanner(userQuery, previousIssues = []) {
        try {
            const prompt = this.buildPlannerPrompt(userQuery, previousIssues);
            const result = await this.plannerModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                response: text,
                tokens: this.estimateTokens(text)
            };
        } catch (error) {
            console.error("Planner API Error:", error);
            throw new Error(`Planner call failed: ${error.message}`);
        }
    }

    async callResearcher(userQuery, plannerResponse) {
        try {
            const prompt = this.buildResearcherPrompt(userQuery, plannerResponse);
            const result = await this.researcherModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON response
            const parsed = this.parseResearcherResponse(text);
            return {
                ...parsed,
                tokens: this.estimateTokens(text)
            };
        } catch (error) {
            console.error("Researcher API Error:", error);
            throw new Error(`Researcher call failed: ${error.message}`);
        }
    }

    buildPlannerPrompt(userQuery, previousIssues) {
        return `You are the Planner AI. Improve your response based on the researcher's feedback.

User Query: "${userQuery}"

${
    previousIssues.length > 0
        ? `Previous Issues to Address:\n${previousIssues
              .map((issue, i) => `${i + 1}. ${issue}`)
              .join("\n")}`
        : "No previous issues. Provide your best initial response."
}

Provide a comprehensive, accurate, and helpful response to the user query.`;
    }

    buildResearcherPrompt(userQuery, plannerResponse) {
        return `You are the Researcher AI. Evaluate the Planner's response.

User Query: "${userQuery}"

Planner's Response: "${plannerResponse}"

Evaluate for: correctness, clarity, completeness, safety, and relevance.
Return ONLY JSON with this exact format:
{
  "planner_response_summary": "short summary",
  "issues": ["issue1", "issue2"],
  "is_satisfied": false
}

If no issues, return empty issues array and is_satisfied: true.`;
    }

    parseResearcherResponse(text) {
        try {
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("No valid JSON found in researcher response");
        } catch (error) {
            console.error("Failed to parse researcher response:", error);
            return {
                planner_response_summary: "Parser error",
                issues: ["Failed to parse researcher evaluation"],
                is_satisfied: false
            };
        }
    }

    estimateTokens(text) {
        // Rough estimation: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }
}

export default new GeminiService();
