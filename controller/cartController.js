const mongoose = require("mongoose");
const products = require("../model/productModel");
const cartModel = require("../model/cartMongo");
const productModel = require("../model/productModel");
const reviewMongo = require("../model/reviewMongo");

//cart page -----------------------------------------------------------------------

const cartPage = async (req, res) => {
  try {
    let userid = req.session.user_id;
    const cartData = await cartModel.findOne({ user_id: userid });
    // const productIds = cartData.cart_items.map(item => item.product_id);
    // const products=await productModel.find({_id:productIds})
    if (!cartData) {
      res.redirect("/home");
    }

    if (!userid) {
      return res.redirect("/login");
    } else {
      if (!cartData.cart_items.length) {
        setTimeout(() => {
          res.render("cart", { message: "Cart is empty", cartData, userid });
        }, 300);
      } else {
        setTimeout(() => {
          res.render("cart", { cartData, userid });
        }, 300);
      }
    }
  } catch (error) {
    res.status(404).render("404page");
  }
};

//add to cart--------------------------------------------------------------------------------
const addToCart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productId = req.query.id;
    const productlist = await products.findOne({ _id: productId });
    const review = await reviewMongo.find({ product_id: productId });

    if (!productlist || !userid) {
      return res.redirect("/login");
    }
    const cart_item = {
      product_id: productId,
      quantity: 1,
      product_name: productlist.productName,
      offer_price: productlist.salePrice,
      image: productlist.images[0],
    };

    let cartCheck = await cartModel.findOne({ user_id: userid });

    if (!cartCheck) {
      cartCheck = await cartModel.create({
        user_id: userid,
        cart_items: [cart_item],
      });
    } else {
      const existingCartItem = cartCheck.cart_items.find(
        (item) => item.product_id.toString() === productId
      );

      if (existingCartItem) {
        existingCartItem.quantity += 1;
      } else {
        cartCheck.cart_items.push(cart_item);
      }
    }

    if (productlist.quantity < 1) {
      return setTimeout(() => {
        res.render("productDisplay", { products: productlist, review, userid });
      }, 1500);
    }

    const totalProducts = cartCheck.cart_items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cartCheck.total_products = totalProducts;

    await cartCheck.save();

    return setTimeout(() => {
      res.render("productDisplay", { products: productlist, review,userid });
    }, 1000);
  } catch (error) {
    res.status(404).render("404page");
  }
};

//cart item delete---------------------------------------------------------------
const cartItemDelete = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.query.id);
    const userId = new mongoose.Types.ObjectId(req.session.user_id);
    const updateProduct = await cartModel.findOneAndUpdate(
      { user_id: userId },
      { $pull: { cart_items: { product_id: productId } } },
      { new: true }
    );
    res.redirect("/cart");
  } catch (error) {
    console.log(error);
    res.status(404).render("404page");
  }
};

//quantity controller----------------------------------------------------------------------

const updatecart = async (req, res) => {
  try {
    const userid = req.session.user_id;

    const productId = req.params.id;
    const productQuantity = await productModel.findOne({ _id: productId });
    const productQty=productQuantity.quantity;
    const newquantity = req.body.quantity;

    parseInt(newquantity);

    const product = await productModel.findOne({ _id: productId });

    const cart = await cartModel.findOne({ user_id: userid });

    let sum = 0;

    const existingcartitem = await cart.cart_items.find((items) => {
      return items.product_id.toString() === product._id.toString();
    });

    let price = existingcartitem.quantity * existingcartitem.offer_price;
    let cartT = 0;
    cart.cart_items.forEach((item) => {
      cartT += item.quantity * item.offer_price;
    });
    if (newquantity > product.stock) {
      return res.send({ status: false, totalPrice: price, cartTotal: cartT });
    }

    if (existingcartitem) {
      existingcartitem.quantity = newquantity;
      await cart.save();
    } else {
      console.log("no items");
    }
    var stock = true;
    if (product.stock < existingcartitem.quantity) {
      stock = false;
    } else {
      stock = true;
    }
    await product.save();

    const totalPrice = existingcartitem.quantity * existingcartitem.offer_price;
    let cartTotal = 0;

    cart.cart_items.forEach((item) => {
      cartTotal += item.quantity * item.offer_price;
    });

    res.send({
      status: true,
      totalPrice: totalPrice,
      cartTotal: cartTotal,
      stock: stock,
      productQty
    });
  } catch (error) {
    console.log(error.message);
  }
};
//quantity for cart controll------------------------------------------------------------------
const quantity=async (req,res)=>{
  try {
    const id =req.params.id;
  const product=await productModel.findOne({_id:id});
  const productQuantity=product.quantity;
  res.send({status:true,productQuantity})
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  cartPage,
  addToCart,
  cartItemDelete,
  updatecart,
  quantity
};
