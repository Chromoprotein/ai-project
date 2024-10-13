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
        const { messages } = req.query;
        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-4o-mini",
        });
        if(completion) {
            const output = completion.choices[0].message.content;
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