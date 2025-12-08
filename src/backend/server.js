const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://409-frontend-production.up.railway.app",
  "http://localhost:3000",
];
app.use(cors({
  origin: allowedOrigins,     // 前端运行的域名与端口
  credentials: true,          // 如需携带 cookie/凭证
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

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
