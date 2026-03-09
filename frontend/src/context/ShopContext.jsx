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


    const addToCart = async (itemId) => {

        const product = products.find(p => p._id === itemId);
        if (!product) {
            toast.error('Product not found');
            return;
        }

        const currentQty = cartItems[itemId] || 0;
        
        // Prevent unrealistic quantities (max 999 per item)
        if (currentQty >= 999) {
            toast.error('Maximum quantity limit reached');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/add', { itemId }, { headers: { token } })

            } catch (error) {
                console.error('Error adding to cart:', error)
                toast.error(error.message)
            }
        } else {
            // Save to localStorage if not logged in
            localStorage.setItem('guestCart', JSON.stringify(cartData));
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            try {
                if (cartItems[items] > 0) {
                    // Only count items if the product still exists
                    const productExists = products.find(product => product._id === items);
                    if (productExists) {
                        totalCount += cartItems[items];
                    }
                }
            } catch (error) {
                console.error('Error counting cart items:', error)
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);

        cartData[itemId] = quantity;

        setCartItems(cartData)

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/update', { itemId, quantity }, { headers: { token } })

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
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            try {
                if (cartItems[items] > 0 && itemInfo) {
                    const price = getProductPrice(itemInfo, cartItems[items]);
                    totalAmount += price * cartItems[items];
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
        
        for (const itemId in cartData) {
            const productExists = products.find(product => product._id === itemId);
            if (!productExists && cartData[itemId] > 0) {
                delete cartData[itemId];
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
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.error('Error fetching user cart:', error)
            toast.error(error.message)
        }
    }

    const getUserProfile = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } });
            if (response.data.success) {
                setUserProfile(response.data.user);
            }
        } catch (error) {
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
            }
        } catch (error) {
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

    useEffect(() => {
        // Clean up cart when products are loaded (remove items for deleted products)
        if (products.length > 0 && Object.keys(cartItems).length > 0 && !hasCleanedCart.current) {
            cleanupCart();
            hasCleanedCart.current = true;
        }
    }, [products, cartItems])

    useEffect(() => {
        // Reset cleanup flag on every token change so new sessions get cleaned properly
        hasCleanedCart.current = false;
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        } else if (token) {
            getUserCart(token)
        } else {
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
    }, [token])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token, syncCartToDatabase,
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