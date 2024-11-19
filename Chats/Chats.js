const User = require("../Schemas/User")
const Chat = require("../Schemas/Chat")
const Message = require("../Schemas/Message")
let OpenAI = require('openai');

const openai = new OpenAI(
    {
        apiKey: process.env.OPENAI_API_KEY,
    }
);

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

exports.getai = async (req, res) => {
    
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

        const messages = req.body.messages;
        const newUserMessage = messages[messages.length-1];
        const chatId = req.body.chatId;

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

            // If there is a text content, save it to the database and return it
            if(AIResponse.content) {
                const AIMessage = { 
                    role: "assistant", 
                    content: [ 
                        { 
                            type: "text", 
                            text: AIResponse.content
                        }
                    ] 
                };

                // Save the AI message to database
                const addAIMessage = await addMessage("assistant", AIMessage, chatId);
                if (!addAIMessage.success) {
                    return res.status(500).json({ message: addAIMessage.error });
                }

                return res.json({ AIMessage: AIMessage });
            }

            // If the AI wants to call a function
            if (AIResponse.tool_calls?.[0]) { // Function call parameters etc.
                
                const { name, arguments: argsString } = AIResponse.tool_calls?.[0].function;
                const args = JSON.parse(argsString);

                let toolResponse = ""; // The result of an async function goes here
                let toolParameters = {}; // Details for a function to be called in the frontend go here
                if (name === "toggle_dark_and_light_mode" && args.theme) {
                    toolResponse = `I'm setting the mode to ${args.theme} mode`;
                    toolParameters = {
                        functionName: "toggle_dark_and_light_mode", 
                        functionArguments: args.theme
                    };
                } else if (name === "generate_image" && args.image_description) {
                    toolResponse = await getdalle(args.image_description);
                }

                if(toolResponse) {
                    // Pass the function call's response back to the AI so it can show and explain the results to the user
                    const afterToolAllMessages = [
                        ...messages, // Previous messages
                        AIResponse, // The AI's initial response with function call parameters
                        { 
                            role: "tool", 
                            content: JSON.stringify(toolResponse), 
                            tool_call_id: AIResponse.tool_calls[0].id 
                        }, // Simulated message containing the tool's response
                    ];

                    // Generate AI response to explain the tool results
                    const completionAfterTool = await openai.chat.completions.create({
                        messages: afterToolAllMessages,
                        model: "gpt-4o-mini",
                        tools: tools,
                    });

                    if (completionAfterTool) {
                        const AIResponse = completionAfterTool.choices[0].message;
                        if(AIResponse.content) {
                            const AIMessage = { 
                                role: "assistant", 
                                content: [ 
                                    { 
                                        type: "text", 
                                        text: AIResponse.content
                                    }
                                ] 
                            };
                            // Save the AI message to database
                            const addAIMessage = await addMessage("assistant", AIMessage, chatId);
                            if (!addAIMessage.success) {
                                return res.status(500).json({ message: addAIMessage.error });
                            }
                            return res.json({ AIMessage: AIMessage, toolParameters });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Gets the list of chats for the sidebar
exports.getChatList = async (req, res) => {

    try {
        // User id comes from the auth middleware
        const userId = req.id;

        const chats = await Chat.find({ userId: userId })
        if(chats) {
            res.status(200).json({ chats })
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

}

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

}

// Starts a new empty chat
exports.newChat = async (req, res) => {

    try {
        const { title, category } = req.body.newChatData;
        // User id comes from the auth middleware
        const userId = req.id;

        const chat = await Chat.create({ title, category, userId });
        if(chat) {
            res.status(201).json({
                message: "New chat successfully created",
                id: chat._id,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

}

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
}