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

        const hasVariants = req.body.hasVariants === 'true'

        let imagesUrl = []
        let productVariants = []

        if (hasVariants) {
          // Variant mode — upload images per variant
          const variants = JSON.parse(req.body.variants || '[]')
          productVariants = await Promise.all(
            variants.map(async (variant, vIndex) => {
              const variantImages = []
              for (let i = 0; i < 4; i++) {
                const key = `variantImage_${vIndex}_${i}`
                if (req.files[key] && req.files[key][0]) {
                  const result = await cloudinary.uploader.upload(req.files[key][0].path, { resource_type: 'image' })
                  variantImages.push(result.secure_url)
                }
              }
              return {
                color: variant.color,
                colorCode: variant.colorCode || '#000000',
                price: variant.price ? Number(variant.price) : undefined,
                compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
                wholesalePrice: variant.wholesalePrice ? Number(variant.wholesalePrice) : undefined,
                stock: Number(variant.stock) || 0,
                images: variantImages
              }
            })
          )
        } else {
          // No variants — upload base images as before
          const image1 = req.files.image1 && req.files.image1[0]
          const image2 = req.files.image2 && req.files.image2[0]
          const image3 = req.files.image3 && req.files.image3[0]
          const image4 = req.files.image4 && req.files.image4[0]
          const images = [image1, image2, image3, image4].filter(Boolean)
          imagesUrl = await Promise.all(
            images.map(async (item) => {
              const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' })
              return result.secure_url
            })
          )
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
            stock: hasVariants ? 0 : Number(stock),
            variants: productVariants
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
        
        // Fetch products - admins see all, customers see only active products
        const query = isAdmin ? {} : { status: { $nin: ['draft', 'archived'] } };
        const products = await productModel.find(query);
        
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
        const { productId, name, description, retailPrice, compareAtPrice, useCases, wholesalePrice, minimumWholesaleQuantity, category, subCategory, bestseller, stock, hasVariants } = req.body
        
        let updateData = {
            name,
            description,
            category,
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            useCases: useCases || "",
            minimumWholesaleQuantity: minimumWholesaleQuantity ? Number(minimumWholesaleQuantity) : 10,
            hasVariants: hasVariants === 'true' || hasVariants === true
        }

        // Handle variant vs non-variant mode
        const isVariantMode = hasVariants === 'true' || hasVariants === true
        
        if (isVariantMode) {
            // Update variants
            const variants = JSON.parse(req.body.variants || '[]')
            const productVariants = await Promise.all(
                variants.map(async (variant, vIndex) => {
                    const variantImages = variant.images || [];
                    
                    // Upload new variant images if provided
                    const newImages = []
                    for (let i = 0; i < 4; i++) {
                        const key = `variantImage_${vIndex}_${i}`
                        if (req.files && req.files[key] && req.files[key][0]) {
                            const result = await cloudinary.uploader.upload(req.files[key][0].path, { resource_type: 'image' })
                            newImages.push(result.secure_url)
                        }
                    }
                    
                    // Use new images if uploaded, otherwise keep existing ones
                    const finalImages = newImages.length > 0 ? newImages : variantImages
                    
                    return {
                        color: variant.color,
                        colorCode: variant.colorCode || '#000000',
                        price: variant.price ? Number(variant.price) : undefined,
                        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
                        wholesalePrice: variant.wholesalePrice ? Number(variant.wholesalePrice) : undefined,
                        stock: Number(variant.stock) || 0,
                        images: finalImages
                    }
                })
            )
            updateData.variants = productVariants
        } else {
            // Non-variant mode - update regular fields
            updateData.retailPrice = Number(retailPrice)
            updateData.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : undefined
            updateData.wholesalePrice = wholesalePrice ? Number(wholesalePrice) : undefined
            updateData.stock = Number(stock)
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

        // Handle image uploads if provided (for non-variant products)
        if (!isVariantMode) {
            const image1 = req.files?.image1?.[0]
            const image2 = req.files?.image2?.[0]
            const image3 = req.files?.image3?.[0]
            const image4 = req.files?.image4?.[0]

            const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

            if (images.length > 0) {
                // New images uploaded - delete old ones and replace
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
            } else if (req.body.existingImages) {
                // No new images, but preserve existing ones by parsing the JSON
                try {
                    const existingImages = JSON.parse(req.body.existingImages)
                    if (existingImages && existingImages.length > 0) {
                        updateData.image = existingImages
                    }
                } catch (e) {
                    // If parsing fails, just don't update images
                }
            }
            // If no images field in updateData, existing images are preserved automatically
        }

        // Build proper MongoDB update: $set for defined fields, $unset to clear old data structure
        const setData = Object.fromEntries(Object.entries(updateData).filter(([, v]) => v !== undefined))
        const updateOp = { $set: setData }
        
        // When switching modes, unset fields from the other mode
        if (isVariantMode) {
            // In variant mode: remove non-variant fields
            updateOp.$unset = { image: 1, retailPrice: 1, compareAtPrice: 1, wholesalePrice: 1, stock: 1 }
        } else {
            // In non-variant mode: remove variant fields
            updateOp.$unset = { variants: 1 }
        }
        
        const product = await productModel.findByIdAndUpdate(productId, updateOp, { new: true })
        res.json({ success: true, message: "Product Updated", product })

    } catch (error) {
        console.error('Error updating product:', error)
        res.json({ success: false, message: error.message })
    }
}

// function to update product status
const updateProductStatus = async (req, res) => {
    try {
        const { productIds, status } = req.body
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.json({ success: false, message: "No products selected" })
        }
        
        if (!['active', 'draft', 'archived'].includes(status)) {
            return res.json({ success: false, message: "Invalid status" })
        }
        
        const result = await productModel.updateMany(
            { _id: { $in: productIds } },
            { $set: { status } }
        )
        
        res.json({ 
            success: true, 
            message: `Updated ${result.modifiedCount} product(s)`,
            modifiedCount: result.modifiedCount
        })

    } catch (error) {
        console.error('Error updating product status:', error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct, updateProductStatus }