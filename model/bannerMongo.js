const mongoose=require('mongoose');
const bannerModel=new mongoose.Schema({
    
    banner_name:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    isBlocked:{
        type:Boolean,
        required:true
    }

});

module.exports=mongoose.model('banner',bannerModel);