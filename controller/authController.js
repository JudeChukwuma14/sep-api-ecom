const { createUserAuth, createSellerAuth } = require("../middleware/joi");
const User = require("../model/usermodel");
const Seller = require("../model/sellerModel")
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { generateOTP } = require("../middleware/otpGenerator");
const { renderEmailTemplate, createTransporter } = require("../middleware/emailSetup");

const createUser = async (req, res) => {
  try {
    const { error } = createUserAuth(req.body);
    if (error) {
      return res
        .status(401)
        .json({ message: error.details[0].message, success: false });
    }
    const { name, email, password } = req.body;

    const checkExitingEmail = await User.findOne({ email });
    if (checkExitingEmail) {
      return res
        .status(409)
        .json({ message: "Email already exist", success: false });
    }

    const hashPassword = bcryptjs.hashSync(password, 10);
    const data = await User.create({
      name,
      email,
      password: hashPassword,
    });
    return res
      .status(201)
      .json({ data, message: "Account Created Successfully!!", success: true });
  } catch (error) {
    console.error(error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkUserEmail = await User.findOne({ email });
    if (!checkUserEmail) {
      return res.status(400).json({ message: "User not found", suceess: false });
    }

    const isMatchPassword = await bcryptjs.compareSync(
      password,
      checkUserEmail.password
    );
    if (!isMatchPassword) {
      return res.status(400).json({ message: "Invalid credential", suceess: false });
    }

    const token = jwt.sign({ id: checkUserEmail._id, role: "user" }, process.env.JWT, { expiresIn: "1h" })
    return res.status(201).json({
      data: { name: checkUserEmail.name, email: checkUserEmail.email },
      token,
      message: "Login successfully!",
      suceess: true
    })
  } catch (error) {
    console.error(error.message);
  }
};

const createSeller = async (req, res) => {
  try {
    const { error } = createSellerAuth(req.body)
    if (error) {
      return res
        .status(401)
        .json({ message: error.details[0].message, success: false });
    }
    const { businessName, email, phoneNumber, password } = req.body

    const checkSellerEmail = await Seller.findOne({ email })
    if (checkSellerEmail) {
      return res
        .status(409)
        .json({ message: "Seler email already exist", success: false });
    }

    const hashPassword = bcryptjs.hashSync(password, 10);
    const data = await Seller.create({
      businessName,
      email,
      phoneNumber,
      password: hashPassword,
    });
    return res
      .status(201)
      .json({ data, message: `Welcome onboard ${data.businessName}`, success: true });

  } catch (error) {
    console.error(error.message)
  }
}

const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const checkEmail = await Seller.findOne({ email })
    if (!checkEmail) {
      return res.status(404).json({ message: "Seller dose not exist", success: false })
    }

    const isMatchPassword = await bcryptjs.compareSync(password, checkEmail.password)
    if (!isMatchPassword) {
      return res.status(400).json({ message: "Invalid Seller", success: false })
    }
    const token = jwt.sign({ id: checkEmail._id, role: "seller" }, process.env.JWT, { expiresIn: "1h" })
    return res.status(200).json({
      data: { businessName: checkEmail.businessName, email: checkEmail.email, phoneNumber: checkEmail.phoneNumber },
      token,
      message: `You have successfully logged in, ${checkEmail.businessName}`,
      success: true
    })
  } catch (error) {
    console.error(error.message)
  }
}

const forgotSellerPassword = async (req, res) => {
  try {

    const { email } = req.body

    const checkEmail = await Seller.findOne({ email })
    if (!checkEmail) {
      return res.status(404).json({ message: "Email not found", success: false })
    }

    const otp = await generateOTP(email)
    const htmlContent = await renderEmailTemplate("otpTemplate", {
      businessName: checkEmail.businessName,
      otp,
      expiresIn: "15"
    })

    const transporter = await createTransporter()
    const mailOption = {
      from: process.env.MAIL_HOST,
      to: checkEmail.email,
      subject: "Reset Your Password",
      html: htmlContent
    }
    await transporter.sendMail(mailOption)
    console.log("Mail send")

    return res.status(200).json({ message: "OTP sent" })

  } catch (error) {
    console.error(error.message)
  }
}

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body
    const checkEmail = await Seller.findOne({ email })
    if (!checkEmail) {
      return res.status(404).json({ message: "Seller does not exit", success: false })
    }

    const otp = await generateOTP(email)
    const htmlContent = await renderEmailTemplate("otpTemplate", {
      businessName: checkEmail.businessName,
      otp,
      expiresIn: "30"
    })

    const transporter = await createTransporter()
    const mailOption = {
      from: process.env.MAIL_HOST,
      to: checkEmail.email,
      subject: "Reset Your Password",
      html: htmlContent
    }
    await transporter.sendMail(mailOption)
    console.log("RESEND OTP SELLER")

    return res.status(200).json({ message: "OTP sent" })
  } catch (error) {
    console.error(error.message)
  }
}

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body
    if (!otp) {
      return res.status(401).json({ message: "OTP required", success: false })
    }

    const checkOTP = await Seller.findOne({ otp: otp })
    if (!checkOTP) {
      return res.status(409).json({ message: "Invalid OTP", success: false })
    }

    const date = new Date()
    if (date >= checkOTP.otpExpires) {
      return res.status(409).json({ message: "OTP have expired", success: false })
    } else {
      return res.status(200).json({ message: "OTP verified successfully", success: true })
    }

  } catch (error) {
    console.error(error.message)
  }
}

const resetPassword = async (req, res) => {
  try {
    const otp = req.params.otp
    if (!otp) {
      return res.status(401).json({ message: "otp required, fail to reset Password", success: false })
    }

    const { password, confirmPassword } = req.body
    if (!password || !confirmPassword || password.trim() === "" || confirmPassword.trim() === "") {
      return res.status(401).json({ message: "Password is required", success: false })
    }

    if (password !== confirmPassword) {
      return res.status(401).json({ message: "Password do not match", success: false })
    }
    const checkOtp = await Seller.findOne({ otp })
    if (!checkOtp) {
      return res.status(409).json({ message: "Invalid OTP fail to reset password", success: false })
    }
    const date = new Date()
    if (date >= checkOtp.otpExpires) {
      return res.status(409).json({ message: "OTP have expired", success: false })
    } else {
      checkOtp.password = bcryptjs.hashSync(confirmPassword, 10)
      checkOtp.otp = ""
      checkOtp.otpExpires = ""
      await checkOtp.save()
      return res.status(200).json({ message: "Password reset successfully You can now login", success: true })
    }

  } catch (error) {
    console.error(error)
  }
}

module.exports = { createUser, loginUser, createSeller, sellerLogin, forgotSellerPassword, resendOtp, verifyOtp, resetPassword };
