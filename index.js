const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const dotenv=require('dotenv').config();
//db connect -----------------------------------
const db = process.env.MONGO_CONNECT;
mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
//-----------------------------------------------
const app = express();
const PORT = process.env.PORT ||3000;
const path = require("path");

const userRoute = require("./router/userRouter");
app.use("/", userRoute.userRoute);

const adminRoute = require("./router/adminRouter");
app.use("/admin", adminRoute.adminRoute);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./view/users"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//port--------------------------------------------------
app.listen(PORT, (req, res) => {
  console.log(`server running at port ${PORT}`);
});
