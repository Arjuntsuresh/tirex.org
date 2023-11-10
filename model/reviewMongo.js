const mongoose =require ('mongoose');

const reviewModel=new mongoose.Schema({
    user_id:{
        type:mongoose.Types.ObjectId,
        require:true
    },
    user_name : {
        type : String,
        require : true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "product",
        required: true,
      },
      review: {
        type: String,
        require: true,
      },
      starRating:{
        type:Number,
        require:true
      },
      date:{
        type:Date,
        require:true
      }
})

module.exports=mongoose.model('review',reviewModel);