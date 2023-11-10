const admin = require("../model/adminMongo");
const user = require("../model/userMongo");
const category = require("../model/catagoryModel");
const products = require("../model/productModel");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const cartMongo = require("../model/cartMongo");
const catagoryModel = require("../model/catagoryModel");
const productModel = require("../model/productModel");
const coupenModel = require("../model/coupenMogo");
const bannerModel = require("../model/bannerMongo");
const orderModel = require("../model/userOrderList");
// const { createCanvas, loadImage } = require('canvas');
const sharp = require("sharp");
const userMongo = require("../model/userMongo");

//load admin login ------------------------------------------------------
const adminLogin = async (req, res) => {
  try {
    res.status(200).render("adminlogin");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//verify login ----------------------------------------------------------
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await admin.findOne({ email: email });
    if (adminData) {
      const psasswordMatch = await bcrypt.compare(password, adminData.password);
      if (psasswordMatch) {
        if (adminData.is_admin === false) {
          res.render("adminlogin", {
            message: "Email and password are incorrect",
          });
        } else {
          req.session.admin_id = adminData._id;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("adminlogin", {
          message: "Email and password are incorrect",
        });
      }
    } else {
      res.render("adminlogin", { message: "Email and password are incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//load dashboard-----------------------------------------------------------------------
const loadDashboard = async (req, res) => {
  try {
    const orderlength = await orderModel.find({ delivery_status: "Delivered" });
    const product = await productModel.find();
    const catagory = await catagoryModel.find();
    const order = await orderModel.find({
      $or: [
        { payment_type: "wallet" },
        { payment_type: "online" },
        { delivery_status: "Delivered" },
      ],
    });
    //chart report

    const today1 = new Date();
    const currentMonth = today1.getMonth() + 1; // +1 because months are 0-based

    const monthlySales = await orderModel.aggregate([
      {
        $match: {
          delivery_status: "Delivered",
          order_date: {
            $lte: today1, // Only include orders up to the current date
          },
        },
      },
      {
        $group: {
          _id: {
            $month: "$order_date",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
   

    const monthlySalesArray = Array.from(
      { length: currentMonth },
      (_, index) => {
        const monthData = monthlySales.find((item) => item._id === index + 1);
        return monthData ? monthData.count : 0;
      }
    );

    //user growth-----------------
    const usersGrowth = await userMongo.aggregate([
      {
        $match: {
          is_blocked: false, //filtered by checking blocked users
        },
      },
      {
        $project: {
          month: { $month: { $toDate: "$date" } },
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const usersGrowthArray = Array.from({ length: 12 }, (_, index) => {
      const monthData = usersGrowth.find((item) => item._id === index + 1);
      return monthData ? monthData.count : 0;
    });

   
    res.render("dashboard", { order, monthlySalesArray, product, catagory,usersGrowthArray });
  } catch (error) {
    res.status(500).render("500page");
  }
};

//user list --------------------------------------------------------------------------------
const userList = async (req, res) => {
  try {
    const listUser = await user.find();
    res.render("userList", { users: listUser , req: req});
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//user block --------------------------------------------------------------------------------

const userBlock = async (req, res) => {
  try {
    const id = req.query.id;
    await user.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_blocked: false,
        },
      }
    );
    if (req.session.user) {
      req.session.destroy();
    }
    res.redirect("/admin/userList");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//unblock user-----------------------------------------------------------------------------------
const userUnBlock = async (req, res) => {
  try {
    const id = req.query.id;
    await user.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_blocked: true,
        },
      }
    );
    res.redirect("/admin/userList");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//category add----------------------------------------------------------------------------

const categoryPage = async (req, res) => {
  try {
    res.render("category");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//catagory add-------------------------------------------------------------------------------
const catagoryadd = async (req, res) => {
  try {
    const catogaryData = await category.find();
    for (let i = 0; i < catogaryData.length; i++) {
      if (req.body.name === catogaryData[i].catugoryName) {
        return res.render("category", {
          message: "The catogary is allready exist.",
          catogery: catogaryData,
        });
      }
    }

    const check = await category.findOne({
      catugoryName: { $regex: req.body.name, $options: "i" },
    });
    if (check) {
      res.render("category", { message: "Category already exist" });
    } else {
      const categorys = new category({
        catugoryName: req.body.name,
        image: req.file.filename,
        isBlocked: false,
      });
      const saved = await categorys.save();
      if (saved) {
        res.redirect("/admin/categorylist");
      } else {
        res.render("category", { message: "error" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//category list ---------------------------------------------------------------------------
const catagoryList = async (req, res) => {
  try {
    const catagorylist = await category.find();

    res.render("categoryList", { categorys: catagorylist });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//category block--------------------------------------------------------------------------
const catagoryBlock = async (req, res) => {
  try {
    const id = req.query.id;
    const categorys = await catagoryModel.findById(id);

    const products = await productModel.find({
      category: categorys.catugoryName,
    });

    for (let i = 0; i < products.length; i++) {
      products[i].isblocked = true;
      products[i].save();
    }
    await category.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          isBlocked: true,
        },
      }
    );

    res.redirect("/admin/categorylist");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//category unblock--------------------------------------------------------------------------
const catagoryUnblock = async (req, res) => {
  try {
    const id = req.query.id;
    const categorys = await catagoryModel.findById(id);
    const products = await productModel.find({
      category: categorys.catugoryName,
    });

    for (let i = 0; i < products.length; i++) {
      products[i].isblocked = false;
      products[i].save();
    }
    await category.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          isBlocked: false,
        },
      }
    );

    res.redirect("/admin/categorylist");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//product ----------------------------------------------------------------------------
const productPage = async (req, res) => {
  try {
    const catogaryData = await category.find();
    res.render("productPage", { catogery: catogaryData });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//product add--------------------------------------------------------------------------------
const productadd = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      const catogaryData = await category.find();

      return res.render("productPage", {
        message: "Please select at least one image",
        catogery: catogaryData,
      });
    }

    const imageFiles = req.files.map((file) => {
      return file.filename;
    });
    const product = new products({
      productName: req.body.name,
      brandName: req.body.brandName,
      images: imageFiles,
      category: req.body.category,
      regularPrice: req.body.price,
      salePrice: req.body.salesPrice,
      gst: req.body.GST,
      date: new Date(Date.now()),
      quantity: req.body.quantity,
      isblocked: false,
    });

    await product.save();

    return res.redirect("/admin/productlist");
  } catch (error) {
    console.error(error.message);
    res.status(500).render("500page");
  }
};

//product list--------------------------------------------------------------------------------
const productList = async (req, res) => {
  try {
    const productlist = await products.find();
    const currentPage = parseInt(req.query.page) || 1; // Get the current page from the query parameter

    res.render("productList", { products: productlist, currentPage }); // Pass `currentPage` to the EJS template
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//product block-----------------------------------------------------------------------------------
const productBlock = async (req, res) => {
  try {
    const id = req.query.id;

    await products.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          isblocked: true,
        },
      }
    );

    res.redirect("/admin/productlist");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//product unblock--------------------------------------------------------------------------

const productUnblock = async (req, res) => {
  try {
    const id = req.query.id;
    await products.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          isblocked: false,
        },
      }
    );

    res.redirect("/admin/productlist");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//edit product------------------------------------------------------------------------------
const productid = async (req, res) => {
  try {
    const id = req.query.id;
    req.session.tempuser = req.query.id;
    const details = await products.findById(id);
    const category = await catagoryModel.find();
    res.render("productEdit", { detail: details, category });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};
//update product ------------------------------------------------------------------------------

const updateproduct = async (req, res) => {
  try {
    const id = req.session.tempuser;

    const image = [];
    const product = await productModel.findOne({ _id: id });

    for (let i = 0; i < req.files.length; i++) {
      image.push(req.files[i].filename);
    }

    for (let i = 0; i < product.images.length; i++) {
      image.push(product.images[i]);
    }

    const data = {
      productName: req.body.name,
      brandName: req.body.brandName,
      images: image,
      category: req.body.category,
      regularPrice: req.body.price,
      salePrice: req.body.salesPrice,
      gst: req.body.GSD,
      date: req.body.date,
      quantity: req.body.quantity,
    };

    await products.findByIdAndUpdate({ _id: id }, { $set: data });
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//delete image ----------------------------------------------------------------------------
const deleteImage = async (req, res) => {
  try {
    const id = req.query.id;
    const image_id = req.query.image_id;

    const product1 = await productModel.findByIdAndUpdate(
      id,
      { $pull: { images: image_id } },
      { new: true }
    );
    const details = await products.findById(id);
    const category = await catagoryModel.find();

    res.render("productEdit", { detail: details, category });
  } catch (error) {
    console.log(error.message);
  }
};

// //crop image ------------------------------------------------------------------------------
// const cropImage = async (req, res) => {
//   try {
//     const productId = req.body.productId; // Get the product ID from the form
//     const details = await products.findById(productId);
//     const category = await catagoryModel.find();
//     const image =
//     res.render("productEdit", { detail: details, category });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };
//admin logout-----------------------------------------------------------------------------

const adminLogout = async (req, res) => {
  try {
    if (req.session.admin_id) {
      req.session.destroy();
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//coupen page ------------------------------------------------------------------------------
const coupenPage = async (req, res) => {
  try {
    res.render("coupenPage");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//add coupen ----------------------------------------------------------------------------
const coupenAdd = async (req, res) => {
  try {
    const existingCoupon = await coupenModel.findOne({
      coupenCode: req.body.coupenCode,
    });
    const check = await coupenModel.findOne({
      coupenCode: { $regex: req.body.coupenCode, $options: "i" },
    });

    if (check) {
      res.render("coupenPage", { message: "Coupon already exists" });
    } else {
      const newCoupon = new coupenModel({
        coupenCode: req.body.coupenCode,
        startDate: req.body.startDate,
        expireDate: req.body.endDate,
        coupenAmount: req.body.coupenAmount,
        is_blocked: false,
      });

      const saved = await newCoupon.save();

      if (saved) {
        setTimeout(() => {
          res.redirect("/admin/coupenlist");
        }, 1000);
      } else {
        res.redirect("/addcoupen", { message: "Error saving coupon" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//coupen list page---------------------------------------------------------------------
const coupenList = async (req, res) => {
  try {
    const coupenList = await coupenModel.find();

    res.render("coupenList", { coupens: coupenList });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//coupen block---------------------------------------------------------------------------
const coupenBlock = async (req, res) => {
  try {
    const id = req.query.id;

    await coupenModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_blocked: true,
        },
      }
    );

    res.redirect("/admin/coupenlist");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//coupen unblock----------------------------------------------------------------------

const coupenUnBlock = async (req, res) => {
  try {
    const id = req.query.id;
    await coupenModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_blocked: false,
        },
      }
    );

    res.redirect("/admin/coupenlist");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500page");
  }
};

//banner model-------------------------------------------------------------------------------------
const bannerManagement = async (req, res) => {
  try {
    res.render("bannerAdd");
  } catch (error) {
    res.status(500).render("500page");
  }
};

//banner add---------------------------------------------------------------------------------------
const banneradd = async (req, res) => {
  try {
    const bannerData = await bannerModel.find();
    for (let i = 0; i < bannerData.length; i++) {
      if (req.body.bannerName === bannerData[i].banner_name) {
        return res.render("bannerAdd", {
          message: "The banner is already exist",
        });
      }
    }
    console.log(req.file.filename, "111");
    const check = await bannerModel.findOne({
      banner_name: { $regex: req.body.bannerName, $options: "i" },
    });

    if (check) {
      return res.render("bannerAdd", { message: "Banner is already exist" });
    } else {
      const newBanner = new bannerModel({
        banner_name: req.body.bannerName,
        image: req.file.filename,
        isBlocked: false,
      });
      console.log(req.file.filename);
      const saved = await newBanner.save();
      if (saved) {
        res.redirect("/admin/bannerList");
      } else {
        return res.render("bannerAdd", { message: "error" });
      }
    }
  } catch (error) {
    res.status(500).render("500page");
  }
};

//banner list --------------------------------------------------------------------------------------
const bannerList = async (req, res) => {
  try {
    const banners = await bannerModel.find();
    res.render("bannerList", { banners });
  } catch (error) {
    res.status(500).render("500page");
  }
};
//banner delete---------------------------------------------------------------------------------------
const bannerDelete = async (req, res) => {
  try {
    const bannerId = req.query.id;
    const ballerDelete = await bannerModel.findByIdAndDelete(bannerId);
    res.redirect("/admin/bannerList");
  } catch (error) {
    res.status(500).render("500page");
  }
};

//admin dashboard------------------------------------------------------------------------------------
const AdminloadDashboard = async (req, res) => {
  try {
    const orderlength = await orderModel.find({ delivery_status: "Delivered" });
    const product = await productModel.find();
    const order = await orderModel.find({
      $or: [
        { payment_type: "Wallet" },
        { payment_type: "Razorpay" },
        { delivery_status: "Delivered" },
      ],
    });

    //chart report

    const today1 = new Date();
    const currentMonth = today1.getMonth() + 1; // +1 because months are 0-based

    const monthlySales = await orderModel.aggregate([
      {
        $match: {
          delivery_status: "Delivered",
          order_date: {
            $lte: today1, // Only include orders up to the current date
          },
        },
      },
      {
        $group: {
          _id: {
            $month: "$order_date",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const monthlySalesArray = Array.from(
      { length: currentMonth },
      (_, index) => {
        const monthData = monthlySales.find((item) => item._id === index + 1);
        return monthData ? monthData.count : 0;
      }
    );
    res.render("dashboard");
  } catch (error) {
    res.status(500).render("500page");
  }
};

//sales report -------------------------------------------------------------------------------------
const salesReport = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const order = await orderModel.find({
      $or: [
        { payment_type: "wallet" },
        { payment_type: "online" },
        { delivery_status: "Delivered" },
      ],
    });
    res.render("salesReport", { order,currentPage });
  } catch (error) {
    res.status(404).render("404page");
  }
};

module.exports = {
  adminLogin,
  verifyLogin,
  loadDashboard,
  adminLogout,
  userList,
  userBlock,
  userUnBlock,
  categoryPage,
  catagoryadd,
  catagoryList,
  catagoryBlock,
  catagoryUnblock,
  productPage,
  productadd,
  productList,
  productBlock,
  productUnblock,
  productid,
  updateproduct,
  coupenPage,
  coupenAdd,
  coupenList,
  coupenBlock,
  coupenUnBlock,
  deleteImage,
  bannerManagement,
  banneradd,
  bannerList,
  bannerDelete,
  salesReport,
};
