const orderModel=require('../model/userOrderList');


//admin order list -----------------------------------------------------------------------
const orderListByadmin=async (req,res)=>{
    try {
        const orderList= await orderModel.find()
        const currentPage = parseInt(req.query.page) || 1;
        res.render ('adminOrderList',{orderModel:orderList,currentPage});

    } catch (error) {
       res.status(500).render('500page');
    }
}

//admin order update-----------------------------------------------------------------------

const adminOrderUpdate=async (req,res)=>{
    try {
        const id=req.body.orderId
const order= await orderModel.findById(id);

order.delivery_status=req.body.selectedValue
const updated=await order.save();

res.json({status:true})
        
    } catch (error) {
       res.status(500).render('500page');
    }
}

//admin order details -------------------------------------------------------------------------
const adminOrderDetails=async (req,res)=>{
    try {
        const id=req.query.id
        const order = await orderModel.find({ _id: id });
        res.render('adminOrderDetalis',{orderModel:order});
        
    } catch (error) {
       res.status(500).render('500page');
    }
}


module.exports={
    orderListByadmin,
    adminOrderUpdate,
    adminOrderDetails
}