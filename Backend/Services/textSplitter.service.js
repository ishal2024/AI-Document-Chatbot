import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});

export async function splitTextIntoChunks(text) {
  const chunks = await splitter.splitText(text);

  return chunks;
}