const mongoose = require("mongoose");

const userOrderList = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
  },
  order_address: {
    type: Object,
    required: true,
  },
  order_date: {
    type: Date,
  },
  delivery_status: {
    type: String,
    required: true,
  },
  total_price: {
    type: String,
    required: true,
  },
  payment_type: {
    type: String,
    required: true,
  },
  product_details: {
    type: Array,
    required: true,
  },
  payment_id:{
   type:String
  },
  return_reason:{
    type:String
  }
});

module.exports = mongoose.model("order", userOrderList);
