import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    retailPrice: { type: Number, required: true },
    compareAtPrice: { type: Number },
    wholesalePrice: { type: Number },
    minimumWholesaleQuantity: { type: Number, default: 10 },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    specifications: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {} 
    },
    useCases: { type: String, default: "" },
    stock: { type: Number, required: true, default: 0 }
})

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel