import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required : true
  },

  title: {
    type: String,
    trim: true,
    default: "New Chat"
  },

  documentName: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    default: ""
  },

  messageCount: {
    type: Number,
    default: 0
  },

  lastSummarizedMessageCount: {
    type: Number,
    default: 0
  },

  lastMessageAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

chatSchema.index({ userId: 1, createdAt: -1 });

const Chat = mongoose.model("Chat" , chatSchema)

export default Chat