// netlify/functions/chat.js
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import Google Generative AI SDK

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parse the message from the request body
        const { message } = JSON.parse(event.body);

        // Validate that a message was provided
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // Get Google Gemini API Key from environment variables
        const geminiApiKey = process.env.GEMINI_API_KEY; // Use your new environment variable
        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY environment variable not set.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: Gemini API Key not found.' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // Initialize Google Generative AI with your API key
        const genAI = new GoogleGenerativeAI(geminiApiKey);

        // For text-only input, use the gemini-1.0-pro model
        // This model is generally stable and widely available.
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        // Correct way to send a simple string message to generateContent for a single turn
        const result = await model.generateContent(message);

        // Extract the response text
        const response = await result.response;
        const text = response.text();

        // Return the AI's reply to the frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text }),
            headers: { "Content-Type": "application/json" }, // Only this header is typically needed
        };

    } catch (error) {
        // Log the full error for debugging in Netlify logs
        console.error("Error in Netlify Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get response from AI. " + (error.message || "Unknown error.") }),
            headers: { "Content-Type": "application/json" },
        };
    }
};
