// netlify/functions/chat.js
// REMOVE: const OpenAI = require('openai');

// Add this line to use Google Generative AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI with your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // NOTE THE NEW ENV VAR NAME: GEMINI_API_KEY

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Message is required' }) };
    }

    // Get the model you want to use (e.g., "gemini-pro" for text chat)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Call Google Gemini API
    // Gemini's chat history is handled differently; for a single turn, this is simpler:
    const result = await model.generateContent([
      // System instruction needs to be part of the prompt in Gemini's simple generateContent
      // You might need a more complex chat session for persistent roles
      "You are a helpful assistant specialized in Quantum Mechanics. Explain concepts clearly and concisely.",
      { role: "user", parts: [{ text: message }] }
    ]);

    const response = await result.response;
    const aiReply = response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://gregarious-biscotti-ee8112.netlify.app", // Your Netlify site URL
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ reply: aiReply }),
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://gregarious-biscotti-ee8112.netlify.app", // Your Netlify site URL
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: 'Failed to get response from AI. ' + error.message }),
    };
  }
};
