const mongoose = require("mongoose");

const catagorySchema = new mongoose.Schema({
  catugoryName: {
    type: String,
    require: true,
  },
  image: {
    type: Array,
    require: true,
  },
  isBlocked: {
    type: Boolean,
    require: true,
  },
});

module.exports = mongoose.model("category", catagorySchema);
