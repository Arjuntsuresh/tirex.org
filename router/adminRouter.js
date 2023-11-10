const express = require("express");
const adminRoute = express();
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const session = require("express-session");
const config = require("../config/config");
adminRoute.use(
  session({
    secret: config.sessonSecret,
    resave: false,
    saveUninitialized: true,
  })
);

const adminAuth = require("../middleWare/adminauth");

adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));
const adminController = require("../controller/adminController");
const adminOrderController=require('../controller/adminOrderController');
const productCrop=require('../middleWare/crop');
const bannerCrop=require('../middleWare/bannerCrop');

// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//        cb(null,path.join('../public/admin_assests/imgs'));
//     },
//     filename:function(req,file,cb){
//          const name=Date.now()+'-'+file.originalname;
//          cb(null,name);
//     }
// })
// const upload=multer({storage:storage})

const productStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./public/admin-assets/imgs");
  },  //extention
  filename: (req, file, callback) => {
    callback(null, Date.now() + file.originalname);
  },
});
//upload parameters for multer
const uploadprdt = multer({
  storage: productStorage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  }
});

adminRoute.set("view engine", "ejs");
adminRoute.set("views", path.join(__dirname, "../view/admin"));
// adminRoute.use(express.static(path.join(__dirname, 'public')));
adminRoute.use(express.static("public"));

adminRoute.get("/", adminAuth.isLogout, adminController.adminLogin);
adminRoute.post("/dashboard", adminController.verifyLogin);
adminRoute.get("/dashboard", adminAuth.isLogin, adminController.loadDashboard);
adminRoute.get("/logout", adminController.adminLogout);
adminRoute.get("/userlist", adminAuth.isLogin, adminController.userList);
adminRoute.get("/blocked", adminAuth.isLogin, adminController.userBlock);
adminRoute.get("/unblocked", adminAuth.isLogin, adminController.userUnBlock);

//category list -------------------------------------------------------------
adminRoute.get("/category", adminAuth.isLogin, adminController.categoryPage);
adminRoute.post("/category", adminAuth.isLogin, uploadprdt.single("image"), adminController.catagoryadd);
adminRoute.get("/categorylist", adminAuth.isLogin, adminController.catagoryList);
adminRoute.get("/catblocked", adminAuth.isLogin, adminController.catagoryBlock);
adminRoute.get("/catunblocked", adminAuth.isLogin, adminController.catagoryUnblock);

//product list----------------------------------------------------------------
adminRoute.get("/product", adminAuth.isLogin, adminController.productPage);
adminRoute.post(
  "/product",
  uploadprdt.array("image",5), adminAuth.isLogin,productCrop.productCrop,
  adminController.productadd
);
adminRoute.get("/productlist", adminAuth.isLogin, adminController.productList);
adminRoute.get("/problocked", adminAuth.isLogin, adminController.productBlock);
adminRoute.get("/prounblocked", adminAuth.isLogin, adminController.productUnblock);
adminRoute.get("/findid", adminAuth.isLogin, adminController.productid);
adminRoute.post("/updated", adminAuth.isLogin,uploadprdt.array("image",5),productCrop.productCrop,adminController.updateproduct);
// adminRoute.post('/updated',uploadprdt.array('image',5),(req,res)=>{
//   console.log(req.body)
//   console.log(req.files)
// })
adminRoute.get('/imagedelete', adminAuth.isLogin,adminController.deleteImage);
// adminRoute.post('/cropImage',uploadprdt.array("image",5),adminController.cropImage)


//order Management------------------------------------------------------------
adminRoute.get('/orderList', adminAuth.isLogin,adminOrderController.orderListByadmin);
adminRoute.post('/updatedOrder', adminAuth.isLogin,adminOrderController.adminOrderUpdate);
adminRoute.get('/orderdetails', adminAuth.isLogin,adminOrderController.adminOrderDetails);



//coupen management--------------------------------------------------------------
adminRoute.get('/coupen', adminAuth.isLogin,adminController.coupenPage);
adminRoute.post('/coupens', adminAuth.isLogin,adminController.coupenAdd);
adminRoute.get('/coupenlist', adminAuth.isLogin,adminController.coupenList);
adminRoute.get('/coupenblock', adminAuth.isLogin,adminController.coupenBlock);
adminRoute.get('/coupenUnblock', adminAuth.isLogin,adminController.coupenUnBlock);

//banner router-----------------------------------------------------------------------
adminRoute.get('/banner',adminAuth.isLogin,adminController.bannerManagement);
adminRoute.post('/addBanner',adminAuth.isLogin,uploadprdt.single("image"),bannerCrop.bannerCrop, adminController.banneradd);
adminRoute.get('/bannerList',adminAuth.isLogin,adminController.bannerList);
adminRoute.get('/bannerDelete',adminAuth.isLogin,adminController.bannerDelete);

//Dashboard management -----------------------------------------------------------------------
adminRoute.get('/salesReport',adminAuth.isLogin,adminController.salesReport)
// adminRoute.get('*',function(req,res){
//     res.redirect('/admin');
// });

module.exports = {
  adminRoute,
};
