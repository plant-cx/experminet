// netlify/functions/chat.js
const fetch = require('node-fetch'); // Import node-fetch for making HTTP requests

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

        // Get OpenAI API Key from environment variables
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            console.error('OPENAI_API_KEY environment variable not set.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: OpenAI API Key not found.' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // OpenAI API endpoint and model
        const openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
        const modelName = 'gpt-3.5-turbo'; // You can change this to 'gpt-4o', 'gpt-4-turbo', etc.

        // Make the request to OpenAI
        const response = await fetch(openaiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}` // Authentication using Bearer token
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    // Optional: A system message to set the AI's persona or instructions
                    { role: "system", content: "You are a helpful assistant." },
                    // The user's current message
                    { role: "user", content: message }
                ],
                max_tokens: 150, // Limits the length of the AI's response
                temperature: 0.7 // Controls creativity/randomness (0.0-1.0, higher is more creative)
            })
        });

        // Check if the OpenAI API call was successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error format from OpenAI' }));
            console.error(`OpenAI API responded with error status ${response.status}:`, errorData);
            throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        // Parse the response from OpenAI
        const data = await response.json();

        // Extract the AI's reply from the response
        const aiReply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

        if (!aiReply) {
            console.error('No valid reply content received from OpenAI:', data);
            throw new Error('No valid reply received from AI. Response structure unexpected.');
        }

        // Return the AI's reply to the frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
            headers: { "Content-Type": "application/json" }, // Simple header
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
