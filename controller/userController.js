const userModel = require("../model/userMongo");
const bcrypt = require("bcrypt");
const bodyparser = require("body-parser");
const products = require("../model/productModel");
const address = require("../model/userAddress");
const cartModel = require("../model/cartMongo");
const orderModel = require("../model/userOrderList");
const catagoryModel = require("../model/catagoryModel");
const walletModel = require("../model/walletModel");
const reviewModel=require('../model/reviewMongo');
const coupenModel = require("../model/coupenMogo");
const bannerModel=require('../model/bannerMongo');
const dotenv = require("dotenv");
const productModel = require("../model/productModel");
const { default: mongoose } = require("mongoose");
dotenv.config({ path: ".env" });
const accountSid = "AC957e4d0df7438f939639123397f54df6";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VA6aaa006d0023844861a7b33f54501a8f";
const client = require("twilio")(accountSid, authToken);
const Razorpay = require("razorpay");
const cartMongo = require("../model/cartMongo");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEYID,
  key_secret: process.env.RAZORPAY_SECRETKEY,
});

//load signup-----------------------------------------------
const loadSignup = async (req, res) => {
  try {
    res.render("userSignup");
  } catch (error) {
res.status(404).render('404page');
  }
};

//secure password ------------------------------------------
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch {
res.status(404).render('404page');
  }
};

//verify otp----------------------------------------------------------

const verifyValidation = async (req, res) => {
  try {
    const mobile = req.body.mobile;

    const check = await userModel.findOne({ email: req.body.email });
    if (check) {
      return res.render("userLogin", {
        message: "User already exists! Please login.",
      });
    } else {
      const verification = await client.verify.v2.services(verifySid).verifications.create({ to: `+91${mobile}`, channel: "sms" });

      console.log(verification.status);
      req.session.userData = req.body;
      res.render("otpVerification");
    }
  } catch (error) {
    console.log(error.message);
    // Handle the error, for example, render an error page or send a response.
    res.status(500).send("Internal Server Error");
  }
};

//otp verification ---------------------------------------------------
const verifyOtp = async (req, res) => {
  let { otp } = req.body;

  try {
    const userData = req.session.userData;

    if (!userData) {
      res.render("otpVerification", { message: "Invalid Session" });
    } else {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `+91${userData.mobile}`, code: otp })
        .then(async (verification_check) => {
          // Mark the callback function as async
          console.log(verification_check.status);
          if (verification_check.status === "approved") {
            const spassword = await securePassword(userData.password);
            const user = new userModel({
              name: userData.name,
              email: userData.email,
              mobile: userData.mobile,
              password: spassword,
              is_blocked: false,
              date:Date.now()
            });

            try {
              const userDataSave = await user.save();
              if (userDataSave) {
                req.session.user_id = userDataSave._id;
                const walletDate = new walletModel({
                  user_id: req.session.user_id,
                  walletAmount: 0,
                });
                walletDate.save();
                res.redirect("/home");
              } else {
                res.render("userSignup", { message: "Registration Failed" });
              }
            } catch (error) {
              console.log(error);

              res.render("userSignup", { message: "Registration Failed" });
            }
          } else {
            res.render("otpVerification", { message: "invalid otp" });
          }
        })
        .catch((error) => {
      res.status(404).render('404page');
        });
    }
  } catch (error) {
res.status(404).render('404page');
  }
};

//login user method started ------------------------------------------

const loginLoad = async (req, res) => {
  try {
    setTimeout(() => {
      res.render("userLogin");
    }, 300);
  } catch (error) {
res.status(404).render('404page');
  }
};

//verify log in -----------------------------------------------------------
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await userModel.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_blocked === false) {
          res.render("userLogin", {
            message: "Your are blocked ...please contact admin adminstrator",
          });
        } else {
          req.session.user_id = userData.id;
          //updated this one plz change
          res.redirect("/home");
          // res.redirect('/userProfile')
        }
      } else {
        res.render("userLogin", {
          message: "Email and password are in correct",
        });
      }
    } else {
      res.render("userLogin", { message: "Email and password are in correct" });
    }
  } catch (error) {
res.status(404).render('404page');
  }
};

