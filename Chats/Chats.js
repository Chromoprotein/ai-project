const User = require("../Schemas/User");
const Chat = require("../Schemas/Chat");
const Message = require("../Schemas/Message");
const SystemMessage = require("../Schemas/SystemMessage");
let OpenAI = require('openai');
const mongoose = require('mongoose');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

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
            {role: "system", content: "Generate a short, user-friendly title based on the following message. If the message lacks clear context or is vague, use 'General Chat' or something simple and generic as the title."},
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
            {role: "system", content: "Choose the category that is the best fit for the user's message. The possible categories are: Facts, Tutorials, Brainstorming, Coding, Writing, Image Generation, Image Analysis, Social Chat, Fun and Memes, Serious Chat, Support, Opinion, Vent. If the message doesn't fit in any of these categories, you can make one up or use Other. Respond with only the category's name without quotation marks or markdown."},
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

// AI ENDPOINTS

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

// CHAT-RELATED

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
            .populate({
                path: 'botId',
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
        const { userMessage, botId } = req.body.newChatData;
        // User id comes from the auth middleware
        const userId = req.id;

        // Validate botId
        const validBotId = botId && mongoose.Types.ObjectId.isValid(botId) ? botId : null;

        const generatedTitle = await renameChat(userMessage, res);
        const generatedCategory = await categorizeChat(userMessage, res);

        if(generatedTitle && generatedCategory) {
            const chat = await Chat.create({ title: generatedTitle, botId: validBotId, category: generatedCategory, userId });
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

// BOT PERSONA-RELATED

exports.getAllBots = async (req, res) => {

    try {
        const userId = req.id;

        const bots = await SystemMessage.find({ userId: userId }).lean()

        if (!bots) {
            return res.status(404).send('Bots not found');
        };

        if(bots) {
            res.status(200).json({ bots })
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }
};

// Creates a new system message / bot persona
exports.newSystemMessage = async (req, res) => {

    try {
        const { formData, sharedData } = req.body;
        const { botName, instructions, userInfo, traits } = formData;

        const userId = req.id;

        if(botName && instructions) { // mandatory fields

            const bot = await SystemMessage.create({ botName, userId, instructions, traits: JSON.stringify(traits), userInfo });
            if(bot) {

                const user = await User.findById(userId);
                if (!user) {
                    return res.status(404).send('User not found');
                }
                // Add new settings
                user.sharedWithBots.push({
                    botId: bot._id,
                    ...sharedData
                });

                await user.save();

                res.status(201).json({
                    message: "New system message successfully created",
                    id: bot._id,
                });
            }
        } else {
            res.status(500).json({
                message: "Name and instructions are required",
                error: error.message,
            });
        }

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }

};

exports.editBot = async (req, res) => {

    try {
        const { formData, sharedData } = req.body;
        const { botId, botName, instructions, userInfo, traits } = formData;

        const userId = req.id;

        if (!botId || !botName || !instructions) { // mandatory fields
            return res.status(400).json({
                message: "Bot ID, name, and instructions are required",
            });
        }

        const existingBot = await SystemMessage.findOne({ _id: botId, userId });

        if (!existingBot) {
            return res.status(404).json({
                message: "Bot not found or does not belong to the user",
            });
        }

        existingBot.botName = botName;
        existingBot.instructions = instructions;
        existingBot.traits = JSON.stringify(traits);
        existingBot.userInfo = userInfo;

        await existingBot.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update or create sharing preferences for the bot
        const botSettingsIndex = user.sharedWithBots.findIndex(bot => bot.botId.toString() === botId);
        if (botSettingsIndex > -1) {
            // Update existing settings
            user.sharedWithBots[botSettingsIndex] = {
                botId,
                ...sharedData
            };
        } else {
            // Add new settings
            user.sharedWithBots.push({
                botId,
                ...sharedData
            });
        }

        await user.save();

        res.status(200).json({
            message: "Bot successfully updated",
            id: existingBot._id,
        });

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        });
    }
};

exports.deleteBot = async (req, res) => {
    try {
        const { botId } = req.params;

        const userId = req.id;

        if (!botId) {
            return res.status(400).json({
                message: "Bot ID is required",
            });
        }

        const bot = await SystemMessage.findOne({ _id: botId, userId });

        if (!bot) {
            return res.status(404).json({
                message: "Bot not found or does not belong to the user",
            });
        }

        await SystemMessage.deleteOne({ _id: botId, userId });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('Error removing profile data permissions from bot: user not found');
        }

        await User.updateOne({ _id: userId, lastBotId: botId }, { $unset: { lastBotId: "" } });

        await User.updateOne(
            { _id: userId }, // Find the user
            { $pull: { sharedWithBots: { botId: botId } } } // Remove the specific bot's entry
        );

        res.status(200).json({
            message: "Bot persona successfully deleted",
        });

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        });
    }
};

exports.forgetBot = async (req, res) => {

    try {

        const userId = req.id;

        await User.updateOne({ _id: userId }, { $unset: { lastBotId: "" } });

        res.status(200).json({
            message: "Switched to not using custom instructions",
        });

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        });
    }

}

