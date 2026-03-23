import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const QuickViewModal = ({ isOpen, product, onClose }) => {
  const { currency, setCartQuantity, userProfile, cartItems } = useContext(ShopContext)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [mainImage, setMainImage] = useState(product?.image?.[0])
  const [isAdding, setIsAdding] = useState(false)

  // Helper to build cartKey from variant
  const buildCartKey = (variant) => {
    if (!variant) return product._id
    
    // Check if this is a new multi-variant product
    if (product.variantTypes && product.variantTypes.length > 0) {
      // New format: encode all attributes (color:Red::length:10m)
      const attributes = {}
      product.variantTypes.forEach(type => {
        if (type === 'color') {
          attributes.color = variant.color || variant.attributes?.color
        } else if (variant.attributes?.[type]) {
          attributes[type] = variant.attributes[type]
        }
      })
      
      if (Object.keys(attributes).length > 0) {
        const attrStrings = Object.entries(attributes)
          .map(([type, value]) => `${type}:${value}`)
          .join('::')
        return `${product._id}__${attrStrings}`
      }
    }
    
    // Fallback: old format with just color
    return `${product._id}__${variant.color}`
  }

  // Initialize selected variant and attributes when modal opens or product changes
  useEffect(() => {
    if (product) {
      // Set first variant as selected by default
      const hasVariants = product.variants && product.variants.length > 0
      if (hasVariants) {
        const firstVariant = product.variants[0]
        setSelectedVariant(firstVariant)
        setMainImage(firstVariant.images?.[0] || product.image[0])
        
        // Build attributes from first variant
        if (product.variantTypes && product.variantTypes.length > 0) {
          const attrs = {}
          product.variantTypes.forEach(type => {
            if (type === 'color') {
              attrs.color = firstVariant.color || firstVariant.attributes?.color
            } else if (firstVariant.attributes?.[type]) {
              attrs[type] = firstVariant.attributes[type]
            }
          })
          setSelectedAttributes(attrs)
        }
        
        // Check if first variant is already in cart
        const firstVariantKey = buildCartKey(firstVariant)
        const firstVariantCartQty = cartItems[firstVariantKey]
        setQuantity(firstVariantCartQty > 0 ? firstVariantCartQty : 1)
      } else {
        setSelectedVariant(null)
        setSelectedAttributes({})
        setMainImage(product.image[0])
        
        // Always start with quantity 1 when modal opens
        setQuantity(1)
      }
    }
  }, [product, isOpen, cartItems])

  // Update main image when selected attributes change
  useEffect(() => {
    if (!product || !product.variants) return
    
    const hasVariants = product.variants && product.variants.length > 0
    if (!hasVariants) return
    
    const matchingVariant = product.variants.find(v => {
      if (!product.variantTypes) return false
      for (const type of product.variantTypes) {
        const selectedValue = selectedAttributes[type]
        if (!selectedValue) return false
        const variantValue = type === 'color'
          ? (v.color || v.attributes?.color)
          : v.attributes?.[type]
        if (variantValue !== selectedValue) return false
      }
      return true
    })
    
    if (matchingVariant?.images?.length > 0) {
      setMainImage(matchingVariant.images[0])
    }
  }, [selectedAttributes, product])

  if (!isOpen || !product) return null

  // Handle variants
  const hasVariants = product.variants && product.variants.length > 0
  
  // Always find current variant from selectedAttributes to keep in sync
  const currentVariant = (() => {
    if (!hasVariants) return null
    if (Object.keys(selectedAttributes).length === 0) return product.variants[0]
    
    return product.variants.find(v => {
      if (!product.variantTypes) return false
      for (const type of product.variantTypes) {
        const selectedValue = selectedAttributes[type]
        if (!selectedValue) return false
        const variantValue = type === 'color'
          ? (v.color || v.attributes?.color)
          : v.attributes?.[type]
        if (variantValue !== selectedValue) return false
      }
      return true
    }) || product.variants[0]
  })()
  
  const displayImages = hasVariants && currentVariant?.images?.length > 0
    ? currentVariant.images
    : product.image
  
  // Price fetching - with better fallbacks
  const displayPrice = (() => {
    if (!hasVariants || !currentVariant) {
      return product.retailPrice || product.price || 0
    }
    
    // Try variant price first
    if (currentVariant.price !== undefined && currentVariant.price !== null && currentVariant.price !== '') {
      return Number(currentVariant.price)
    }
    
    // Fallback to product retail price
    if (product.retailPrice) {
      return product.retailPrice
    }
    
    // Final fallback to product price
    return product.price || 0
  })()
  
  const displayWholesalePrice = (() => {
    if (!hasVariants || !currentVariant) {
      return product.wholesalePrice
    }
    
    // Try variant wholesale price first
    if (currentVariant.wholesalePrice !== undefined && currentVariant.wholesalePrice !== null && currentVariant.wholesalePrice !== '') {
      return Number(currentVariant.wholesalePrice)
    }
    
    // Fallback to product wholesale price
    return product.wholesalePrice
  })()
  
  const displayStock = hasVariants && currentVariant
    ? (currentVariant.stock !== undefined && currentVariant.stock !== null ? currentVariant.stock : 0)
    : (product.stock || 0)

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant)
    setMainImage(variant.images?.[0] || product.image[0])
    
    // Build attributes from selected variant
    if (product.variantTypes && product.variantTypes.length > 0) {
      const attrs = {}
      product.variantTypes.forEach(type => {
        if (type === 'color') {
          attrs.color = variant.color || variant.attributes?.color
        } else if (variant.attributes?.[type]) {
          attrs[type] = variant.attributes[type]
        }
      })
      setSelectedAttributes(attrs)
    }
    
    // Sync quantity with cart for this variant
    const cartKey = buildCartKey(variant)
    const cartQty = cartItems[cartKey]
    if (cartQty > 0) {
      setQuantity(cartQty)
    } else {
      setQuantity(1)
    }
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    try {
      // Determine if we should use selectedAttributes (new format) or variantColor (old format)
      const hasMultiVariants = product.variantTypes && product.variantTypes.length > 0
      
      if (hasMultiVariants && Object.keys(selectedAttributes).length > 0) {
        // New format: use selectedAttributes
        await setCartQuantity(product._id, quantity, null, selectedAttributes)
      } else if (currentVariant?.color) {
        // Old format: use variantColor (backward compatibility)
        await setCartQuantity(product._id, quantity, currentVariant.color)
      } else {
        // Non-variant product
        await setCartQuantity(product._id, quantity)
      }
      
      toast.success(`Added ${quantity} to cart!`)
      
      // Don't reset quantity - let the cart sync useEffect handle it
      // This way the quantity will stay at what the user added
    } catch (error) {
      // Silent error handling - toast will show any server errors
    } finally {
      setIsAdding(false)
    }
  }

  const canUseWholesale = userProfile && 
    userProfile.role === 'wholesale' && 
    userProfile.isApproved && 
    displayWholesalePrice && 
    quantity >= (product.minimumWholesaleQuantity || 10)

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4' onClick={onClose}>
      <div 
        className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className='sticky top-0 bg-white border-b border-neutral-200 flex justify-between items-center p-6 z-10'>
          <h2 className='text-2xl font-medium text-neutral-900'>Quick View</h2>
          <button
            onClick={onClose}
            className='text-neutral-500 hover:text-neutral-900 text-2xl transition-colors'
          >
            ✕
          </button>
        </div>

        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Left: Images */}
            <div className='flex flex-col gap-3'>
              <div className='aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200'>
                <img src={mainImage || displayImages?.[0]} alt={product.name} className='w-full h-full object-cover' loading='lazy' />
              </div>
              {displayImages && displayImages.length > 1 && (
                <div className='flex gap-2 overflow-x-auto'>
                  {displayImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      onClick={() => setMainImage(img)}
                      className={`w-16 h-16 bg-neutral-100 rounded-lg cursor-pointer border-2 transition-all object-cover ${
                        mainImage === img
                          ? 'border-rose-600'
                          : 'border-neutral-200 hover:border-rose-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className='flex flex-col gap-4'>
              {/* Product Name */}
              <div>
                <h1 className='text-2xl font-medium text-neutral-900 mb-2'>{product.name}</h1>
                <div className='flex items-center gap-2'>
                  <div className='flex gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className='ri-star-fill text-yellow-400 text-sm'></i>
                    ))}
                  </div>
                  <span className='text-sm text-neutral-500'>(Reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className='bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-4 border border-rose-100'>
                {canUseWholesale ? (
                  <div>
                    <p className='text-xs font-semibold text-neutral-500 uppercase mb-1'>Wholesale Price</p>
                    <p className='text-2xl font-bold text-green-700'>{currency}{displayWholesalePrice}</p>
                    <p className='text-sm text-neutral-600 line-through mt-1'>Regular: {currency}{displayPrice}</p>
                  </div>
                ) : (
                  <div>
                    <p className='text-2xl font-bold text-neutral-900'>{currency}{displayPrice}</p>
                    {displayWholesalePrice && userProfile?.role === 'wholesale' && (
                      <p className='text-xs text-neutral-500 mt-2'>Wholesale price available at {product.minimumWholesaleQuantity || 10}+ qty</p>
                    )}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              {displayStock === 0 ? (
                <div className='text-red-600 font-semibold text-sm'>Out of Stock</div>
              ) : displayStock && displayStock < 20 ? (
                <div className='text-orange-600 font-semibold text-sm'>Only {displayStock} left in stock!</div>
              ) : (
                <div className='text-green-600 font-semibold text-sm'>In Stock</div>
              )}

              {/* Variants */}
              {hasVariants && product.variantTypes && product.variantTypes.length > 0 && (
                <div className='space-y-4 border-t border-neutral-200 pt-4'>
                  {(() => {
                    // Helper to get available options for a variant type
                    const getAvailableOptionsForType = (type) => {
                      if (type === 'color') {
                        // Show all unique colors - check both legacy and new format
                        return Array.from(new Set(
                          product.variants
                            .map(v => v.color || v.attributes?.color)
                            .filter(Boolean)
                        ))
                      } else if (selectedAttributes.color) {
                        // Filter by selected color - check both legacy and new format
                        return Array.from(new Set(
                          product.variants
                            .filter(v => (v.color === selectedAttributes.color || v.attributes?.color === selectedAttributes.color))
                            .map(v => v.attributes?.[type])
                            .filter(Boolean)
                        ))
                      } else {
                        // No color selected, show all options for this type
                        return Array.from(new Set(
                          product.variants
                            .map(v => v.attributes?.[type])
                            .filter(Boolean)
                        ))
                      }
                    }

                    return product.variantTypes.map((variantType) => (
                      <div key={variantType}>
                        <p className='text-sm font-medium text-neutral-700 mb-2 capitalize'>
                          {variantType} {selectedAttributes[variantType] && (
                            <span className='text-rose-600 ml-1'>({selectedAttributes[variantType]})</span>
                          )}
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {getAvailableOptionsForType(variantType).map((value) => {
                            // Check if variant with this value exists
                            const testAttributes = {...selectedAttributes, [variantType]: value}
                            const matchingVariant = product.variants.find(v => {
                              for (const [type, val] of Object.entries(testAttributes)) {
                                const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
                                if (variantValue !== val) return false
                              }
                              return true
                            })
                            
                            return (
                              <button
                                key={value}
                                onClick={() => {
                                  // Only update the clicked attribute, keep all other selected attributes unchanged
                                  const newAttributes = {...selectedAttributes, [variantType]: value}
                                  
                                  // Verify this combination actually exists in variants
                                  const combinationExists = product.variants.some(v => {
                                    for (const [type, val] of Object.entries(newAttributes)) {
                                      const variantValue = type === 'color'
                                        ? (v.color || v.attributes?.color)
                                        : v.attributes?.[type]
                                      if (variantValue !== val) return false
                                    }
                                    return true
                                  })
                                  
                                  if (combinationExists) {
                                    // Exact combination exists - just update the attribute
                                    setSelectedAttributes(newAttributes)
                                    // Check if this variant is already in cart and sync quantity
                                    const attrStrings = Object.entries(newAttributes)
                                      .map(([type, value]) => `${type}:${value}`)
                                      .join('::')
                                    const cartKey = `${product._id}__${attrStrings}`
                                    const cartQty = cartItems[cartKey]
                                    if (cartQty > 0) {
                                      setQuantity(cartQty)
                                    } else {
                                      setQuantity(1)
                                    }
                                  } else {
                                    // Combination does not exist - find closest match keeping the new value
                                    const closestVariant = product.variants.find(v => {
                                      const variantAttrValue = variantType === 'color'
                                        ? (v.color || v.attributes?.color)
                                        : v.attributes?.[variantType]
                                      return variantAttrValue === value
                                    })
                                    
                                    if (closestVariant) {
                                      // Use handleVariantChange to properly update both selectedVariant and selectedAttributes
                                      handleVariantChange(closestVariant)
                                    }
                                  }
                                }}
                                disabled={matchingVariant?.stock === 0}
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                  selectedAttributes[variantType] === value
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-rose-300'
                                } ${matchingVariant?.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                              >
                                {value}
                                {matchingVariant?.stock === 0 && <span className='text-xs ml-1'>(Out)</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}

              {/* Description */}
              <div className='border-t border-neutral-200 pt-4'>
                <p className='text-sm text-neutral-600 line-clamp-3'>{product.description}</p>
              </div>

              {/* Quantity & Add to Cart */}
              <div className='flex gap-3'>
                <div className='flex items-center border-2 border-neutral-200 rounded-lg'>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className='w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-rose-600 transition-colors'
                  >
                    −
                  </button>
                  <input
                    type='number'
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setQuantity(Math.max(1, Math.min(999, val)))
                    }}
                    className='w-12 h-10 text-center font-medium text-neutral-900 border-l border-r border-neutral-200 focus:outline-none'
                  />
                  <button
                    onClick={() => setQuantity(Math.min(999, quantity + 1))}
                    className='w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-rose-600 transition-colors'
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={displayStock === 0 || isAdding}
                  className='flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-medium py-3 rounded-lg hover:from-rose-700 hover:to-rose-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  <i className='ri-shopping-bag-line'></i>
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal
