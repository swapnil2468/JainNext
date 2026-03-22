import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const QuickViewModal = ({ isOpen, product, onClose }) => {
  const { currency, setCartQuantity, userProfile, cartItems } = useContext(ShopContext)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [mainImage, setMainImage] = useState(product?.image?.[0])
  const [isAdding, setIsAdding] = useState(false)

  // Initialize selected variant and quantity when modal opens or product changes
  useEffect(() => {
    if (product) {
      // Set first variant as selected by default
      const hasVariants = product.variants && product.variants.length > 0
      if (hasVariants) {
        const firstVariant = product.variants[0]
        setSelectedVariant(firstVariant)
        setMainImage(firstVariant.images?.[0] || product.image[0])
        
        // Set quantity to what's already in cart for this variant
        const cartKey = `${product._id}__${firstVariant.color}`
        const currentQty = cartItems[cartKey] || 0
        setQuantity(currentQty > 0 ? currentQty : 1)
      } else {
        setSelectedVariant(null)
        setMainImage(product.image[0])
        
        // Set quantity to what's already in cart for this product
        const currentQty = cartItems[product._id] || 0
        setQuantity(currentQty > 0 ? currentQty : 1)
      }
    }
  }, [product, isOpen, cartItems])

  if (!isOpen || !product) return null

  // Handle variants
  const hasVariants = product.variants && product.variants.length > 0
  const currentVariant = selectedVariant || (hasVariants ? product.variants[0] : null)
  const displayImages = hasVariants && currentVariant?.images?.length > 0
    ? currentVariant.images
    : product.image
  const displayPrice = hasVariants && currentVariant?.price
    ? currentVariant.price
    : (product.retailPrice || product.price)
  const displayWholesalePrice = hasVariants && currentVariant?.wholesalePrice
    ? currentVariant.wholesalePrice
    : product.wholesalePrice
  const displayStock = hasVariants && currentVariant
    ? currentVariant.stock
    : product.stock

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant)
    setMainImage(variant.images?.[0] || product.image[0])
    
    // Update quantity to what's in cart for this variant
    const cartKey = `${product._id}__${variant.color}`
    const currentQty = cartItems[cartKey] || 0
    setQuantity(currentQty > 0 ? currentQty : 1)
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    const variantColor = currentVariant?.color || null
    
    try {
      // Use setCartQuantity to set exact quantity instead of adding
      await setCartQuantity(product._id, quantity, variantColor)
      toast.success(`Added ${quantity} to cart!`)
      
      // Don't close modal - just keep it open for their next action
      // Quantity will be updated via useEffect when cartItems changes
    } catch (error) {
      console.error('Error adding to cart:', error)
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
                <img src={mainImage || displayImages?.[0]} alt={product.name} className='w-full h-full object-cover' />
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
              {hasVariants && (
                <div>
                  <p className='text-sm font-medium text-neutral-700 mb-2'>Color</p>
                  <div className='flex flex-wrap gap-2'>
                    {product.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleVariantChange(variant)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedVariant?.color === variant.color
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-neutral-800 border-neutral-200 hover:border-rose-300'
                        }`}
                      >
                        {variant.color}
                      </button>
                    ))}
                  </div>
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
