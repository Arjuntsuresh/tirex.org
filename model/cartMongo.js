const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  cart_items: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId, // Corrected from mongoose.Schema.ObjectId
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      product_name: {
        type: String,
        required: true,
      },
      offer_price: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
  ],
  total_products: {
    type: Number,
    default: 0,
  },
  total_price: {
    type: Number
  },
});

module.exports = mongoose.model("cart", cartSchema);
