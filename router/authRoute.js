const express = require("express")
const { createUser, loginUser, createSeller, sellerLogin, forgotSellerPassword, verifyOtp, resendOtp, resetPassword } = require("../controller/authController")
const router = express.Router()


router.post("/create-user", createUser)
router.post("/login-user", loginUser)
router.post("/create-seller", createSeller)
router.post("/login-seller", sellerLogin)
router.post("/forgot-seller-password", forgotSellerPassword)
router.post("/resent-otp", resendOtp)
router.post("/verify-otp", verifyOtp)
router.post("/reset-password/:otp", resetPassword)





module.exports = router