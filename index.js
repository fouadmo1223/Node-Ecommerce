const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const connectDB = require("./config/connentToDB");
connectDB();

const categoryRoute = require("./routes/categoryRoute");
const subCategoryRoute = require("./routes/SubCategoryRoute");
const brandsRoute = require("./routes/brandRoute");
const productsRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const { notFound, errorHandeler } = require("./middlewares/errors");
// end of Imports
///////////////////////////////////
// consts
const app = express();
const PORT = process.env.PORT || 8000;

// end of consts
///////////////////////////////////
// Middleware
app.use(express.json());
app.use(morgan("dev"));
// end of Middleware
///////////////////////////////////

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API");
});

app.use("/api/categories", categoryRoute);
app.use("/api/subcategories", subCategoryRoute);
app.use("/api/brands", brandsRoute);
app.use("/api/products", productsRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);

// it must be in that order
app.use(notFound);

app.use(errorHandeler);

app.listen(8000, () => {
  console.log(`Server is running on port ${PORT}`);
});