//load home ---------------------------------------------------------------------
const loadHome = async (req, res) => {
  try {
    const id=req.session.user_id;
    const cartDatas = await cartModel.findOne({ user_id: req.session.user_id });
    const productlist = await products.find();
    const banner=await bannerModel.find();
    setTimeout(() => {
      res.render("home", { products: productlist, cartData: cartDatas,userid:id,banner });
    }, 800);
  } catch (error) {
res.status(404).render('404page');
  }
};

//product page load---------------------------------------------------------------
const loadproduct = async (req, res) => {
  try {
    const userid=req.session.user_id;
    const id = req.query.id;
    const productlist = await products.findOne({ _id: id });
    const review=await reviewModel.find({product_id:id});
   
    res.render("productDisplay", { products: productlist,review,userid });
  } catch (error) {
res.status(404).render('404page');
  }
};

//shop page load---------------------------------------------------------

const shopPageload = async (req, res) => {
  try {
    const userid=req.session.user_id;
    const cartData=await cartModel.find({user_id:userid});
    const productlist = await products.find({ isblocked: false });
    const categoryload = await catagoryModel.find({ isBlocked: false });
    setTimeout(() => {
      res.render("shopPageload", {
        products: productlist,
        category: categoryload,
        userid,
        cartData
      });
    }, 300);
  } catch (error) {
res.status(404).render('404page');
  }
};

//category items filter -----------------------------------------------------------
const catogeryFilter = async (req, res) => {
  try {
    const id = req.query.id;
    const userid=req.session.user_id;
    const cartData=await cartModel.find({user_id:userid});
    const categorylist = await catagoryModel.find();
    const productlist = await products.find({ category: id });
    res.render("shopPageload", {
      products: productlist,
      category: categorylist,
      userid,
      cartData
    });
  } catch (error) {
res.status(404).render('404page');
  }
};

//search product--------------------------------------------------------------------
const searchProduct = async (req, res) => {
  try {
    const userid=req.session.user_id
    const search = req.body.search_query;
    const cartData=await cartModel.find({user_id:userid});
    const categoryload = await catagoryModel.find({
      catugoryName: { $regex: new RegExp(search, "i") },
    });
    const productlist = await products.find({
      productName: { $regex: new RegExp(search, "i") },
    });

    if (productlist.length > 0) {
      res.render("shopPageload", {
        products: productlist,
        category: categoryload,
        userid,
        cartData
      });
    } else if (categoryload.length > 0) {
      const product = await productModel.find({
        category: categoryload[0].catugoryName,
      });
      res.render("shopPageload", {
        products: product,
        category: categoryload,
        userid,
        cartData
      });
    } else {
      res.render("shopPageload", {
        products: productlist,
        category: categoryload,
        userid,
        cartData
      });
    }
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
};

//user profile page ----------------------------------------------------------------
const userProfile = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const userData = await userModel.findOne({ _id: userid });
    const cartData = await cartModel.findOne({ user_id: req.session.user_id });
    if (!userData) {
      res.redirect("/login");
    } else {
      setTimeout(() => {
        res.render("userProfile", { users: userData,userid,cartData });
      }, 300);
    }
  } catch (error) {
res.status(404).render('404page');
  }
};

//userprofile edit-------------------------------------------------------------------
const userProfileEdit = async (req, res) => {
  try {
    const userid = req.query.id;
    const userData = await userModel.findById(userid);
    setTimeout(() => {
      res.render("userProfileedit", { users: userData,userid });
    }, 300);
  } catch (error) {
res.status(404).render('404page');
  }
};

//update user-------------------------------------------------------------------------
const updateUser = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      _id: req.session.user_id,
    };

    await userModel
      .findByIdAndUpdate({ _id: req.session.user_id }, data)
      .then((user) => {})
      .catch((error) => {});

    res.redirect("/userprofile");
  } catch (error) {
res.status(404).render('404page');
  }
};

//address page--------------------------------------------------------------------
const addressPage = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const useraddress = await address.find({ user_id: userid });
    setTimeout(() => {
      res.render("addresspage", { userdata: useraddress,userid });
    }, 300);
  } catch (error) {
res.status(404).render('404page');
  }
};

//add address---------------------------------------------------------------------
const addAddress = async (req, res) => {
  try {
    const data = new address({
      user_id: req.session.user_id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      mobile: req.body.mobile,
      address: req.body.address,
      town: req.body.town,
      state: req.body.state,
      pincode: req.body.pincode,
    });
    await data.save();
    res.redirect("/address");
  } catch (error) {
res.status(404).render('404page');
  }
};

//delete address-------------------------------------------------------------------
const deleteAdress=async (req,res)=>{
try {
  const id=req.query.id;
  addressDelete=await address.findByIdAndDelete(id);
  res.redirect('/address');
} catch (error) {
  res.status(404).render('404page');
}
}

//password edit -------------------------------------------------------------------
const passwordEdit = async (req, res) => {
  try {
    const userid = req.query.id;
    const userData = userModel.findById(userid);
    setTimeout(() => {
      res.render("editPassword",{userid});
    }, 300);
  } catch (error) {
res.status(404).render('404page');
  }
};

//update password ----------------------------------------------------------------------------
const updatedPassword = async (req, res) => {
  try {
    const userid = req.query.id;
    const password = req.body.old_password;
    const userData = await userModel.findOne({ _id: req.session.user_id });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        const newpassword = req.body.new_password;
        const confirmPassword = req.body.confirm_password;
        if (newpassword === confirmPassword) {
          const passwordHash = await bcrypt.hash(newpassword, 10);

          await userModel.findByIdAndUpdate(
            { _id: req.session.user_id },
            {
              password: passwordHash,
              _id: req.session.user_id,
            }
          );
          res.redirect("/userprofile");
        } else {
          res.render("editPassword", {
            message: "New password is not match!",
            inputdata: req.body,
            userid
          });
        }
      } else {
        res.render("editPassword", {
          message: "Current Password is wrong",
          inputdata: req.body,
          userid
        });
      }
    } else {
      res.render("editPassword", {
        message: "Unable to find the change the password",
        inputdata: req.body,
        userid
      });
    }
  } catch (error) {
res.status(404).render('404page');
  }
};

//placeorder----------------------------------------------------------------------------
const orderPage = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const cartData = await cartModel.findOne({ user_id: userid });
    const wallet = await walletModel.findOne({ user_id: userid });
    const coupen = await coupenModel.find();
   
    if (!cartData.cart_items.length) {
      res.render("cart", { message: "No item in the Cart", cartData,userid });
    } else {
      if (cartData) {
        const useraddress = await address.find({ user_id: userid });

        res.render("placeOrderpage", {
          userdata: useraddress,
          cartData: cartData,
          walletData: wallet,
          coupens: coupen,
          userid
        
        });
      }
    }
  } catch (error) {
res.status(404).render('404page');
  }
};

//orderpage add address---------------------------------------------------------------
const orderPageAddAddress = async (req, res) => {
  try {
    const data = new address({
      user_id: req.session.user_id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      mobile: req.body.mobile,
      address: req.body.address,
      town: req.body.town,
      state: req.body.state,
      pincode: req.body.pincode,
    });
    await data.save();

    setTimeout(() => {
      res.redirect("/PlaceOrder");
    }, 1000);
 
  } catch (error) {
res.status(404).render('404page');
  }
};

//thank you page render --------------------------------------------------------------
const thankYou = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user_id);
    const user_id = req.session.user_id;
    const address1 = req.body.address
    console.log(address1,'555555555');

    const user = await userModel.findById(user_id);
    const wallet = await walletModel.findOne({ user_id: userId }); // Use userId here

    const userAddress = await address.findById(address1);
    console.log(userAddress,'000000000000000000');
    const cartItem = await cartModel.findOne({ user_id: user_id });
    const order_date = new Date(Date.now());
    const year = order_date.getFullYear();
    const month = String(order_date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(order_date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const data = new orderModel({
      user_id: user_id,
      user_name: user.name,
      order_address: userAddress,
      order_date: formattedDate,
      delivery_status: "pending",
      total_price: req.body.total,
      payment_type: req.body.payment,
      product_details: cartItem.cart_items,
    });

    const orderData = await data.save();
    console.log(orderData,'122233323');

    for (let i = 0; i < cartItem.cart_items.length; i++) {
      const product = await productModel.findById({
        _id: cartItem.cart_items[i].product_id,
      });

      const updateStock = product.quantity - cartItem.cart_items[i].quantity;

      await productModel.findByIdAndUpdate(
        { _id: cartItem.cart_items[i].product_id },
        { $set: { quantity: updateStock } }
      );
    }

    if (orderData.payment_type === "wallet") {
      // Calculate the new wallet balance
      const walletamount = wallet.walletAmount - orderData.total_price;

      // Create a history entry for the wallet
      const history = {
        amount: -orderData.total_price, // Negative value to represent debit
        status: "debited",
        date: Date.now(),
      };

      // Add the history object to the wallet's history array
      wallet.history.push(history);

      // Update the wallet balance
      wallet.walletAmount = walletamount;
      // Save the updated wallet
      const saved = await wallet.save();
      orderData.delivery_status = "confirmed";
      await orderData.save();

      res.json({ status: true, payment: "wallet" });
    } else if (orderData.payment_type === "cod") {
      orderData.delivery_status = "confirmed";
      await orderData.save();
      res.json({ status: true, payment: "cod" });
    } else if (orderData.payment_type === "online") {
      const generatedOrder = await generateOrderRazorpay(
        orderData._id,
        orderData.total_price
      );
      res.json({
        razorpayOrder: generatedOrder,
        payment: "online",
        status: true,
        orderid: orderData._id,
      });
    } else {
      res.json({ status: false, message: "Invalid payment type" });
    }
  } catch (error) {
    console.error(error);
res.status(404).render('404page');
  }
};

//show thank you page -------------------------------------------------------------
const ShowThankyou = async (req, res) => {
  const userid = req.session.user_id;
  await cartModel.findOneAndRemove({ user_id: userid });
  res.render("thankYou");
};

//logout--------------------------------------------------------------------------
const userLogout = async (req, res) => {
  try {
    if (req.session.user_id) {
      req.session.destroy();
      res.redirect("/");
    }
  } catch (error) {
res.status(404).render('404page');
  }
};

//razorpay-----------------------------------------------------------------------------
const generateOrderRazorpay = (orderId, total) => {
  return new Promise((resolve, reject) => {
    const options = {
      amount: total * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: String(orderId),
    };
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.log("failed");
        console.log(err);
        reject(err);
      } else {
        // console.log("Order Generated RazorPAY: " + JSON.stringify(order));
        resolve(order);
      }
    });
  });
};

const verifyPayment = async (req, res) => {
  try {
    const id = req.body.orderid;
    const orderData = await orderModel.findById(id);
    orderData.delivery_status = "confirmed";
    orderData.payment_id=req.body.razorpay_payment_id;
    orderData.save();
    verifyOrderPayment(req.body);
    res.json({ status: true });
  } catch (error) {
    console.log("errro happemce in cart ctrl in function verifyPayment", error);
  }
};

//---------------verify the payment  razorpay-------------------------------

const verifyOrderPayment = (details) => {
  console.log("DETAILS : " + JSON.stringify(details));
  return new Promise((resolve, reject) => {
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRETKEY);
    hmac.update(details.razorpay_order_id + "|" + details.razorpay_payment_id);
    hmac = hmac.digest("hex");
    if (hmac == details.razorpay_signature) {
      console.log("Verify SUCCESS");
      resolve();
    } else {
      console.log("Verify FAILED");
      reject();
    }
  });
};
//coupen Management---------------------------------------------------------------------------------------
const coupenManagement = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const coupenCode = req.body.coupenCode;
    const findedcoupen = await coupenModel.findOne({ coupenCode: coupenCode });
    if (findedcoupen) {
      let cartModel = await cartMongo.findOne({ user_id: userid });
      let totalAmount = 0; // Initialize a variable to store the total amount
      for (let i = 0; i < cartModel.cart_items.length; i++) {
        totalAmount += parseFloat(
          cartModel.cart_items[i].offer_price * cartModel.cart_items[i].quantity
        ); // Add each offer_price to the total
      }
      res.json({
        coupenValid: true,
        discountAmount:totalAmount-findedcoupen.coupenAmount,
        discount:findedcoupen.coupenAmount
      })
    } else {
      console.log("error");
      res.json({ coupenValid: false });
    }
  } catch (error) {
res.status(404).render('404page');
  }
};










module.exports = {
  verifyValidation,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  loadSignup,
  verifyOtp,
  loadproduct,
  shopPageload,
  userProfile,
  userProfileEdit,
  updateUser,
  addressPage,
  passwordEdit,
  updatedPassword,
  addAddress,
  orderPage,
  thankYou,
  catogeryFilter,
  searchProduct,
  ShowThankyou,
  verifyPayment,
  orderPageAddAddress,
  coupenManagement,
  deleteAdress

};
