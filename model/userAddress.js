const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Ensure it's ObjectId type
    required: true,
  },
  firstname: {
    type: String,
    require: true,
  },
  lastname: {
    type: String,
    require: true,
  },
  mobile: {
    type: Number,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  town: {
    type: String,
    require: true,
  },
  state: {
    type: String,
    require: true,
  },
  pincode: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model("address", addressSchema);
