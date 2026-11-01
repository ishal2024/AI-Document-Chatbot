import Chat from "../Models/chat.model.js";
import {extractPdfText} from "../Services/pdfParse.service.js"
import { storeDocumentChunks } from "../Services/storeDocumentChunks.service.js";
import {splitTextIntoChunks} from "../Services/textSplitter.service.js"

export async function createChatController(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF is required"
      });
    }

    // Step 5: Create Chat document
    const chat = await Chat.create({
      userId: req?.userId,
      documentName: req.file.originalname
    });

    // Step 2: Validate extracted content

    const extractedText = await extractPdfText(req.file.buffer);

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in PDF"
      });
    }

     // Step 3: Split text into chunks
    const chunks = await splitTextIntoChunks(extractedText);

    // Step 4: Generate embeddings
    const result = await storeDocumentChunks({
      chunks,
      chatId: chat?._id,
      userId: req?.userId,
      documentName: req?.file?.originalname
    });

    if(result?.success == false){
      next(result?.error)
    }


    return res.status(201).json({
      success: true,
      message: "Chat created successfully",

      data: {
        chat,
        totalChunks: result.totalChunks
      }
    });

  } catch (error) {
    next(error);
  } 
}
