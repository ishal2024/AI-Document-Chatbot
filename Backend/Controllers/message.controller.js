import mongoose from "mongoose";
import { qdrantClient, COLLECTION_NAME } from "../Config/qdrant.config.js";
import { generateEmbeddings } from "../Services/textEmbedding.service.js";
import { generateResponse } from "../Services/generateResponse.service.js";
import Message from "../Models/message.model.js";
import Chat from "../Models/chat.model.js";

export const saveMessage = async (chatId, inputText, aiResult) => {
    const session = await mongoose.startSession();

    try {
        let message;

        await session.withTransaction(async () => {

            // 1. Create message
            [message] = await Message.create(
                [
                    {
                        chatId,
                        userText: inputText,
                        aiResponse: aiResult.response,
                        inputTokens: aiResult.inputTokens,
                        outputTokens: aiResult.outputTokens,
                        totalTokens: aiResult.totalTokens
                    }
                ],
                { session }
            );

            // 2. Update chat
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $inc: {
                        messageCount: 1,
                        // totalToken: aiResult.totalTokens
                    },
                    $set: {
                        lastMessageAt: new Date()
                    }
                },
                {
                    new: true,
                    session,
                    runValidators: true
                }
            );

            if (!updatedChat) {
                throw new Error("Chat not found");
            }
        });

        return message;

    } finally {
        await session.endSession();
    }
};

export const generateResponseController = async (req, res, next) => {
    try {
        const { chatId, inputText } = req.body;

        // 1. Validate required fields
        if (!chatId || !inputText) {
            return res.status(400).json({
                success: false,
                message: "chatId and inputText are required."
            });
        }

        // 2. Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId."
            });
        }

        if (inputText.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Input text cannot exceed 1000 characters."
            });
        }

        // 4. Convert input text into embedding vector
        const queryVector = await generateEmbeddings(inputText.trim());

        // console.log("query vector" , queryVector)

        // 5. Search relevant vectors in Qdrant
        const searchResult = await qdrantClient.query(
            COLLECTION_NAME,
            {
                query: queryVector[0],

                filter: {
                    must: [
                        {
                            key: "chatId",
                            match: {
                                value: chatId.toString()
                            }
                        }
                    ]
                },

                limit: 2,
                with_payload: true
            }
        );

        const context = searchResult.points
            .map((point) => point.payload?.content)
            .join("\n\n");

        console.log("context ", context)

        // Generate AI response
        const aiResult = await generateResponse(inputText, context);

        console.log(aiResult);

        const savedMessage = await saveMessage(
            chatId,
            inputText,
            aiResult
        );

        return res.status(200).json({
            success: true,
            message: "AI response generated",
            data: {aiResult , message : savedMessage}
        });

    } catch (error) {
        next(error);
    }
};

