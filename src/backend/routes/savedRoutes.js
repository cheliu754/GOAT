const express = require("express");
const router = express.Router();
const Saved = require("../models/saved.js");
const auth = require("../middleware/auth.js");

console.log("🔥 savedRoutes.js LOADED");

// All saved routes require authentication
router.use(auth);

const buildLocation = (body) => {
  if (body.location) return body.location;
  const city = body.CITY || "";
  const state = body.STABBR || "";
  const combined = [city, state].filter(Boolean).join(", ").trim();
  return combined;
};

const normalizeSaved = (doc) => {
  const raw = doc?.toObject ? doc.toObject() : doc;
  const location = buildLocation(raw) || raw.location || "";

  return {
    ...raw,
    location,
    name: raw.name || raw.INSTNM || "",
    applicationStatus: raw.applicationStatus || "Not Started",
    essayStatus: raw.essayStatus || "Not Started",
    recommendationStatus: raw.recommendationStatus || "Not Started"
  };
};

const statusOrDefault = (value, fallback = "Not Started") => {
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
};

// ⭐ 1. Check if user already saved this school
router.get("/check/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const firebaseUid = req.user.uid;

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
router.get("/", async (req, res) => {
  try {
    const list = await Saved.find({ firebaseUid: req.user.uid });

    return res.json({
      success: true,
      data: list.map(normalizeSaved)
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
    const firebaseUid = req.user.uid;
    const {
      name: plainName,
      INSTNM,
      deadline,
      DEADLINE,
      location,
      CITY,
      STABBR,
      website,
      WEBSITE,
      notes: notesPayload,
      NOTES: notesUpper,
      extras
    } = req.body;

    const name = plainName || INSTNM;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name/INSTNM is required"
      });
    }

    const recordLocation = buildLocation({ location, CITY, STABBR });
    const recordDeadline = deadline ?? DEADLINE ?? "";
    const recordWebsite = website ?? WEBSITE ?? "";
    const recordNotes = notesPayload ?? notesUpper ?? "";
    const recordExtras = Array.isArray(extras) ? extras : [];
    const applicationStatus = statusOrDefault(req.body.applicationStatus || req.body.status);
    const essayStatus = statusOrDefault(req.body.essayStatus);
    const recommendationStatus = statusOrDefault(req.body.recommendationStatus);

    // Duplicate check per user by name
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
      deadline: recordDeadline,
      location: recordLocation,
      website: recordWebsite,
      notes: recordNotes,
      extras: recordExtras,
      applicationStatus,
      essayStatus,
      recommendationStatus
    });

    const doc = await saved.save();

    return res.json({
      success: true,
      message: "Record saved successfully",
      data: normalizeSaved(doc)
    });
  } catch (err) {
    console.error("Add saved error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to save record"
    });
  }
});

// ⭐ 3b. Get a single record (by id) for the current user
router.get("/:id", async (req, res) => {
  try {
    const doc = await Saved.findOne({
      _id: req.params.id,
      firebaseUid: req.user.uid
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Record not found or unauthorized"
      });
    }

    return res.json({
      success: true,
      data: normalizeSaved(doc)
    });
  } catch (err) {
    console.error("Get saved record error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load record"
    });
  }
});

// ⭐ 4. Update a saved record
router.put("/:id", async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const update = {};

    if (req.body.name || req.body.INSTNM) {
      update.name = req.body.name || req.body.INSTNM;
    }

    if (req.body.deadline !== undefined || req.body.DEADLINE !== undefined) {
      update.deadline = req.body.deadline ?? req.body.DEADLINE ?? "";
    }

    const patchedLocation = buildLocation(req.body);
    if (patchedLocation) {
      update.location = patchedLocation;
    }

    if (req.body.website !== undefined || req.body.WEBSITE !== undefined) {
      update.website = req.body.website ?? req.body.WEBSITE ?? "";
    }

    if (req.body.notes !== undefined || req.body.NOTES !== undefined) {
      update.notes = req.body.notes ?? req.body.NOTES ?? "";
    }

    if (req.body.extras !== undefined) {
      update.extras = Array.isArray(req.body.extras) ? req.body.extras : [];
    }

    if (req.body.applicationStatus !== undefined || req.body.status !== undefined) {
      update.applicationStatus = statusOrDefault(
        req.body.applicationStatus ?? req.body.status
      );
    }

    if (req.body.essayStatus !== undefined) {
      update.essayStatus = statusOrDefault(req.body.essayStatus);
    }

    if (req.body.recommendationStatus !== undefined) {
      update.recommendationStatus = statusOrDefault(req.body.recommendationStatus);
    }

    const updated = await Saved.findOneAndUpdate(
      { _id: req.params.id, firebaseUid },
      update,
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
      data: normalizeSaved(updated)
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
router.delete("/:id", async (req, res) => {
  try {
    const result = await Saved.findOneAndDelete({
      _id: req.params.id,
      firebaseUid: req.user.uid
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
