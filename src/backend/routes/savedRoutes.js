const express = require("express");
const router = express.Router();
const Saved = require("../models/saved.js");
console.log("🔥 savedRoutes.js LOADED");

// GET saved colleges
router.get("/", async (req, res) => {
  try {
    const list = await Saved.find();
    res.json(list);
  } catch (err) {
    console.error("Get saved error:", err);
    res.status(500).json({ error: "Failed to load saved colleges" });
  }
});

// ADD saved college
router.post("/", async (req, res) => {
  try {
    const { INSTNM, CITY, STABBR } = req.body;

    const saved = new Saved({ INSTNM, CITY, STABBR });
    const doc = await saved.save();

    res.json(doc);
  } catch (err) {
    console.error("Add saved error:", err);
    res.status(500).json({ error: "Failed to save college" });
  }
});

// UPDATE saved college
router.put("/:id", async (req, res) => {
  try {
    const updated = await Saved.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// DELETE saved
router.delete("/:id", async (req, res) => {
  try {
    await Saved.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete saved error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
