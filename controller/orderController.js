const catagoryModel = require("../model/catagoryModel");
const productModel = require("../model/productModel");
const orderModel = require("../model/userOrderList");
const walletModel = require("../model/walletModel");
const reviewModel=require("../model/reviewMongo");
const { orderPage } = require("./userController");
const userMongo = require("../model/userMongo");

//order list page load-------------------------------------------------------------
const orderList = async (req, res) => {
  try {
    const userid=req.session.user_id
    const orderDetails = await orderModel.find({user_id:userid});
    const currentPage = parseInt(req.query.page) || 1;
    setTimeout(() => {
      res.render("orderList", { orderModel: orderDetails,currentPage,userid });
    }, 300);
  } catch (error) {
   res.status(404).render('404page');
  }
};

//cancel order----------------------------------------------------------------------
const cancelOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const userid = req.session.user_id;
    const userOrder = await orderModel.findById(id);
    const userWallet = await walletModel.findOne({ user_id: userid });
   
    const updated = await orderModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          delivery_status: "canceled",
        },
      }
    );

    if (updated) {
      if (userOrder.payment_type == "online") {
        // Update walletAmount
        let wallet = parseInt(userWallet.walletAmount)
        let price = parseInt(userOrder.total_price)
        let total = wallet + price
        userWallet.walletAmount = total

        // Create history object
        const history = {
          amount: userOrder.total_price,
          status: "credited",
          date: Date.now(),
        };

        // Add the history object to the wallet's history array
        userWallet.history.push(history);
        // Save the updated wallet
         await userWallet.save();
      
      }
    }

    res.redirect("/userorderlist");
  } catch (error) {
   res.status(404).render('404page');
  }
};

//return option ----------------------------------------------------------------------
const returnOrder = async (req, res) => {
  try {
    const reason = req.query.reason;
    const id = req.query.id;
    const userid = req.session.user_id;
    const userOrder = await orderModel.findById(id);
    const userWallet = await walletModel.findOne({ user_id: userid });
    const productDetails = userOrder.product_details;

    const result = await orderModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          delivery_status: "Returned",
          return_reason: reason,
        },
      }
    );

    if(result){
      
      if (userOrder.payment_type == "online" || userOrder.payment_type == "cod" || userOrder.payment_type == "wallet" ) {
           // Update walletAmount
           let wallet = parseInt(userWallet.walletAmount)
           let price = parseInt(userOrder.total_price)
           let total = wallet + price
           userWallet.walletAmount = total
   
           // Create history object
           const history = {
             amount: userOrder.total_price,
             status: "credited",
             date: Date.now(),
           };
   
           // Add the history object to the wallet's history array
           userWallet.history.push(history);
           // Save the updated wallet
            await userWallet.save();
      }
    }
   

      // Iterate through productDetails and update product quantities
      for (const productDetail of productDetails) {
        const productId = productDetail.product_id;
        const returnedQuantity = productDetail.quantity;

        // Find the corresponding product in your database and update its quantity
        const product = await productModel.findById(productId);

        if (product) {
          // Increase the product's quantity
          product.quantity += returnedQuantity;

          // Save the updated product
          await product.save();
        }
      }
    res.redirect("/userorderlist");
  } catch (error) {
    res.status(404).render("404page");
  }
  
};

//order Details-----------------------------------------------------------------------
const orderDetails = async (req, res) => {
  try {
    const id = req.query.id;
    req.session.temp=id
    const order = await orderModel.find({ _id: id });
    res.render("orderDetails", { orderModel: order });
  } catch (error) {
   res.status(404).render('404page');
  }
};

//wallet order details page --------------------------------------------------------------
const walletHistory=async (req,res)=>{
  try {
    const userid=req.session.user_id
    const wallet =await walletModel.find({user_id:userid});
    res.render('walletPage',{wallet,userid});
  } catch (error) {
   res.status(404).render('404page');
  }
}

//review management -------------------------------------------------------------------------------------------------
const reviewPage=async (req,res)=>{
  try {
    const id = req.query.id;
    const order = await orderModel.find({ _id: id });
    res.render('review',{ orderModel: order });
    
  } catch (error) {
    res.status(404).render('404page');
  }
}

//update review----------------------------------------------------------------------------------------
const updateReview=async (req,res)=>{
  try {
    const id = req.session.temp;
    const userid = req.session.user_id
    const username = await userMongo.findOne({_id : userid})
    const order = await orderModel.find({ _id: id });
    const product_id = order[0].product_details[0].product_id
    const data=new reviewModel({
      user_id:id,
      user_name : username.name,
      product_id: product_id,
      review:req.body.review,
      starRating:req.body.rating,
      date : Date.now()
    })
        await data.save();
        res.render('orderDetails',{ orderModel: order})
    
  } catch (error) {
    res.status(404).render('404page');
  }
}

//Product Page review----------------------------------------------------------------------------------
const productPageReview=async (req,res)=>{
  try {
    const id = req.query.id;
   const product=await productModel.findOne({_id:id});
    res.render('productSideReview',{ orderModel: product });
    
  } catch (error) {
    res.status(404).render('404page');
  }
}


//product page updation review---------------------------------------------------------------------------
const updateProductPageReview = async (req, res) => {
  try {
    const id = req.query.productid;
    const userid = req.session.user_id;
    const username = await userMongo.findOne({ _id: userid });
    const product = await productModel.findOne({ _id: id });

    // Check if the user has already submitted a review for this product
    const existingReview = await reviewModel.findOne({
      user_id: userid,
      product_id: product._id,
    });

    if (existingReview) {
      // Handle the case where the user has already submitted a review
      res.status(400).send('You have already submitted a review for this product.');
      return;
    }

    const data = new reviewModel({
      user_id: userid,
      user_name: username.name,
      product_id: product._id,
      review: req.body.review,
      starRating: req.body.rating,
      date: Date.now()
    });

    await data.save();

    // Fetch the updated list of reviews
    const review = await reviewModel.find({ product_id: id });

    // Render the "productDisplay" page with the updated data
    res.render('productDisplay', { products:product, review,userid });
  } catch (error) {
    res.status(404).render('404page');
  }
}

//invoice----------------------------------------------------------------------------------------
const invoice=async (req,res)=>{
  try {
    const orderId=req.query.id
    const userId=req.session.user_id;
    const orderDetail=await orderModel.findById(orderId);
    const user=await userMongo.findById(userId);
   

    res.render('invoice',{orderDetail,user});
  } catch (error) {
    res.status(404).render('404page');
  }
}






module.exports = {
  orderList,
  cancelOrder,
  orderDetails,
  returnOrder,
  walletHistory,
  reviewPage,
  updateReview,
  productPageReview,
  productPageReview,
  updateProductPageReview,
  invoice
};
