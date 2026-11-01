// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// console.log("Google api key " , process.env.GOOGLE_API_KEY)

// export const embeddings = new GoogleGenerativeAIEmbeddings({
//   apiKey: process.env.GOOGLE_API_KEY,
//   model: "gemini-embedding-001"
// });

// export async function generateEmbeddings(chunks) {
//   const vectors =  await embeddings.embedDocuments(chunks);
//   return vectors
// }



import { pipeline } from "@huggingface/transformers";

let extractor;

async function loadModel() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  return extractor;
}

export async function generateEmbeddings(chunks) {
  const model = await loadModel();

  const output = await model(chunks, {
    pooling: "mean",
    normalize: true
  });

  return output.tolist();
}
