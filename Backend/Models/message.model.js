import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true
    },

    userText: {
      type: String,
      required: true,
      trim: true
    },

    aiResponse: {
      type: String,
      required: true
    },

    inputTokens: {
      type: Number,
      required: true
    },

    outputTokens: {
      type: Number,
      required: true
    },

    totalTokens: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;