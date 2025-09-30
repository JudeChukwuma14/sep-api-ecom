const jwt = require("jsonwebtoken");
const Seller = require("../model/sellerModel")
const User = require("../model/usermodel")


const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized access: No token provided", success: false });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access", success: false })
        }

        const decoded = jwt.verify(token, process.env.JWT);
        if (decoded.role === "seller") {
            const seller = await Seller.findById(decoded.id);
            if (!seller) {
                return res.status(401).json({ message: "Unauthorized seller not found", success: false })
            }
            req.user = seller;
            req.role = "seller"
        } else if (decoded.role === "user") {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: "Unauthorized user not found", success: false })
            }
            req.user = user;
            req.role = "user"
        } else {
            return res.status(401).json({ message: "Unauthorized access Invalid role or token", success: false })
        }
        next();
    } catch (error) {
        console.error(error.message);
        return res.status(401).json({ message: "Unauthorized access Invalid token", success: false })
    }
}

const restrictToSeller = (req, res, next) => {
    if (req.role !== "seller") {
        return res.status(403).json({ message: "Forbidden access: Only seller can perform this action", success: false })
    }
    next();
}


module.exports = { authenticate, restrictToSeller }