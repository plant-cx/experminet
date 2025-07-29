// netlify/functions/chat.js
const OpenAI = require('openai');

// Initialize OpenAI with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This key will NOT be exposed on the frontend.
});

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Message is required' }) };
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or "gpt-4", "gpt-4o", etc.
      messages: [
        { role: "system", content: "You are a helpful assistant specialized in Quantum Mechanics. Explain concepts clearly and concisely." },
        { role: "user", content: message }
      ],
      max_tokens: 150, // Limit the response length
      temperature: 0.7, // Creativity of the AI (0.0-1.0)
    });

    const aiReply = completion.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // CORS headers to allow your GitHub Pages site to access this function
        "Access-Control-Allow-Origin": "https://stupendous-basbousa-a1923a.netlify.app/", // IMPORTANT: CHANGE THIS!
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
        "Access-Control-Allow-Origin": "https://plant-cx.github.io/website/", // IMPORTANT: CHANGE THIS!
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: 'Failed to get response from AI. ' + error.message }),
    };
  }
};
