import dotenv from 'dotenv'
dotenv.config()
import { QdrantClient } from "@qdrant/js-client-rest";
console.log("qdrant url " , process.env.QDRANT_URL)


export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false
});

export const COLLECTION_NAME = "document_chunks";
