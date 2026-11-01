import crypto from "node:crypto";
import {  generateEmbeddings } from "./textEmbedding.service.js";
import { COLLECTION_NAME, qdrantClient } from "../Config/qdrant.config.js";


export async function storeDocumentChunks({chunks,chatId,userId,documentName}) {
  try {
    
    // 1. Generate embeddings
    console.log("chunks " , chunks)
    const vectors = await generateEmbeddings(chunks);

    console.log("vectors " , vectors)
  
    // 2. Prepare Qdrant points
    const points = chunks.map((chunk, index) => ({
      id: crypto.randomUUID(),
  
      vector: vectors[index],
  
      payload: {
        content: chunk,
        chatId: chatId.toString(),
        userId: userId.toString(),
        documentName,
        chunkIndex: index
      }
    }));
  
    // 3. Insert points into Qdrant
    // Batch insertion to avoid sending a huge request
    const batchSize = 64;
  
    for (let i = 0; i < points.length; i += batchSize) {
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points: points.slice(i, i + batchSize)
      });
    }
  
    return {
      success : true,
      totalChunks: points.length
    };
  } catch (error) {
    console.log("error " , error?.message)
    return {
      success : false,
      error
    };
  }
}