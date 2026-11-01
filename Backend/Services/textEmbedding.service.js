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
