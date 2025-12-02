import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema({
  INSTNM: String,
  CITY: String,
  STABBR: String,
  ZIP: String,
  INSTURL: String,
  CONTROL: Number,
  ADM_RATE: Number,
  SAT_AVG: Number,
});

export default mongoose.model("College", CollegeSchema);
