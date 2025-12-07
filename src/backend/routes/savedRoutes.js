const express = require("express");
const router = express.Router();
const Saved = require("../models/saved.js");

console.log("🔥 savedRoutes.js LOADED");

// ⭐ 1. Check if user already saved this school
router.get("/check/:firebaseUid/:name", async (req, res) => {
  try {
    const { firebaseUid, name } = req.params;

    const exists = await Saved.findOne({ firebaseUid, name });

    return res.json({
      success: true,
      saved: !!exists,
      message: exists
        ? "User already saved this record"
        : "User has not saved this record"
    });
  } catch (err) {
    console.error("Check saved error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ⭐ 2. Get all records for a user
router.get("/:firebaseUid", async (req, res) => {
  try {
    const list = await Saved.find({ firebaseUid: req.params.firebaseUid });

    return res.json({
      success: true,
      data: list
    });
  } catch (err) {
    console.error("Get saved error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load saved colleges"
    });
  }
});

// ⭐ 3. Create a new saved record
router.post("/", async (req, res) => {
  try {
    const {
      firebaseUid,
      name,
      deadline,
      location,
      website,
      notes,
      extras
    } = req.body;

    // Duplicate check per user
    const exists = await Saved.findOne({ firebaseUid, name });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "You already saved this record"
      });
    }

    const saved = new Saved({
      firebaseUid,
      name,
      deadline,
      location,
      website,
      notes,
      extras
    });

    const doc = await saved.save();

    return res.json({
      success: true,
      message: "Record saved successfully",
      data: doc
    });
  } catch (err) {
    console.error("Add saved error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to save record"
    });
  }
});

// ⭐ 4. Update a saved record
router.put("/:id", async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    const updated = await Saved.findOneAndUpdate(
      { _id: req.params.id, firebaseUid },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Record not found or unauthorized"
      });
    }

    return res.json({
      success: true,
      message: "Record updated",
      data: updated
    });
  } catch (err) {
    console.error("Update error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ⭐ 5. Delete a saved record
router.delete("/:id/:firebaseUid", async (req, res) => {
  try {
    const result = await Saved.findOneAndDelete({
      _id: req.params.id,
      firebaseUid: req.params.firebaseUid
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Record not found or unauthorized"
      });
    }

    return res.json({
      success: true,
      message: "Deleted"
    });

  } catch (err) {
    console.error("Delete saved error:", err);

    return res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
});

module.exports = router;
