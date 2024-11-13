let express = require('express');
const cors = require('cors');
let bodyParser = require('body-parser');
let OpenAI = require('openai');
const cookieParser = require("cookie-parser");

const app = express();

require('./db')

app.use(cors({ 
    origin: 'http://localhost:3000', 
    credentials: true 
}));
app.use(cookieParser());

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));

app.use("/api/auth", require("./Auth/Route"))
app.use("/chats", require("./Chats/Route"))

let dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI(
    {
        apiKey: process.env.OPENAI_API_KEY,
    }
);

app.get('/getdalle', async (req, res) => {
    try {
        const { prompt } = req.query;
        const image = await openai.images.generate({ 
            model: "dall-e-3", 
            prompt: prompt
        });
        if(image) {
            const output = image.data;
            return res.json(output);
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/speech', async (req, res) => {
    try {
        const text = req.body.text;
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Disposition": `attachment; filename="speech.mp3"`,
        });
        if(buffer) {
            res.send(buffer);
        }
    } catch (error) {
        console.error("Error generating speech:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

app.post('/getai', async (req, res) => {
    try {

        const tools = [
            {
                type: "function",
                function: {
                    name: "toggle_dark_and_light_mode",
                    description: "Toggle between the light mode and the dark mode of the chat user interface. Call this whenever the user wants to make the user interface light or dark.",
                    parameters: {
                        type: "object",
                        properties: {
                            theme: {
                                type: "string",
                                description: "Light or dark.",
                            },
                        },
                        required: ["theme"],
                        additionalProperties: false,
                    },
                }
            },
            {
                type: "function",
                function: {
                    name: "generate_image",
                    description: "Generate images. Call this function whenever the user asks for an image or a drawing.",
                    parameters: {
                        type: "object",
                        properties: {
                            image_description: {
                                type: "string",
                                description: "A description of the image request",
                            },
                        },
                        required: ["image_description"],
                        additionalProperties: false,
                    },
                }
            }
        ];

        // Previous chat context
        const messages = req.body.messages;

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-4o-mini",
            tools: tools,
        });

        if(completion) {
            const output = completion.choices[0].message;
            return res.json(output);
        }
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ message: "Internal server error" });
    }
})

let port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});