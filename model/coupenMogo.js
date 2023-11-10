const mongoose =require ('mongoose');

const coupenModel=new mongoose.Schema({
   
    coupenCode:{
        type:String,
        require:true
    },
    startDate:{
        type:Date,
        require:true
    },
    expireDate:{
        type:Date,
        require:true
    },
    coupenAmount:{
        type:Number,
        require:true
    },
    is_blocked:{
        type:Boolean,
        require:true
    }

})

module.exports=mongoose.model('coupen',coupenModel);