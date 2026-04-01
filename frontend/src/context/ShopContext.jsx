import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

// Constants
const API_ENDPOINTS = {
    CART_ADD: '/api/cart/add',
    CART_UPDATE: '/api/cart/update',
    CART_GET: '/api/cart/get',
    PRODUCT_LIST: '/api/product/list',
    USER_PROFILE: '/api/user/profile'
};

const STORAGE_KEYS = {
    TOKEN: 'token',
    GUEST_CART: 'guestCart'
};

const CART_LIMITS = {
    MAX_QUANTITY: 999,
    DEFAULT_MIN_WHOLESALE_QTY: 10
};

const ERROR_MESSAGES = {
    SESSION_EXPIRED: 'Session expired. Please login again.',
    PRODUCT_NOT_FOUND: 'Product not found',
    MAX_QUANTITY_REACHED: 'Maximum quantity limit reached',
    SYNC_FAILED: 'Failed to sync cart'
};

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 0;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const [userProfile, setUserProfile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const navigate = useNavigate();

    const isAuthErrorMessage = (message = '') => {
        if (!message || typeof message !== 'string') return false;
        const normalizedMessage = message.toLowerCase();
        return normalizedMessage.includes('jwt expired') ||
               normalizedMessage.includes('not authorized') ||
               normalizedMessage.includes('jwt malformed') ||
               normalizedMessage.includes('invalid token');
    }

    const logout = (redirectToLogin = true) => {
        localStorage.removeItem('token');
        setToken('');
        setUserProfile(null);
        setCartItems({});
        if (redirectToLogin) {
            navigate('/login');
        }
    }

    const handleAuthFailure = (message = ERROR_MESSAGES.SESSION_EXPIRED) => {
        logout();
        toast.error(message);
    }

    // Helper to get appropriate price based on user role and quantity
    const getProductPrice = (product, quantity = 1) => {
        // Backward compatibility: support old 'price' field
        const retailPrice = product.retailPrice || product.price;
        
        // Check if user is approved wholesale customer and meets minimum quantity
        if (userProfile && 
            userProfile.role === 'wholesale' && 
            userProfile.isApproved && 
            product.wholesalePrice && 
            quantity >= (product.minimumWholesaleQuantity || CART_LIMITS.DEFAULT_MIN_WHOLESALE_QTY)) {
            return product.wholesalePrice;
        }
        // Default to retail price
        return retailPrice;
    }

    // Helper to check if product qualifies for wholesale pricing
    const canUseWholesalePrice = (product, quantity) => {
        return userProfile && 
               userProfile.role === 'wholesale' && 
               userProfile.isApproved && 
               product.wholesalePrice && 
               quantity >= (product.minimumWholesaleQuantity || 10);
    }


    const addToCart = async (itemId, quantity = 1, variantColor = null, selectedAttributes = null) => {
      const product = products.find(p => p._id === itemId)
      if (!product) {
        toast.error(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
        return
      }

      // Support both old format (variantColor) and new format (selectedAttributes)
      let cartKey
      if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
        // New format: encode all attributes
        const attrStrings = Object.entries(selectedAttributes)
          .map(([type, value]) => `${type}:${value}`)
          .join('::')
        cartKey = `${itemId}__${attrStrings}`
      } else if (variantColor) {
        // Backward compatibility: old format
        cartKey = `${itemId}__${variantColor}`
      } else {
        // No variant
        cartKey = itemId
      }

      const currentQty = cartItems[cartKey] || 0
      const newQty = currentQty + quantity

      if (newQty > CART_LIMITS.MAX_QUANTITY) {
        toast.error(ERROR_MESSAGES.MAX_QUANTITY_REACHED)
        return
      }

      let cartData = structuredClone(cartItems)

      // Remove any old entry without variant suffix if switching to variant
      // This prevents duplicate entries
      if ((variantColor || selectedAttributes) && cartData[itemId] && !cartData[cartKey]) {
        delete cartData[itemId]
      }

      cartData[cartKey] = newQty
      setCartItems(cartData)

      if (token) {
        try {
          // Send both formats to backend for compatibility
          await axios.post(
            backendUrl + API_ENDPOINTS.CART_ADD,
            { 
              itemId, 
              quantity, 
              variantColor,
              selectedAttributes: selectedAttributes || (variantColor ? { color: variantColor } : null)
            },
            { headers: { token } }
          )
        } catch (error) {
          toast.error(error.message)
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cartData))
      }
    }

    // Set cart quantity to exact amount (used for quick view modal) instead of adding
    const setCartQuantity = async (itemId, quantity, variantColor = null, selectedAttributes = null) => {
      const product = products.find(p => p._id === itemId)
      if (!product) {
        toast.error(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
        return
      }

      // Support both old format (variantColor) and new format (selectedAttributes)
      let cartKey
      if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
        // New format: encode all attributes
        const attrStrings = Object.entries(selectedAttributes)
          .map(([type, value]) => `${type}:${value}`)
          .join('::')
        cartKey = `${itemId}__${attrStrings}`
      } else if (variantColor) {
        // Backward compatibility: old format
        cartKey = `${itemId}__${variantColor}`
      } else {
        // No variant
        cartKey = itemId
      }

      if (quantity <= 0) {
        // Remove from cart if quantity is 0 or less
        let cartData = structuredClone(cartItems)
        delete cartData[cartKey]
        setCartItems(cartData)
        
        if (token) {
          try {
            await axios.post(
              backendUrl + API_ENDPOINTS.CART_ADD,
              { 
                itemId, 
                quantity: 0, 
                variantColor,
                selectedAttributes: selectedAttributes || (variantColor ? { color: variantColor } : null)
              },
              { headers: { token } }
            )
          } catch (error) {
            // Silent error handling for removal
          }
        } else {
          localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cartData))
        }
        return
      }

      if (quantity > CART_LIMITS.MAX_QUANTITY) {
        toast.error(ERROR_MESSAGES.MAX_QUANTITY_REACHED)
        return
      }

      let cartData = structuredClone(cartItems)

      // Remove any old entry without variant suffix if switching to variant
      if ((variantColor || selectedAttributes) && cartData[itemId] && !cartData[cartKey]) {
        delete cartData[itemId]
      }

      cartData[cartKey] = quantity
      setCartItems(cartData)

      if (token) {
        try {
          await axios.post(
            backendUrl + API_ENDPOINTS.CART_ADD,
            { 
              itemId, 
              quantity, 
              variantColor,
              selectedAttributes: selectedAttributes || (variantColor ? { color: variantColor } : null)
            },
            { headers: { token } }
          )
        } catch (error) {
          toast.error(error.message)
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cartData))
      }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const cartKey in cartItems) {
            try {
                if (cartItems[cartKey] > 0) {
                    // Extract productId from cartKey (format: productId or productId__variantColor)
                    const [productId] = cartKey.split('__');
                    // Only count items if the product still exists
                    const productExists = products.find(product => product._id === productId);
                    if (productExists) {
                        totalCount += cartItems[cartKey];
                    }
                }
            } catch (error) {
                // Silent error handling
            }
        }
        return totalCount;
    }

    const updateQuantity = async (cartKey, quantity) => {
        // Parse productId and variant info from cartKey
        const [itemId, variantPart] = cartKey.split('__')

        let cartData = structuredClone(cartItems);

        if (quantity === 0) {
            delete cartData[cartKey]
        } else {
            cartData[cartKey] = quantity;
        }

        setCartItems(cartData)

        if (token) {
            try {
                // Support both old and new variant format
                let variantColor = null
                let selectedAttributes = null
                
                if (variantPart) {
                  // Check if it's new format (contains ':')
                  if (variantPart.includes(':')) {
                    // New format: color:Red::length:10m
                    selectedAttributes = {}
                    const pairs = variantPart.split('::')
                    pairs.forEach(pair => {
                      const [type, value] = pair.split(':')
                      selectedAttributes[type] = value
                    })
                  } else {
                    // Old format: just color value
                    variantColor = variantPart
                  }
                }

                await axios.post(
                  backendUrl + API_ENDPOINTS.CART_UPDATE, 
                  { 
                    itemId, 
                    quantity, 
                    variantColor: variantColor || null,
                    selectedAttributes: selectedAttributes || null
                  }, 
                  { headers: { token } }
                )

            } catch (error) {
                toast.error(error.message)
            }
        } else {
            // Save to localStorage if not logged in
            localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cartData));
        }

    }

    // Helper function to find a variant from selected attributes
    const findVariantByAttributes = (product, attributes) => {
      if (!product.variants || product.variants.length === 0) return null
      
      return product.variants.find(variant => {
        // Check if variant matches all attributes
        for (const [type, value] of Object.entries(attributes)) {
          if (type === 'color') {
            // For color, check both attributes and legacy color field
            if (variant.attributes?.color === value || variant.color === value) continue
            else return false
          } else {
            // For other types, check attributes object
            if (variant.attributes?.[type] === value) continue
            else return false
          }
        }
        return true
      })
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const cartKey in cartItems) {
            // Parse cartKey to extract productId and variant info
            const [productId, variantPart] = cartKey.split('__')
            let itemInfo = products.find((product) => product._id === productId);
            try {
                if (cartItems[cartKey] > 0 && itemInfo) {
                    let price
                    // Check if this is a variant product
                    if (variantPart && itemInfo.variants?.length > 0) {
                        let variant = null
                        
                        if (variantPart.includes(':')) {
                          // New format: color:Red::length:10m
                          const attributes = {}
                          const pairs = variantPart.split('::')
                          pairs.forEach(pair => {
                            const [type, value] = pair.split(':')
                            attributes[type] = value
                          })
                          variant = findVariantByAttributes(itemInfo, attributes)
                        } else {
                          // Old format: just color value (backward compatibility)
                          variant = itemInfo.variants.find(v => v.color === variantPart)
                        }
                        
                        price = (variant?.price !== undefined && variant?.price !== null && variant?.price !== '') ? Number(variant.price) : (itemInfo.retailPrice || itemInfo.price)
                        // For variant products without main price, use first variant
                        if (!price && itemInfo?.variants?.[0]?.price) {
                          price = itemInfo.variants[0].price
                        }
                        price = price || 0
                    } else {
                        // Non-variant product - use getProductPrice, with fallback to first variant
                        price = getProductPrice(itemInfo, cartItems[cartKey])
                        if (!price && itemInfo?.variants?.[0]?.price) {
                          price = itemInfo.variants[0].price
                        }
                        price = price || 0
                    }
                    totalAmount += price * cartItems[cartKey];
                }
            } catch (error) {
                // Silent error handling
            }
        }
        return totalAmount;
    }

    const cleanupCart = async () => {
        // Remove items from cart that no longer exist in products
        let cartData = structuredClone(cartItems);
        let hasChanges = false;
        
        for (const cartKey in cartData) {
            // Parse cartKey to extract productId (format: productId or productId__variantColor)
            const [productId] = cartKey.split('__');
            const productExists = products.find(product => product._id === productId);
            if (!productExists && cartData[cartKey] > 0) {
                delete cartData[cartKey];
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            setCartItems(cartData);
            
            // Update backend if logged in
            if (token) {
                try {
                    // Zero out removed items in backend so they don't reappear on next load
                    const removedIds = Object.keys(cartItems).filter(id => !(id in cartData));
                    for (const itemId of removedIds) {
                        await axios.post(backendUrl + API_ENDPOINTS.CART_UPDATE,
                            { itemId, quantity: 0 },
                            { headers: { token } }
                        )
                    }
                    // Update remaining items
                    for (const itemId in cartData) {
                        if (cartData[itemId] > 0) {
                            await axios.post(backendUrl + API_ENDPOINTS.CART_UPDATE, 
                                { itemId, quantity: cartData[itemId] }, 
                                { headers: { token } }
                            )
                        }
                    }
                } catch (error) {
                    // Silent error handling
                }
            } else {
                // Update localStorage for guest users
                localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cartData));
            }
        }
    }

    const getProductsData = async () => {
        try {
            // Include token in request header so server can filter prices appropriately
            const headers = token ? { token } : {};
            const response = await axios.get(backendUrl + API_ENDPOINTS.PRODUCT_LIST, { headers });
            
            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const getUserCart = async ( token ) => {
        try {
            
            const response = await axios.post(backendUrl + API_ENDPOINTS.CART_GET,{},{headers:{token}})
            if (response.data.success) {
                // Clean up any corrupted cart data
                if (response.data.cartData) {
                    const cleanCart = {}
                    Object.entries(response.data.cartData).forEach(([key, val]) => {
                        if (val > 0) cleanCart[key] = val
                    })
                    setCartItems(cleanCart)
                } else {
                    setCartItems(response.data.cartData)
                }
            } else if (isAuthErrorMessage(response.data.message)) {
                handleAuthFailure(ERROR_MESSAGES.SESSION_EXPIRED)
            }
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            if (isAuthErrorMessage(message)) {
                handleAuthFailure(ERROR_MESSAGES.SESSION_EXPIRED)
                return
            }
            toast.error(message)
        }
    }

    const getUserProfile = async (token) => {
        try {
            const response = await axios.post(backendUrl + API_ENDPOINTS.USER_PROFILE, {}, { headers: { token } });
            if (response.data.success) {
                setUserProfile(response.data.user);
            } else if (isAuthErrorMessage(response.data.message)) {
                handleAuthFailure(ERROR_MESSAGES.SESSION_EXPIRED);
            }
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            if (isAuthErrorMessage(message)) {
                handleAuthFailure(ERROR_MESSAGES.SESSION_EXPIRED);
                return;
            }
        }
    }

    const syncCartToDatabase = async (localCart, token) => {
        try {
            // Get current backend cart
            const response = await axios.post(backendUrl + API_ENDPOINTS.CART_GET, {}, { headers: { token } })
            if (response.data.success) {
                const backendCart = response.data.cartData || {};
                
                // Merge: use the higher quantity for each item
                const mergedCart = { ...backendCart };
                for (const itemId in localCart) {
                    if (localCart[itemId] > 0) {
                        mergedCart[itemId] = Math.max(mergedCart[itemId] || 0, localCart[itemId]);
                    }
                }
                
                // Update all items in backend
                for (const itemId in mergedCart) {
                    if (mergedCart[itemId] > 0) {
                        await axios.post(backendUrl + API_ENDPOINTS.CART_UPDATE, 
                            { itemId, quantity: mergedCart[itemId] }, 
                            { headers: { token } }
                        )
                    }
                }
                
                // Update local state with merged cart
                setCartItems(mergedCart);
                // Clear guest cart from localStorage
                localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
                
                return true; // Indicate sync completed
            } else if (isAuthErrorMessage(response.data.message)) {
                handleAuthFailure(ERROR_MESSAGES.SESSION_EXPIRED)
            }
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            if (isAuthErrorMessage(message)) {
                handleAuthFailure(ERROR_MESSAGES.SESSION_EXPIRED)
                return false
            }
            toast.error(ERROR_MESSAGES.SYNC_FAILED)
            return false;
        }
    }

    useEffect(() => {
        if (token) {
            getProductsData()
            getUserProfile(token)
        } else {
            getProductsData()
        }
    }, [token])

    useEffect(() => {
        if (!token && localStorage.getItem(STORAGE_KEYS.TOKEN)) {
            setToken(localStorage.getItem(STORAGE_KEYS.TOKEN))
            if (products.length > 0) {
                getUserCart(localStorage.getItem(STORAGE_KEYS.TOKEN))
            }
        } else if (token && products.length > 0) {
            getUserCart(token)
        } else if (!token) {
            // Load guest cart from localStorage when not logged in
            const guestCart = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
            if (guestCart) {
                try {
                    setCartItems(JSON.parse(guestCart));
                } catch (error) {
                    // Silent error handling
                }
            }
        }
    }, [token, products])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartQuantity, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token, syncCartToDatabase, logout,
        userProfile, getProductPrice, canUseWholesalePrice,
        selectedCategory, setSelectedCategory
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;