exports.setLastBotId = async (req, res) => {
    try {
        const userId = req.id;

        const { botId } = req.body;

        if (!botId) {
            return res.status(400).json({
                message: "Bot ID is required",
            });
        }

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.lastBotId = botId;

        await user.save();

        res.status(200).json({
            message: "Latest used bot updated",
            lastBotId: user.lastBotId,
        });

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        });
    }
}

exports.getLastBot = async (req, res) => {
    try {
        const userId = req.id;

        // Find what the last used bot is
        const user = await User.findById(userId, '-password').lean();

        if (!user || !user.lastBotId) {
            return res.status(200).json(null);
        }

        const foundLastBot = await SystemMessage.findById(user.lastBotId);

        return res.status(200).json({ foundLastBot });

    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        });
    }
}

// AVATAR-RELATED

// Generates a new avatar with Dalle for bots or users
exports.generateAvatar = async (req, res) => {
    try {
        const { botId, prompt } = req.body;
        const userId = req.id; // Extracted from middleware

        let description;
        let existingEntity;

        if (botId) {
            existingEntity = await SystemMessage.findOne({ _id: botId, userId });
            if (!existingEntity) {
                return res.status(404).json({ message: "Bot not found or does not belong to the user" });
            }
            description = existingEntity.instructions 
                ? `Generate an avatar for a bot that has the following instructions: ${existingEntity.instructions}.`
                : "Generate an avatar for a chatbot.";
        } else {
            existingEntity = await User.findOne({ _id: userId });
            if (!existingEntity) {
                return res.status(404).json({ message: "User not found" });
            }
            description = existingEntity.aboutMe || existingEntity.interestsHobbies
                ? `Generate an avatar for a user. About them: ${existingEntity.aboutMe || ''} Interests and hobbies: ${existingEntity.interestsHobbies || ''}`
                : "Generate a general user avatar.";
        }

        // Override with user-provided prompt if available
        if (prompt) {
            description = prompt;
        }

        // Call DALL-E API to generate avatar
        const avatar = await getdalle(description);

        if (avatar) {
            return res.status(200).json(avatar);
        }

    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

// Saves a generated avatar for either a bot or a user
exports.saveAvatar = async (req, res) => {
    const { botId, avatar } = req.body;
    const userId = req.id;

    if (!avatar) {
        return res.status(400).json({ error: 'An avatar is required' });
    }

    try {
        const avatarResponse = await axios.get(avatar, { responseType: 'arraybuffer' });

        // Resize the image
        const processedImage = await sharp(avatarResponse.data)
            .resize(128, 128)
            .toBuffer();

        const base64Image = Buffer.from(processedImage, 'binary').toString('base64');

        let existingEntity;

        if (botId) {
            existingEntity = await SystemMessage.findOne({ _id: botId, userId });
            if (!existingEntity) {
                return res.status(404).json({ message: "Bot not found" });
            }
        } else {
            existingEntity = await User.findOne({ _id: userId });
            if (!existingEntity) {
                return res.status(404).json({ message: "User not found" });
            }
        }

        // Save avatar to MongoDB
        existingEntity.avatar = base64Image;
        await existingEntity.save();

        res.json({ message: 'Avatar uploaded successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload avatar.' });
    }
};

// Deletes an avatar for either a bot or a user
exports.clearAvatar = async (req, res) => {
    const { botId } = req.params;
    const userId = req.id;

    try {
        let updateResult;

        if (botId) {
            updateResult = await SystemMessage.updateOne({ _id: botId, userId }, { $unset: { avatar: "" } });
            if (updateResult.modifiedCount === 0) {
                return res.status(404).json({ message: "Bot not found or does not belong to the user" });
            }
        } else {
            updateResult = await User.updateOne({ _id: userId }, { $unset: { avatar: "" } });
            if (updateResult.modifiedCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }
        }

        res.json({ message: 'Avatar deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete avatar.' });
    }
};

exports.placeholderAvatar = async (req, res) => {
    const { botId, avatar } = req.body; // `avatar` is now just the filename
    const userId = req.id;

    if (!avatar || !botId) {
        return res.status(400).json({ error: 'An avatar filename is required or bot not found' });
    }

    try {
        // Validate bot ownership
        const existingBot = await SystemMessage.findOne({ _id: botId, userId });
        if (!existingBot) {
            return res.status(404).json({ message: "Bot not found" });
        }

        // Construct the full path to the image
        const imagePath = path.join(__dirname, '..', 'frontend', 'public', avatar);

        // Ensure the file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: "Avatar file not found" });
        }

        // Read and resize the image
        const processedImage = await sharp(imagePath)
            .resize(128, 128)
            .toBuffer();

        // Convert to Base64 for MongoDB storage
        const base64Image = processedImage.toString('base64');

        // Save to MongoDB
        existingBot.avatar = base64Image;
        await existingBot.save();

        res.json({ message: 'Avatar uploaded successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload avatar.' });
    }
};