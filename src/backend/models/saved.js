const mongoose = require("mongoose");

const ExtraFieldSchema = new mongoose.Schema({
  id: String,
  label: String,
  type: String,              // "text" | "number" | "flag"
  value: mongoose.Mixed      // string | number | boolean
});

const SavedSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },
  
  // 前端字段
  name: { type: String, required: true },       // 原本 INSTNM，但前端叫 name
  deadline: { type: String, default: "" },      // 前端是 string，不是 Date
  location: { type: String, default: "" },      // "CITY, STABBR"
  website: { type: String, default: "" },
  notes: { type: String, default: "" },
  applicationStatus: { type: String, default: "Not Started" },
  essayStatus: { type: String, default: "Not Started" },
  recommendationStatus: { type: String, default: "Not Started" },
  extras: { type: [ExtraFieldSchema], default: [] },

  createdAt: { type: Date, default: Date.now }
});

// 防止重复（按 user + name）
SavedSchema.index({ firebaseUid: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Saved", SavedSchema);
