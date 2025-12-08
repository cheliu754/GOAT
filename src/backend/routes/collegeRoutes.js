const express = require("express");
const fs = require("fs");
const path = require("path");
const College = require("../models/college.js");

const router = express.Router();

const SHOULD_SEED =
  process.env.NODE_ENV !== "production" &&
  process.env.SEED_COLLEGES !== "false";
let seedChecked = false;

const formatCollege = (doc) => {
  const raw = doc?.toObject ? doc.toObject({ virtuals: true }) : doc;
  const location =
    raw.location || [raw.CITY, raw.STABBR].filter(Boolean).join(", ").trim();

  const acceptanceRate =
    raw.acceptanceRate ??
    (raw.ADM_RATE !== null && raw.ADM_RATE !== undefined
      ? `${(raw.ADM_RATE * 100).toFixed(1)}%`
      : null);

  const graduationRate =
    raw.graduationRate ??
    (raw.GRAD_RATE !== null && raw.GRAD_RATE !== undefined
      ? `${(raw.GRAD_RATE <= 1 ? raw.GRAD_RATE * 100 : raw.GRAD_RATE).toFixed(1)}%`
      : null);

  return {
    _id: raw._id,
    INSTNM: raw.INSTNM,
    CITY: raw.CITY,
    STABBR: raw.STABBR,
    ZIP: raw.ZIP,
    INSTURL: raw.INSTURL,
    CONTROL: raw.CONTROL,
    ADM_RATE: raw.ADM_RATE,
    SAT_AVG: raw.SAT_AVG,
    TUITION: raw.TUITION,
    TUITION_IN: raw.TUITION_IN,
    TUITION_OUT: raw.TUITION_OUT,
    GRAD_RATE: raw.GRAD_RATE,
    name: raw.name ?? raw.INSTNM,
    location,
    acceptanceRate,
    graduationRate,
  };
};

const ensureSeedData = async () => {
  if (!SHOULD_SEED || seedChecked) return;
  seedChecked = true;

  try {
    const count = await College.estimatedDocumentCount();
    if (count > 0) return;

    const seedPath = path.join(__dirname, "..", "dict", "seed-colleges.json");
    if (!fs.existsSync(seedPath)) return;

    const contents = await fs.promises.readFile(seedPath, "utf-8");
    const payload = JSON.parse(contents);

    if (!Array.isArray(payload) || payload.length === 0) return;

    await College.insertMany(payload);
    console.log(`Seeded ${payload.length} colleges for local development`);
  } catch (err) {
    console.error("Seed colleges error:", err);
  }
};

const findColleges = async ({ q, letter, limit = 100 } = {}) => {
  const clauses = [];

  if (q) {
    clauses.push({
      $or: [
        { INSTNM: { $regex: q, $options: "i" } },
        { CITY: { $regex: q, $options: "i" } },
        { STABBR: { $regex: q, $options: "i" } },
      ],
    });
  }

  if (letter) {
    clauses.push({
      INSTNM: { $regex: `^${letter}`, $options: "i" },
    });
  }

  const filter = clauses.length ? { $and: clauses } : {};
  const cappedLimit = Math.min(Number(limit) || 100, 500);

  const docs = await College.find(filter)
    .sort({ INSTNM: 1 })
    .limit(cappedLimit)
    .lean({ virtuals: true });

  return docs.map(formatCollege);
};

router.get("/search", async (req, res) => {
  try {
    await ensureSeedData();
    const { q, limit } = req.query;

    if (!q) {
      return res.json({ success: true, data: [], total: 0 });
    }

    const data = await findColleges({ q, limit: limit || 25 });
    console.log("College search hits:", data.length);

    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Lightweight suggestion list for the search bar
router.get("/suggestions", async (req, res) => {
  try {
    await ensureSeedData();
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const data = await findColleges({ q, limit: 10 });
    const suggestions = data.map((c) => ({
      id: c._id,
      label: c.name,
      value: c.name,
      location: c.location,
      city: c.CITY,
      state: c.STABBR,
    }));

    res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    delete req.body._id;

    const newCollege = new College(req.body);
    const saved = await newCollege.save();
    res.json({ success: true, data: formatCollege(saved) });
  } catch (err) {
    console.error("Add College Error:", err);
    res.status(500).json({ success: false, message: "Failed to add college" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
    }

    res.json({ success: true, data: formatCollege(updated) });
  } catch (err) {
    console.error("Update College Error:", err);
    res.status(500).json({ success: false, message: "Failed to update college" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await College.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
    }

    res.json({ success: true, message: "College deleted" });
  } catch (err) {
    console.error("Delete College Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete college" });
  }
});

router.get("/", async (req, res) => {
  try {
    await ensureSeedData();
    const { q, letter, limit } = req.query;
    const data = await findColleges({ q, letter, limit: limit || 200 });

    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error("Get Colleges Error:", err);
    res.status(500).json({ success: false, message: "Failed to get colleges" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const college = await College.findById(req.params.id).lean({ virtuals: true });
    if (!college) {
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
    }

    res.json({ success: true, data: formatCollege(college) });
  } catch (err) {
    console.error("Get College Error:", err);
    res.status(500).json({ success: false, message: "Failed to load college" });
  }
});

module.exports = router;
