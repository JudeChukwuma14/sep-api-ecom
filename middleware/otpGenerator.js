
const otpGenerator = require("otp-generator")
const Seller = require("../model/sellerModel")



const generateOTP = async (email) => {
    const trimmedEmail = email.trim().toLowerCase()
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })

    const seller = await Seller.findOne({ email: trimmedEmail })

    if (seller) {
        const otpExpires = new Date(Date.now() +  15 * 60 * 1000)
        await Seller.updateOne(
            { email: trimmedEmail },
            { $set: { otp, otpExpires } }
        )

    }

    return otp
}

module.exports = { generateOTP }


