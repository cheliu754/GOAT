const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
const allowedOrigins = [
  "https://409-frontend-production.up.railway.app",
  "http://localhost:3000",
  "http://localhost:5173",
  ...envOrigins
];

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // Allow server-to-server / curl with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
}));

app.use(express.json());


// 载入 routes
const collegeRoutes = require("./routes/collegeRoutes.js");
const savedRoutes = require("./routes/savedRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

// 注册路由
app.use("/api/colleges", collegeRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/users", userRoutes);

console.log("SERVER STARTING...");

// MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected (Atlas)"))
  .catch((err) => console.log("MongoDB connection error:", err));

const PORT = process.env.SERVER_RUN_PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
