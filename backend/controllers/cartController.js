import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"


// add products to user cart
const addToCart = async (req,res) => {
    try {
        
        const { userId, itemId, quantity, variantColor, selectedAttributes } = req.body

        const product = await productModel.findById(itemId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        let cartData = await userData.cartData;

        // Build cart key - support both new and old variant formats
        let cartKey = itemId
        if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
            // New format: encode all attributes (e.g., "color:Red::length:10m")
            const attrStrings = Object.entries(selectedAttributes)
                .map(([type, value]) => `${type}:${value}`)
                .join('::')
            cartKey = `${itemId}__${attrStrings}`
        } else if (variantColor) {
            // Backward compatibility: old format with just color
            cartKey = `${itemId}__${variantColor}`
        }

        const currentQty = cartData[cartKey] || 0;
        const addQty = quantity || 1;
        const newQty = currentQty + addQty;
        
        // Prevent unrealistic quantities (max 999 per item)
        if (newQty > 999) {
            return res.json({ success: false, message: "Maximum quantity limit reached" });
        }

        cartData[cartKey] = newQty;

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId, itemId, quantity, variantColor, selectedAttributes } = req.body

        // Validate quantity bounds
        if (quantity === undefined || quantity === null || quantity < 0 || quantity > 999) {
            return res.json({ success: false, message: "Invalid quantity. Must be between 0 and 999." });
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        let cartData = await userData.cartData;

        // Build cart key - support both new and old variant formats
        let cartKey = itemId
        if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
            // New format: encode all attributes (e.g., "color:Red::length:10m")
            const attrStrings = Object.entries(selectedAttributes)
                .map(([type, value]) => `${type}:${value}`)
                .join('::')
            cartKey = `${itemId}__${attrStrings}`
        } else if (variantColor) {
            // Backward compatibility: old format with just color
            cartKey = `${itemId}__${variantColor}`
        }

        if (quantity === 0) {
            delete cartData[cartKey]; // Remove entry instead of keeping a 0
        } else {
            cartData[cartKey] = quantity;
        }

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }