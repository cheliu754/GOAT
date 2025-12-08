const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");

// Debug log
console.log("🔥 userRoutes.js LOADED");

// All user routes require authentication
router.use(auth);

// ⭐ 1. 同步用户信息（前端登录后调用）
// 如果用户不存在 → 创建
// 如果存在 → 更新 name/email
router.post("/sync", async (req, res) => {
  try {
    const firebaseUid = req.user?.uid;
    const email = req.user?.email || req.body.email || null;
    const name = req.body.name || req.user?.name || null;

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        message: "firebaseUid is required"
      });
    }

    // 1. 先检查用户是否存在
    const existing = await User.findOne({ firebaseUid });

    let isNewUser = false;
    let user;

    if (!existing) {
      // 2. 新用户 → 创建新 user
      isNewUser = true;
      user = await User.create({
        firebaseUid,
        email,
        name
      });
    } else {
      // 3. 老用户 → 更新信息
      user = await User.findOneAndUpdate(
        { firebaseUid },
        { email, name },
        { new: true }
      );
    }

    // 4. 返回前端
    return res.json({
      success: true,
      message: "User synced successfully",
      isNewUser,
      data: user
    });

  } catch (err) {
    console.error("User sync error:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});



// ⭐ 2. 获取用户信息（通过 firebaseUid）
router.get("/:firebaseUid?", async (req, res) => {
  try {
    const requestedUid = req.params.firebaseUid || req.user?.uid;

    if (requestedUid !== req.user?.uid) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    const user = await User.findOne({
      firebaseUid: requestedUid
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User info loaded",
      data: user
    });

  } catch (err) {
    console.error("Get user error:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ⭐ 3. 更新用户信息（通常用不到，但可以保留）
router.put("/:firebaseUid?", async (req, res) => {
  try {
    const requestedUid = req.params.firebaseUid || req.user?.uid;

    if (requestedUid !== req.user?.uid) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    const updated = await User.findOneAndUpdate(
      { firebaseUid: requestedUid },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated",
      data: updated
    });

  } catch (err) {
    console.error("Update user error:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ⭐ 4. 删除用户（可选，可不写）
router.delete("/:firebaseUid?", async (req, res) => {
  try {
    const requestedUid = req.params.firebaseUid || req.user?.uid;

    if (requestedUid !== req.user?.uid) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    await User.findOneAndDelete({
      firebaseUid: requestedUid
    });

    res.json({
      success: true,
      message: "User deleted"
    });

  } catch (err) {
    console.error("Delete user error:", err);

    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
});


module.exports = router;
