const Product = require("../model/productModel");
const cloudinary = require("../lib/cloudinarySetup");

const handleError = (res, error) => {
  res.status(500).json({
    message: "Internal Sever Error",
    error: error.message,
    success: false,
  });
};

const addProduct = async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      productDescription,
      category,
      stockQuantity,
    } = req.body;

    if (
      !productName ||
      !productPrice ||
      !productDescription ||
      !category ||
      !stockQuantity
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    let imageUrls = [];
    if (req.files && Array.isArray(req.files)) {
      const fileArray = req.files.slice(0, 5);
      for (const child of fileArray) {
        const uploadedImage = await cloudinary.uploader.upload(child.path);
        imageUrls.push(uploadedImage.secure_url);
      }
    }
    const data = await Product.create({
      productName,
      productPrice,
      productDescription,
      category,
      stockQuantity,
      sellerId: req.user._id,
      productImage: imageUrls,
    });

    return res
      .status(201)
      .json({ message: "Product added successfully", data, success: true });
  } catch (error) {
    handleError(res, error);
  }
};

const getAllProduct = async (req, res) => {
  try {
    const allProduct = await Product.find()
      .populate("sellerId")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Products fetched successfully",
      data: allProduct,
      success: true,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate(
      "sellerId",
      "businessName"
    );
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    return res
      .status(200)
      .json({ message: "Product fetch successfull", product, success: true });
  } catch (error) {
    handleError(res, error);
  }
};

const getSellerProduct = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .populate("sellerId")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Seller products fetched successfully",
      data: products,
      success: true,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getSellerProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id,
    }).populate("sellerId","businessName");
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or not owned by seller" });
    }
    return res
      .status(200)
      .json({ message: "Seller Product fetch", product, success: true });
  } catch (error) {
    handleError(res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      productDescription,
      category,
      stockQuantity,
    } = req.body;
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id,
    });
    if (!product) {
      return res.status(404).json({
        message: "Product not found or not owned by seller",
        success: false,
      });
    }
    if (productName) {
      product.productName = productName;
    }
    if (productPrice) {
      product.productPrice = productPrice;
    }
    if (productDescription) {
      product.productDescription = productDescription;
    }
    if (category) {
      product.category = category;
    }
    if (stockQuantity) {
      product.stockQuantity = stockQuantity;
    }

    await product.save();
    return res.status(200).json({
      message: "Product updated successfully",
      product,
      success: true,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id,
    });
    if (!product) {
      return res.status(404).json({
        message: "Product not found or not owned by seller",
        success: false,
      });
    }
    await product.deleteOne();
    return res
      .status(200)
      .json({ message: "Product deleted Succussfully", success: true });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  addProduct,
  getAllProduct,
  getProductById,
  getSellerProduct,
  getSellerProductById,
  updateProduct,
  deleteProduct,
};
