const mongoose =require ('mongoose');

const walletModel=new mongoose.Schema({
    user_id:{
        type:mongoose.Types.ObjectId,
        require:true
    },
    walletAmount:{
        type:Number,
        require:true
    },
    history:[{
        amount:{
            type:Number
        },
        status:{
            type:String,
            require:true
        },
        date:{
            type:Date
        }
    }]
})

module.exports=mongoose.model('wallet',walletModel);