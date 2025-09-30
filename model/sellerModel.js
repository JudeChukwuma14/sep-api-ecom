const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    otp:{
        type:String,
        default: null
    },
    otpExpires:{
        type:Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("seller", sellerSchema);
