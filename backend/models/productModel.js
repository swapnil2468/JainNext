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
    stock: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
    variantTypes: { type: [String], default: [] },  // e.g., ["color"], ["color", "length"]
    variants: [{
        attributes: { type: mongoose.Schema.Types.Mixed, default: {} },  // e.g., { color: "Red", length: "10m" }
        // Legacy support - will be phased out
        color: { type: String },
        colorCode: { type: String, default: '#000000' },
        price: { type: Number },
        compareAtPrice: { type: Number },
        wholesalePrice: { type: Number },
        stock: { type: Number, default: 0 },
        images: { type: Array, default: [] }
    }]
})

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel