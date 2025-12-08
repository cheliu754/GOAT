const mongoose = require("mongoose");

const CollegeSchema = new mongoose.Schema({
  INSTNM: String,
  CITY: String,
  STABBR: String,
  ZIP: String,
  INSTURL: String,
  CONTROL: Number,
  ADM_RATE: Number,
  GRAD_RATE: Number,
  // Optional fields used by the frontend UI
  TUITION: Number,                 // Combined tuition for display
  TUITION_IN: Number,              // In-state tuition
  TUITION_OUT: Number,             // Out-of-state tuition
  // SAT average, etc.
  SAT_AVG: Number,
});

// Expose friendly fields expected by the frontend via virtuals
CollegeSchema.virtual("name").get(function () {
  return this.INSTNM;
});

CollegeSchema.virtual("location").get(function () {
  const city = this.CITY || "";
  const state = this.STABBR || "";
  return [city, state].filter(Boolean).join(", ").trim();
});

CollegeSchema.virtual("acceptanceRate").get(function () {
  if (this.ADM_RATE === null || this.ADM_RATE === undefined) return null;
  // ADM_RATE is stored as 0-1; convert to percentage with one decimal place.
  return `${(this.ADM_RATE * 100).toFixed(1)}%`;
});

CollegeSchema.virtual("graduationRate").get(function () {
  if (this.GRAD_RATE === null || this.GRAD_RATE === undefined) return null;
  const rate = this.GRAD_RATE <= 1 ? this.GRAD_RATE * 100 : this.GRAD_RATE;
  return `${rate.toFixed(1)}%`;
});

CollegeSchema.set("toJSON", { virtuals: true });
CollegeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("College", CollegeSchema);
