import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import collegeRoutes from "./routes/collegeRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/colleges", collegeRoutes);
console.log("SERVER STARTING...");


// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/college_tracker")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Server Start
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
