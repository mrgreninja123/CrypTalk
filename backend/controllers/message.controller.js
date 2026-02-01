import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Find existing conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // Create new conversation if it doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Create and save new message
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });
        await newMessage.save();

        // Push message to conversation and save
        conversation.messages.push(newMessage._id);
        await conversation.save();

        // SOCKET IO FUNCTIONLITY WILL GO HERE
        // this will run in parallel
        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;  // ✅ Fixed: proper destructuring
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages"); //NOT REFERENCE BUT ACTUAL MESSAGES 

        if (!conversation) {
            return res.status(200).json([]);  // ✅ Fixed: consistent return
        }

        const messages = conversation.messages;

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller:", error.message);  // ✅ Fixed: correct error message
        res.status(500).json({ error: "Internal server error" });
    }
};
