const joi = require("joi")


const createUserAuth = (data) => {
    const schema = joi.object({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required()
    })
    return schema.validate(data)
}


const createSellerAuth = (data) => {
    const schema = joi.object({
        businessName: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required(),
        phoneNumber: joi.string().required()
    })
    return schema.validate(data)
}


module.exports = { createUserAuth, createSellerAuth }