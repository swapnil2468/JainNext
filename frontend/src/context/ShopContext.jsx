import { createContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const [userProfile, setUserProfile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState([]);
    const navigate = useNavigate();
    const hasCleanedCart = useRef(false);

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

    const handleAuthFailure = (message = 'Session expired. Please login again.') => {
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
            quantity >= (product.minimumWholesaleQuantity || 10)) {
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


    const addToCart = async (itemId, quantity = 1, variantColor = null) => {
      const product = products.find(p => p._id === itemId)
      if (!product) {
        toast.error('Product not found')
        return
      }

      // Always use variant-aware cart key
      const cartKey = variantColor ? `${itemId}__${variantColor}` : itemId

      const currentQty = cartItems[cartKey] || 0
      const newQty = currentQty + quantity

      if (newQty > 999) {
        toast.error('Maximum quantity limit reached')
        return
      }

      let cartData = structuredClone(cartItems)

      // Remove any old entry without variant suffix if switching to variant
      // This prevents duplicate entries
      if (variantColor && cartData[itemId] && !cartData[`${itemId}__${variantColor}`]) {
        delete cartData[itemId]
      }

      cartData[cartKey] = newQty
      setCartItems(cartData)

      if (token) {
        try {
          await axios.post(
            backendUrl + '/api/cart/add',
            { itemId, quantity, variantColor },
            { headers: { token } }
          )
        } catch (error) {
          console.error('Error adding to cart:', error)
          toast.error(error.message)
        }
      } else {
        localStorage.setItem('guestCart', JSON.stringify(cartData))
      }
    }

    // Set cart quantity to exact amount (used for quick view modal) instead of adding
    const setCartQuantity = async (itemId, quantity, variantColor = null) => {
      const product = products.find(p => p._id === itemId)
      if (!product) {
        toast.error('Product not found')
        return
      }

      const cartKey = variantColor ? `${itemId}__${variantColor}` : itemId

      if (quantity <= 0) {
        // Remove from cart if quantity is 0 or less
        let cartData = structuredClone(cartItems)
        delete cartData[cartKey]
        setCartItems(cartData)
        
        if (token) {
          try {
            await axios.post(
              backendUrl + '/api/cart/add',
              { itemId, quantity: 0, variantColor },
              { headers: { token } }
            )
          } catch (error) {
            console.error('Error updating cart:', error)
          }
        } else {
          localStorage.setItem('guestCart', JSON.stringify(cartData))
        }
        return
      }

      if (quantity > 999) {
        toast.error('Maximum quantity limit reached')
        return
      }

      let cartData = structuredClone(cartItems)

      // Remove any old entry without variant suffix if switching to variant
      if (variantColor && cartData[itemId] && !cartData[`${itemId}__${variantColor}`]) {
        delete cartData[itemId]
      }

      cartData[cartKey] = quantity
      setCartItems(cartData)

      if (token) {
        try {
          await axios.post(
            backendUrl + '/api/cart/add',
            { itemId, quantity, variantColor },
            { headers: { token } }
          )
        } catch (error) {
          console.error('Error updating cart:', error)
          toast.error(error.message)
        }
      } else {
        localStorage.setItem('guestCart', JSON.stringify(cartData))
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
                console.error('Error counting cart items:', error)
            }
        }
        return totalCount;
    }

    const updateQuantity = async (cartKey, quantity) => {
        // Parse productId and variantColor from cartKey
        const [itemId, variantColor] = cartKey.split('__')

        let cartData = structuredClone(cartItems);

        if (quantity === 0) {
            delete cartData[cartKey]
        } else {
            cartData[cartKey] = quantity;
        }

        setCartItems(cartData)

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/update', { itemId, quantity, variantColor: variantColor || null }, { headers: { token } })

            } catch (error) {
                console.error('Error updating cart:', error)
                toast.error(error.message)
            }
        } else {
            // Save to localStorage if not logged in
            localStorage.setItem('guestCart', JSON.stringify(cartData));
        }

    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const cartKey in cartItems) {
            // Parse cartKey to extract productId and variantColor
            const [productId, variantColor] = cartKey.split('__')
            let itemInfo = products.find((product) => product._id === productId);
            try {
                if (cartItems[cartKey] > 0 && itemInfo) {
                    let price
                    // Check if this is a variant product
                    if (variantColor && itemInfo.variants?.length > 0) {
                        const variant = itemInfo.variants.find(v => v.color === variantColor)
                        price = variant?.price || itemInfo.retailPrice || itemInfo.price
                    } else {
                        // Non-variant product - use getProductPrice
                        price = getProductPrice(itemInfo, cartItems[cartKey])
                    }
                    totalAmount += price * cartItems[cartKey];
                }
            } catch (error) {
                console.error('Error calculating cart amount:', error)
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
                        await axios.post(backendUrl + '/api/cart/update',
                            { itemId, quantity: 0 },
                            { headers: { token } }
                        )
                    }
                    // Update remaining items
                    for (const itemId in cartData) {
                        if (cartData[itemId] > 0) {
                            await axios.post(backendUrl + '/api/cart/update', 
                                { itemId, quantity: cartData[itemId] }, 
                                { headers: { token } }
                            )
                        }
                    }
                } catch (error) {
                    console.error('Error cleaning up cart:', error);
                }
            } else {
                // Update localStorage for guest users
                localStorage.setItem('guestCart', JSON.stringify(cartData));
            }
        }
    }

    const getProductsData = async () => {
        try {
            // Include token in request header so server can filter prices appropriately
            const headers = token ? { token } : {};
            const response = await axios.get(backendUrl + '/api/product/list', { headers });
            
            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error(error.message)
        }
    }

    const getUserCart = async ( token ) => {
        try {
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
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
                handleAuthFailure('Session expired. Please login again.')
            }
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            if (isAuthErrorMessage(message)) {
                handleAuthFailure('Session expired. Please login again.')
                return
            }
            console.error('Error fetching user cart:', error)
            toast.error(message)
        }
    }

    const getUserProfile = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } });
            if (response.data.success) {
                setUserProfile(response.data.user);
            } else if (isAuthErrorMessage(response.data.message)) {
                handleAuthFailure('Session expired. Please login again.');
            }
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            if (isAuthErrorMessage(message)) {
                handleAuthFailure('Session expired. Please login again.');
                return;
            }
            console.error('Error fetching user profile:', error);
        }
    }

    const syncCartToDatabase = async (localCart, token) => {
        try {
            // Get current backend cart
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } })
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
                        await axios.post(backendUrl + '/api/cart/update', 
                            { itemId, quantity: mergedCart[itemId] }, 
                            { headers: { token } }
                        )
                    }
                }
                
                // Update local state with merged cart
                setCartItems(mergedCart);
                // Clear guest cart from localStorage
                localStorage.removeItem('guestCart');
                
                return true; // Indicate sync completed
            } else if (isAuthErrorMessage(response.data.message)) {
                handleAuthFailure('Session expired. Please login again.')
            }
        } catch (error) {
            const message = error?.response?.data?.message || error.message
            if (isAuthErrorMessage(message)) {
                handleAuthFailure('Session expired. Please login again.')
                return false
            }
            console.error('Error syncing cart to database:', error)
            toast.error('Failed to sync cart')
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

    // Disabled automatic cleanup on product load - causes race conditions on reload
    // Cart items are persisted server-side and should not be auto-deleted based on product order
    // useEffect(() => {
    //     if (products.length > 0 && Object.keys(cartItems).length > 0 && !hasCleanedCart.current) {
    //         cleanupCart();
    //         hasCleanedCart.current = true;
    //     }
    // }, [products, cartItems])

    useEffect(() => {
        // Reset cleanup flag on every token change so new sessions get cleaned properly
        hasCleanedCart.current = false;
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            if (products.length > 0) {
                getUserCart(localStorage.getItem('token'))
            }
        } else if (token && products.length > 0) {
            getUserCart(token)
        } else if (!token) {
            // Load guest cart from localStorage when not logged in
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                try {
                    setCartItems(JSON.parse(guestCart));
                } catch (error) {
                    console.error('Error loading guest cart:', error);
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
        selectedCategory, setSelectedCategory,
        selectedSubCategory, setSelectedSubCategory
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;