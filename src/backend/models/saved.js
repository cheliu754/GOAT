const mongoose = require("mongoose");

const SavedSchema = new mongoose.Schema({
  INSTNM: String,
  CITY: String,
  STABBR: String,
});

module.exports = mongoose.model("Saved", SavedSchema);
