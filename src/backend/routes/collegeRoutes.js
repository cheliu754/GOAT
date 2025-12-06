const express = require("express");
const College = require("../models/college.js");

const router = express.Router();

router.get("/search", async (req, res) => {
  const query = req.query.q;
  console.log("SEARCH QUERY =", query);

  if (!query) {
    return res.json([]);
  }

  try {
    const results = await College.find({
      $or: [
        { INSTNM: { $regex: query, $options: "i" } },
        { CITY: { $regex: query, $options: "i" } },
        { STABBR: { $regex: query, $options: "i" } },
      ],
    }).limit(20);

    console.log("RESULTS FOUND:", results.length);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    delete req.body._id;

    const newCollege = new College(req.body);
    const saved = await newCollege.save();
    res.json(saved);
  } catch (err) {
    console.error("Add College Error:", err);
    res.status(500).json({ error: "Failed to add college" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updated = await College.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Update College Error:", err);
    res.status(500).json({ error: "Failed to update college" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.json({ message: "College deleted" });
  } catch (err) {
    console.error("Delete College Error:", err);
    res.status(500).json({ error: "Failed to delete college" });
  }
});
router.get("/", async (req, res) => {
  try {
    const colleges = await College.find().limit(200);
    res.json(colleges);
  } catch (err) {
    console.error("Get Colleges Error:", err);
    res.status(500).json({ error: "Failed to get colleges" });
  }
});




module.exports = router;
