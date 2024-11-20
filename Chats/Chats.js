const User = require("../Schemas/User")
const Chat = require("../Schemas/Chat")
const Message = require("../Schemas/Message")
let OpenAI = require('openai');

const openai = new OpenAI(
    {
        apiKey: process.env.OPENAI_API_KEY,
    }
);

// 1. HELPER FUNCTIONS

// Define the tools available for AI to use
const defineTools = () => {
    return [
        {
            type: "function",
            function: {
                name: "toggle_dark_and_light_mode",
                description: "Toggle between light and dark mode.",
                parameters: {
                    type: "object",
                    properties: { theme: { type: "string", description: "Light or dark." } },
                    required: ["theme"],
                    additionalProperties: false,
                },
            },
        },
        {
            type: "function",
            function: {
                name: "generate_image",
                description: "Generate images based on a description.",
                parameters: {
                    type: "object",
                    properties: { image_description: { type: "string", description: "Image request details." } },
                    required: ["image_description"],
                    additionalProperties: false,
                },
            },
        },
    ];
};

// Format AI message for the response
const formatAIMessage = (content) => {
    return { role: "assistant", content: [{ type: "text", text: content }] };
};

// Handle AI text response
const handleAITextResponse = async (aiMessage, chatId, res, toolParameters = null) => {
    const formattedMessage = formatAIMessage(aiMessage.content);
    const messageSaved = await addMessage("assistant", formattedMessage, chatId);
    if (!messageSaved.success) {
        return res.status(500).json({ message: "Failed to save AI message" });
    }

    // Include toolParameters in the response if provided
    const responsePayload = { AIMessage: formattedMessage };
    if (toolParameters) {
        responsePayload.toolParameters = toolParameters;
    }

    return res.json(responsePayload);
};

// Handle AI tool call
const handleAIToolCall = async (AIMessage, tools, messages, chatId, res) => {
    const toolCall = AIMessage.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);
    const { name } = toolCall.function;

    let toolResponse;
    let toolParameters = {};

    if (name === "toggle_dark_and_light_mode" && args.theme) {
        toolResponse = `Setting mode to ${args.theme}.`;
        toolParameters = { functionName: name, functionArguments: args.theme };
    } else if (name === "generate_image" && args.image_description) {
        toolResponse = await getdalle(args.image_description);
    }

    if (toolResponse) {
        return await generateFollowUpResponse(AIMessage, toolResponse, tools, messages, chatId, res, toolParameters);
    }
};

// Generate follow-up response for tool calls
const generateFollowUpResponse = async (AIMessage, toolResponse, tools, messages, chatId, res, toolParameters) => {
    const updatedMessages = [
        ...messages,
        AIMessage,
        { role: "tool", content: JSON.stringify(toolResponse), tool_call_id: AIMessage.tool_calls[0].id },
    ];

    const followUpCompletion = await openai.chat.completions.create({
        messages: updatedMessages,
        model: "gpt-4o-mini",
        tools,
    });

    if (followUpCompletion) {
        const followUpMessage = followUpCompletion.choices[0].message;
        return await handleAITextResponse(followUpMessage, chatId, res, toolParameters);
    }
};

// Generate images with DALL-E
const getdalle = async (imageDescription) => {
    try {
        const image = await openai.images.generate({ 
            model: "dall-e-3", 
            prompt: imageDescription
        });
        if(image) {
            return image.data;
        }
    } catch (error) {
        console.error('Error generating image:', error);
        return { success: false, error: 'Error generating image.' };
    }
};

// Helper function for saving messages to the database
const addMessage = async (role, message, chatId) => {
    try {
        const stringifyMessage = JSON.stringify(message);
        const newMessage = new Message({ role, content: stringifyMessage, chatId });
        const saveMessages = await newMessage.save();
        
        // Push the message ID to the Chat document’s messages array
        const updateChat = await Chat.findByIdAndUpdate(chatId, {
            $push: { messages: newMessage._id }
        });

        if(updateChat) {
            return { success: true, data: newMessage._id };
        }
    } catch (error) {
        console.error('Error saving message:', error);
        return { success: false, error: 'Error saving message to the database.' };
    }
};

// Generates a new title for the chat
const renameChat = async (userMessage, res) => {

    try {
        const messages = [
            {role: "system", content: "Generate a short title without quotation marks for the following message."},
            userMessage
        ]

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-4o-mini"
        });

        if(completion) {
            const newTitle = completion.choices[0].message.content;
            return newTitle;
        }

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

};

const categorizeChat = async (userMessage, res) => {

    try {
        const messages = [
            {role: "system", content: "Choose the category that is the best fit for the user's message. The possible categories are: Facts, Tutorials, Brainstorming, Coding, Writing, Image Generation, Image Analysis, Social Chat, Fun and Memes, Serious Chat, Support, Opinion, Vent. If the message doesn't fit in any of these categories, you can make one up or use Other. Respond with only the category's name without quotation marks."},
            userMessage
        ]

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-4o-mini"
        });

        if(completion) {
            const newCategory = completion.choices[0].message.content;
            return newCategory;
        }

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

};

// 2. ENDPOINTS

exports.getai = async (req, res) => {
    
    try {

        const tools = defineTools();

        const { messages, chatId } = req.body;
        const newUserMessage = messages[messages.length - 1];

        // Save user message to database
        const addUserMessage = await addMessage("user", newUserMessage, chatId);
        if (!addUserMessage.success) {
            return res.status(500).json({ message: addUserMessage.error });
        }

        // Generate AI response
        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-4o-mini",
            tools: tools,
        });

        if(completion) {
            const AIResponse = completion.choices[0].message;

            // Handle AI text response
            if(AIResponse.content) {
                return await handleAITextResponse(AIResponse, chatId, res);
            }

            // Handle AI tool call
            if (AIResponse.tool_calls?.[0]) {
                return await handleAIToolCall(AIResponse, tools, messages, chatId, res);
            }
        }
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Read messages out loud
exports.speech = async (req, res) => {
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
};

// Gets the list of chats for the sidebar
exports.getChatList = async (req, res) => {

    try {
        // User id comes from the auth middleware
        const userId = req.id;

        const chats = await Chat.find({ userId: userId })
            .sort({ createdAt: -1 });
        if(chats) {
            // Group chats by category
            const groupedChats = chats.reduce((acc, chat) => {
                const category = chat.category || "Other";
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(chat);
                return acc;
            }, {});

            res.status(200).json({ groupedChats });
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

};

// Fetches the chat based on the chat id in the URL
exports.getChat = async (req, res) => {

    try {
        const { chatId } = req.query;
        // User id comes from the auth middleware
        const userId = req.id;

        const chat = await Chat.findOne({ _id: chatId, userId: userId })
            .populate({
                path: 'messages',
                options: { sort: { createdAt: 1 } }
            })
            .exec();
        if(chat) {
            res.status(200).json({ chat })
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

};

// Starts a new empty chat
exports.newChat = async (req, res) => {

    try {
        const { userMessage, category } = req.body.newChatData;
        // User id comes from the auth middleware
        const userId = req.id;

        const generatedTitle = await renameChat(userMessage, res);
        const generatedCategory = await categorizeChat(userMessage, res);

        if(generatedTitle && generatedCategory) {
            const chat = await Chat.create({ title: generatedTitle, category: generatedCategory, userId });
            if(chat) {
                res.status(201).json({
                    message: "New chat successfully created",
                    id: chat._id,
                });
            }
        }

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

};