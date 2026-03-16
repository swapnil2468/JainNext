import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import { getUserFromToken } from "../middleware/wholesaleAuth.js"
import jwt from 'jsonwebtoken'

// Helper function to filter product prices based on user role
// CRITICAL SECURITY: Never expose wholesale prices to unauthorized users
const filterProductPricing = (product, user) => {
    const productObj = product.toObject ? product.toObject() : product;
    
    // Backward compatibility: if product has old 'price' field, map it to retailPrice
    if (productObj.price && !productObj.retailPrice) {
        productObj.retailPrice = productObj.price;
    }
    
    // Only show wholesale pricing to approved wholesale customers
    if (user && user.role === 'wholesale' && user.isApproved) {
        return productObj; // Return all pricing info
    }
    
    // For retail users or unauthenticated users, remove wholesale pricing
    const { wholesalePrice, minimumWholesaleQuantity, price, ...retailProduct } = productObj;
    return retailProduct;
}

// Helper function to filter multiple products
const filterProductsPricing = (products, user) => {
    return products.map(product => filterProductPricing(product, user));
}

// Helper function to extract public_id from Cloudinary URL and delete image
const deleteCloudinaryImage = async (imageUrl) => {
    try {
        // Extract public_id from URL
        // Format: https://res.cloudinary.com/[cloud]/image/upload/v[version]/[public_id].[ext]
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        
        // Find the upload index to get the full path
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
            // Get everything after 'upload/' and before the file extension
            const pathAfterUpload = parts.slice(uploadIndex + 1).join('/');
            const fullPublicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));
            
            await cloudinary.uploader.destroy(fullPublicId);
            console.log(`Deleted image: ${fullPublicId}`);
        }
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, retailPrice, compareAtPrice, useCases, wholesalePrice, minimumWholesaleQuantity, category, subCategory, bestseller, stock } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        // Define all possible specification fields
        const specificationFields = [
            'wattage',
            'productWattage',
            'inputVoltage',
            'outputVoltageDC',
            'outputCurrentDC',
            'powerSource',
            'powerFactor',
            'frequency',
            'material',
            'bodyMaterial',
            'bodyType',
            'shape',
            'beamAngle',
            'ipRating',
            'protection',
            'design',
            'length',
            'wireLength',
            'numberOfBulbs',
            'lightingColor',
            'color',
            'pattern',
            'functionality',
            'adjustableBrightness',
            'controlMethod',
            'brand',
            'modelName',
            'countryOfOrigin',
            'warranty',
            'usage'
        ]

        // Build specifications object with only non-empty values
        const specifications = {}
        specificationFields.forEach(field => {
            if (req.body[field] && req.body[field].trim() !== '') {
                specifications[field] = req.body[field].trim()
            }
        })

        const productData = {
            name,
            description,
            category,
            retailPrice: Number(retailPrice),
            compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
            wholesalePrice: wholesalePrice ? Number(wholesalePrice) : undefined,
            minimumWholesaleQuantity: minimumWholesaleQuantity ? Number(minimumWholesaleQuantity) : 10,
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            image: imagesUrl,
            date: Date.now(),
            specifications,
            useCases: useCases || "",
            stock: Number(stock)
        }

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.error('Error adding product:', error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        
        // CRITICAL SECURITY: Filter pricing based on user role
        const { token } = req.headers;
        
        // Check if it's an admin token first
        let isAdmin = false;
        try {
            const token_decode = jwt.verify(token, process.env.JWT_SECRET);
            if (token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
                isAdmin = true;
            }
        } catch (error) {
            // Not an admin token, continue to user check
        }
        
        if (isAdmin) {
            // Admins see full unfiltered data
            const productObjs = products.map(p => {
                const obj = p.toObject ? p.toObject() : p;
                if (obj.price && !obj.retailPrice) obj.retailPrice = obj.price;
                return obj;
            });
            return res.json({ success: true, products: productObjs });
        }
        
        const user = await getUserFromToken(token);
        const filteredProducts = filterProductsPricing(products, user);
        
        res.json({success:true,products: filteredProducts})

    } catch (error) {
        console.error('Error listing products:', error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        // Get product to access images before deletion
        const product = await productModel.findById(req.body.id);
        
        if (product && product.image && product.image.length > 0) {
            // Delete all images from Cloudinary
            await Promise.all(
                product.image.map(imageUrl => deleteCloudinaryImage(imageUrl))
            );
        }
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.error('Error removing product:', error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        
        // CRITICAL SECURITY: Filter pricing based on user role
        const { token } = req.headers;
        
        // Check if it's an admin token first
        let isAdmin = false;
        try {
            const token_decode = jwt.verify(token, process.env.JWT_SECRET);
            if (token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
                isAdmin = true;
            }
        } catch (error) {
            // Not an admin token, continue to user check
        }
        
        // Admins see unfiltered data (for editing purposes)
        if (isAdmin) {
            const productObj = product.toObject ? product.toObject() : product;
            // Backward compatibility
            if (productObj.price && !productObj.retailPrice) {
                productObj.retailPrice = productObj.price;
            }
            console.log('Admin fetching product:', productObj.name, 'wholesalePrice:', productObj.wholesalePrice);
            return res.json({success:true,product: productObj});
        }
        
        // For regular users, filter based on their role
        const user = await getUserFromToken(token);
        const filteredProduct = filterProductPricing(product, user);
        
        res.json({success:true,product: filteredProduct})

    } catch (error) {
        console.error('Error fetching single product:', error)
        res.json({ success: false, message: error.message })
    }
}

// function for update product
const updateProduct = async (req, res) => {
    try {
        const { productId, name, description, retailPrice, compareAtPrice, useCases, wholesalePrice, minimumWholesaleQuantity, category, subCategory, bestseller, stock } = req.body
        
        let updateData = {
            name,
            description,
            retailPrice: Number(retailPrice),
            compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
            wholesalePrice: wholesalePrice ? Number(wholesalePrice) : undefined,
            minimumWholesaleQuantity: minimumWholesaleQuantity ? Number(minimumWholesaleQuantity) : 10,
            category,
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            useCases: useCases || "",
            stock: Number(stock)
        }

        // Define all possible specification fields
        const specificationFields = [
            'wattage',
            'productWattage',
            'inputVoltage',
            'outputVoltageDC',
            'outputCurrentDC',
            'powerSource',
            'powerFactor',
            'frequency',
            'material',
            'bodyMaterial',
            'bodyType',
            'shape',
            'beamAngle',
            'ipRating',
            'protection',
            'design',
            'length',
            'wireLength',
            'numberOfBulbs',
            'lightingColor',
            'color',
            'pattern',
            'functionality',
            'adjustableBrightness',
            'controlMethod',
            'brand',
            'modelName',
            'countryOfOrigin',
            'warranty',
            'usage'
        ]

        // Build specifications object with only non-empty values
        const specifications = {}
        specificationFields.forEach(field => {
            if (req.body[field] && req.body[field].trim() !== '') {
                specifications[field] = req.body[field].trim()
            }
        })

        updateData.specifications = specifications

        // Handle image uploads if provided
        if (req.files) {
            const image1 = req.files.image1 && req.files.image1[0]
            const image2 = req.files.image2 && req.files.image2[0]
            const image3 = req.files.image3 && req.files.image3[0]
            const image4 = req.files.image4 && req.files.image4[0]

            const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

            if (images.length > 0) {
                // Get old product to delete old images
                const oldProduct = await productModel.findById(productId);
                if (oldProduct && oldProduct.image && oldProduct.image.length > 0) {
                    // Delete old images from Cloudinary
                    await Promise.all(
                        oldProduct.image.map(imageUrl => deleteCloudinaryImage(imageUrl))
                    );
                }
                
                let imagesUrl = await Promise.all(
                    images.map(async (item) => {
                        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                        return result.secure_url
                    })
                )
                updateData.image = imagesUrl
            }
        }

        // Build proper MongoDB update: $set for defined fields, $unset to clear wholesalePrice if removed
        const setData = Object.fromEntries(Object.entries(updateData).filter(([, v]) => v !== undefined))
        const updateOp = { $set: setData }
        if (!wholesalePrice) updateOp.$unset = { wholesalePrice: 1 }
        const product = await productModel.findByIdAndUpdate(productId, updateOp, { new: true })
        res.json({ success: true, message: "Product Updated", product })

    } catch (error) {
        console.error('Error updating product:', error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }