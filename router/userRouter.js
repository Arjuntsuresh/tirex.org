const express = require("express");
const userRoute = express();

const bodyParser = require("body-parser");
const path = require("path");
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));
const userController = require("../controller/userController");
const orderController = require("../controller/orderController");
const cartController = require("../controller/cartController");
const session = require("express-session");
const config = require("../config/config");
const nocache = require("nocache");
// const {accountSid,authToken,verifySid}=require('../otp auth/otpauth');
userRoute.use(
  session({
    secret: config.sessonSecret,
    resave: false,
    saveUninitialized: true,
  })
);
userRoute.use(nocache());
const auth = require("../middleWare/auth");

const multer = require("multer");
// const { isLogin } = require("../middleWare/auth");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/public/userImages"));
  },
  filename: function (req, file, cd) {
    const name = Date.now() + "-" + file.originalname;
    cd(null, name);
  },
});

const upload = multer({ storage: storage });

userRoute.set("view engine", "ejs");
userRoute.set("views", path.join(__dirname, "../view/users"));

//home page -----------------------------------------------------------
userRoute.get("/", userController.loadHome);
userRoute.get("/home",auth.isLogin, userController.loadHome);

//user signup----------------------------------------------------------
userRoute.get("/userSignup", userController.loadSignup);
userRoute.post("/verifyUserSignup", userController.verifyValidation);
userRoute.post("/otp", userController.verifyOtp);

//user login------------------------------------------------------------
userRoute.get("/login", userController.loginLoad);
userRoute.post("/login", userController.verifyLogin);

//userLogout ------------------------------------------------------------
userRoute.get("/logout", auth.isLogin, userController.userLogout);

//product display---------------------------------------------------------

userRoute.get("/product",auth.isLogin, userController.loadproduct);

//shop page render---------------------------------------------------------

userRoute.get("/shoppage",auth.isLogin, userController.shopPageload);
userRoute.get("/categoryItems",auth.isLogin, userController.catogeryFilter);
userRoute.post("/search",auth.isLogin, userController.searchProduct);

//user profile page -------------------------------------------------------

userRoute.get("/userprofile",auth.isLogin, userController.userProfile);

//user profile edit---------------------------------------------------------
userRoute.get("/edit",auth.isLogin, userController.userProfileEdit);
userRoute.post("/updated",auth.isLogin, userController.updateUser);

//address page -------------------------------------------------------------
userRoute.get("/address",auth.isLogin, userController.addressPage);
userRoute.post("/addaddress",auth.isLogin, userController.addAddress);
userRoute.get('/deleteAddress',auth.isLogin,userController.deleteAdress);

//password edit ------------------------------------------------------------
userRoute.get("/passwordEdit",auth.isLogin, userController.passwordEdit);
userRoute.post(
  "/updatedPassword",
  auth.isLogin,
  userController.updatedPassword
);
//cart page------------------------------------------------------------------
userRoute.get("/cart",auth.isLogin,cartController.cartPage);
userRoute.post("/add-to-cart",auth.isLogin,cartController.addToCart);
// userRoute.get("/increase", cartController.incrementQuantity);
// userRoute.get("/decrease", cartController.decrementQuantity);
userRoute.get("/deleteProduct",auth.isLogin, cartController.cartItemDelete);
userRoute.post('/changeqnty/:id',auth.isLogin,cartController.updatecart);
userRoute.post('/getQuantity/:id',auth.isLogin,cartController.quantity);


//order page------------------------------------------------------------------

userRoute.get("/PlaceOrder",auth.isLogin, userController.orderPage);
userRoute.post('/orderaddaddress',auth.isLogin,userController.orderPageAddAddress);

//thank you-------------------------------------------------------------------
userRoute.post("/thankyou", auth.isLogin, userController.thankYou);
userRoute.get('/thankyou' , auth.isLogin , userController.ShowThankyou)

//order controller------------------------------------------------------------
userRoute.get("/userorderlist",auth.isLogin, orderController.orderList);
userRoute.get('/cancelorder',auth.isLogin,orderController.cancelOrder);
userRoute.get('/returnorder',auth.isLogin,orderController.returnOrder);
userRoute.get('/orderdetails',auth.isLogin,orderController.orderDetails)
userRoute.post('/verifypayment',auth.isLogin,userController.verifyPayment);
userRoute.get('/wallethistory',auth.isLogin,orderController.walletHistory);
//coupen controller------------------------------------------------------------
userRoute.post('/get-coupen-details',auth.isLogin,userController.coupenManagement);

//review management-------------------------------------------------------------
userRoute.get('/productReview',auth.isLogin,orderController.reviewPage);
userRoute.post('/updateReview',auth.isLogin,orderController.updateReview);
userRoute.get('/productPageReview',auth.isLogin,orderController.productPageReview);
userRoute.post('/productUpdateReview',auth.isLogin,orderController.updateProductPageReview);

//invoice ----------------------------------------------------------------------------
userRoute.get('/invoice',auth.isLogin,orderController.invoice);








module.exports = {
  userRoute,
};
