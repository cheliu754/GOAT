import express from "express";
import College from "../models/college";

const router = express.Router();

router.get("/search", async (req, res) => {
  const query = req.query.q as string;
  console.log("SEARCH QUERY =", query);

  // 如果没有输入，返回空数组
  if (!query) {
    return res.json([]);
  }

  const results = await College.find({
    $or: [
      { INSTNM: { $regex: query, $options: "i" } },
      { CITY: { $regex: query, $options: "i" } },
      { STABBR: { $regex: query, $options: "i" } },
    ],
  }).limit(20);
  console.log("RESULTS FOUND:", results.length);
  res.json(results);
});

export default router;
