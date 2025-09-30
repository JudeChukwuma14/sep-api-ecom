
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: Number,
        required: true
    },
    productDescription: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller',
    },
    productImage: [{
        type: String,
    }]
}, { timestamps: true });


module.exports = mongoose.model('product', productSchema);