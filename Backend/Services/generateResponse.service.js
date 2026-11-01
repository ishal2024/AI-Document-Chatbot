import groq from "../Config/groq.config.js";


export async function generateResponse(inputText, context) {

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,

    messages: [
      {
        role: "system",
        content: `
          You are a helpful document AI assistant.

          Answer the user's question using only the
          provided document context.

          If the answer is not available in the context,
          clearly tell the user that the information
          is not available in the uploaded document.

          Do not make up facts.

          Document Context:
          ${context}
        `
      },
      {
        role: "user",
        content: inputText
      }
    ],
  });

  return {
    response: completion.choices[0].message.content,
    inputTokens: completion.usage.prompt_tokens,
    outputTokens: completion.usage.completion_tokens,
    totalTokens: completion.usage.total_tokens
  };
}