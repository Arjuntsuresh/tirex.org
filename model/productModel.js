const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    require: true,
  },
  brandName: {
    type: String,
    require: true,
  },
  images: {
    type: Array,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  regularPrice: {
    type: Number,
    require: true,
  },
  salePrice: {
    type: Number,
    require: true,
  },
  stockStatus: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  gst: {
    type: Number,
    require: true,
  },
  isblocked: {
    type: Boolean,
    require: true,
  },
});

module.exports = mongoose.model("product", productSchema);
