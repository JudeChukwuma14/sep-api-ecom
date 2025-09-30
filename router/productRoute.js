const express = require("express")
const { authenticate, restrictToSeller } = require("../middleware/auth")
const upload = require("../lib/multerSetup")
const { addProduct, getAllProduct, getSellerProduct, updateProduct, deleteProduct, getProductById, getSellerProductById } = require("../controller/productController")
const router = express.Router()

router.post("/addproduct",authenticate, restrictToSeller, upload, addProduct)
router.get("/allproduct", getAllProduct)
router.get("/one-product/:id",getProductById)
router.get("/allsellerproduct",authenticate,restrictToSeller, getSellerProduct)
router.get("/one-seller-product/:id",authenticate,restrictToSeller, getSellerProductById)
router.patch("/update-product/:id",authenticate,restrictToSeller, updateProduct)
router.delete("/delete-product/:id",authenticate,restrictToSeller, deleteProduct)



module.exports = router