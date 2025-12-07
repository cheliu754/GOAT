const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // ⭐ Firebase 的唯一 UID → 你的业务主键
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    default: null
  },

  name: {
    type: String,
    default: null
  },

  // ⭐ 用户保存的学校列表（以后可能不用，因为你已经做了 Saved model）
  // 如果你以后想让 user 直接引用 saved college，可以打开下面这段：
  /*
  savedColleges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saved"
    }
  ],
  */

  // ⭐ 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ⭐ 让 firebaseUid 成为数据库层级的 unique 索引
UserSchema.index({ firebaseUid: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
