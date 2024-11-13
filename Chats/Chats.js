const User = require("../Schemas/User")
const Chat = require("../Schemas/Chat")
const Message = require("../Schemas/Message")


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

exports.addMessage = async (req, res) => {
    try {
        const { role, content, chatId } = req.body.newMessageData;
        // User id comes from the auth middleware
        const userId = req.id;

        const message = new Message({ role, content, chatId });
        const saveMessages = await message.save();
        
        // Push the message ID to the Chat document’s messages array
        const updateChat = await Chat.findByIdAndUpdate(chatId, {
            $push: { messages: message._id }
        });

        if(updateChat) {
            res.status(201).json({
                message: "New message successfully added",
                id: message._id,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        })
    }
}