import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Allowed origins
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];

// Middleware for CORS
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true); // Allow the request
            } else {
                console.error(`Blocked by CORS: Origin ${origin} not allowed`);
                callback(new Error('Not allowed by CORS')); // Block the request
            }
        },
        credentials: true, // Allow credentials if needed
    })
);

// Middleware for JSON body parsing
app.use(bodyParser.json());

// Handle preflight requests (OPTIONS)
app.options('*', cors());

// Endpoint to handle form submissions
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body; // Get the form data from the request body
        const message = `
      New form submission:
      ${JSON.stringify(formData, null, 2)} // Format the message for Telegram
    `;

        await sendToTelegram(message); // Send the message to Telegram
        res.json({ success: true, message: 'Form submitted successfully!' }); // Respond to the client
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ success: false, message: 'An error occurred' }); // Handle errors
    }
});

// Function to send the message to both Telegram bots
async function sendToTelegram(message) {
    const botTokens = [process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_BOT_TOKEN_2, process.env.TELEGRAM_BOT_TOKEN_3];
    const chatIds = [process.env.TELEGRAM_CHAT_ID, process.env.TELEGRAM_CHAT_ID_2, process.env.TELEGRAM_CHAT_ID_3];

    for (let i = 0; i < botTokens.length; i++) {
        const url = `https://api.telegram.org/bot${botTokens[i]}/sendMessage`;

        console.log(`Sending message to Telegram bot ${i + 1}, chat ID ${chatIds[i]}:`, message);

        try {
            const response = await axios.post(url, {
                chat_id: chatIds[i],
                text: message,
            });
            console.log(`Telegram bot ${i + 1} response:`, response.data);
        } catch (err) {
            console.error(`Telegram bot ${i + 1} API error:`, err.response?.data || err.message);
        }
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});