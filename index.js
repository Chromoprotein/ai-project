let express = require('express');
const cors = require('cors');

let bodyParser = require('body-parser');
let OpenAI = require('openai');

const app = express();
app.use(cors({ 
    origin: 'http://localhost:3000', 
    credentials: true 
}));

app.use(bodyParser.json());

let dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI(
    {
        apiKey: process.env.OPENAI_API_KEY,
    }
);

app.get('/getai', async (req, res) => {
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
            }
        ];

        const { messages } = req.query;
        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-4o-mini",
            tools: tools,
        });
        if(completion) {
            const output = completion.choices[0].message;
            return res.json(output);
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

let port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});