// netlify/functions/chat.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        // Correct way to send a simple string message to generateContent
        const result = await model.generateContent(message); // <-- Direct string input here!

        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text }),
            headers: { "Content-Type": "application/json" },
        };

    } catch (error) {
        console.error("Error in Netlify Function:", error); // Log the full error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get response from AI. " + (error.message || "Unknown error.") }),
            headers: { "Content-Type": "application/json" },
        };
    }
};
