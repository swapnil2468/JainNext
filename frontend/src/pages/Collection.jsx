import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { products, search, showSearch, selectedCategory, setSelectedCategory, selectedSubCategory, setSelectedSubCategory } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent')
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minInput, setMinInput] = useState('0');
  const [maxInput, setMaxInput] = useState('5000');
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Calculate dynamic min/max from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.retailPrice || p.price).filter(p => p > 0);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        // Round down to nearest 100 for min, round up for max
        const roundedMin = Math.floor(min / 100) * 100;
        const roundedMax = Math.ceil(max / 100) * 100;
        setMinPrice(roundedMin);
        setMaxPrice(roundedMax);
        setPriceRange([roundedMin, roundedMax]);
        setMinInput(String(roundedMin));
        setMaxInput(String(roundedMax));
      }
    }
  }, [products]);

  // Sync context filters (set from navbar mega-menu) into local state on every change
  useEffect(() => {
    setCategory(selectedCategory);
    setSubCategory(selectedSubCategory);
  }, [selectedCategory, selectedSubCategory]);

  // Category to Subcategory Mapping
  const categoryOptions = {
    "LED String Lights": ["Pixel String Lights", "Still/Static String Lights", "Multi-Color String Lights", "Single-Color String Lights", "Remote-Control String Lights"],
    "Decorative Lights": ["Festival Motif Lights", "Shape/Novelty Lights", "Themed Decorative Lights", "Hanging Decorative Lights"],
    "Curtain & Net Lights": ["Curtain Lights", "Net/Jaal Lights", "Waterfall Lights", "Leaf/Pattern Curtain Lights"],
    "Strip & Rope Lights": ["LED Strip Lights", "Magic/RGB Strip Lights", "Neon Rope Lights", "DC Powered Strips"],
    "SMD & Module Lights": ["SMD Running Lights", "SMD Static Lights", "LED Modules/Leads"],
    "Flood & Outdoor Lights": ["Flood Lights", "Lens Flood Lights", "Sheet Flood Lights", "Outdoor Waterproof Lights"],
    "Stage & Effect Lights": ["PAR Lights", "Laser Lights", "Spark/Firework Effect Lights", "Rotating Effect Lights"],
    "Festival & Patriotic Lights": ["Tricolor Theme Lights", "Festival Special Lights", "Religious Theme Lights"],
    "Power & Accessories": ["Adapters/Drivers", "Controllers/Remotes", "Connectors & Jointers", "Mounting Profiles"],
    "Specialty & Novelty Lighting": ["Sensor Lights", "Battery/Cork Lights", "Bluetooth/Music Lights", "Designer Lamps"]
  }

  // Get available subcategories based on selected categories
  const getAvailableSubCategories = () => {
    if (category.length === 0) {
      return [];
    }
    const available = new Set();
    category.forEach(cat => {
      if (categoryOptions[cat]) {
        categoryOptions[cat].forEach(subCat => available.add(subCat));
      }
    });
    return Array.from(available);
  }

  const toggleCategory = (e) => {

    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
        // Clear subcategories when unchecking all categories
        if (category.length === 1) {
          setSubCategory([])
        }
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }

  }

  const toggleSubCategory = (e) => {

    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  }

  const applyFilter = () => {

    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0 ) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    // Filter by price range
    productsCopy = productsCopy.filter(item => {
      const price = item.retailPrice || item.price; // Backward compatibility
      return price >= priceRange[0] && price <= priceRange[1];
    })

    setFilterProducts(productsCopy)

  }

  const sortProduct = () => {

    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>{
          const priceA = a.retailPrice || a.price;
          const priceB = b.retailPrice || b.price;
          return priceA - priceB;
        }));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>{
          const priceA = a.retailPrice || a.price;
          const priceB = b.retailPrice || b.price;
          return priceB - priceA;
        }));
        break;

      default:
        applyFilter();
        break;
    }

  }

  useEffect(()=>{
      applyFilter();
      setDisplayCount(20); // Reset to 20 when filters change
  },[category,subCategory,search,showSearch,products,priceRange])

  useEffect(()=>{
    sortProduct();
    setDisplayCount(20); // Reset visible count when sort order changes
  },[sortType])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Check if user is near bottom (within 500px)
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomPosition = document.documentElement.scrollHeight - 500;
      
      if (scrollPosition >= bottomPosition && !isLoadingMore && displayCount < filterProducts.length) {
        setIsLoadingMore(true);
        // Simulate loading delay for smooth UX
        setTimeout(() => {
          setDisplayCount(prev => prev + 20);
          setIsLoadingMore(false);
        }, 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filterProducts.length, displayCount, isLoadingMore]);

  // Get visible products based on display count
  const visibleProducts = filterProducts.slice(0, displayCount);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'LED String Lights'} checked={category.includes('LED String Lights')} onChange={toggleCategory}/> LED String Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Decorative Lights'} checked={category.includes('Decorative Lights')} onChange={toggleCategory}/> Decorative Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Curtain & Net Lights'} checked={category.includes('Curtain & Net Lights')} onChange={toggleCategory}/> Curtain & Net Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Strip & Rope Lights'} checked={category.includes('Strip & Rope Lights')} onChange={toggleCategory}/> Strip & Rope Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'SMD & Module Lights'} checked={category.includes('SMD & Module Lights')} onChange={toggleCategory}/> SMD & Module Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Flood & Outdoor Lights'} checked={category.includes('Flood & Outdoor Lights')} onChange={toggleCategory}/> Flood & Outdoor Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Stage & Effect Lights'} checked={category.includes('Stage & Effect Lights')} onChange={toggleCategory}/> Stage & Effect Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Festival & Patriotic Lights'} checked={category.includes('Festival & Patriotic Lights')} onChange={toggleCategory}/> Festival & Patriotic Lights
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Power & Accessories'} checked={category.includes('Power & Accessories')} onChange={toggleCategory}/> Power & Accessories
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Specialty & Novelty Lighting'} checked={category.includes('Specialty & Novelty Lighting')} onChange={toggleCategory}/> Specialty & Novelty Lighting
            </p>
          </div>
        </div>
        {/* SubCategory Filter */}
        {category.length > 0 && (
          <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>TYPE</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700 max-h-60 overflow-y-auto pr-5 mr-2 filter-scroll'>
              {getAvailableSubCategories().map((subCat) => (
                <p key={subCat} className='flex gap-2'>
                  <input 
                    className='w-3' 
                    type="checkbox" 
                    value={subCat} 
                    checked={subCategory.includes(subCat)}
                    onChange={toggleSubCategory}
                  /> {subCat}
                </p>
              ))}
            </div>
          </div>
        )}
        {/* Price Range Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>PRICE RANGE</p>
          <div className='flex flex-col gap-3 text-sm text-gray-700 pr-5'>
            {/* Manual Input Fields */}
            <div className='flex gap-3 items-center'>
              <div>
                <label className='text-xs text-gray-500 mb-1 block'>Min Price</label>
                <input
                  type="text"
                  value={minInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or numbers
                    if (value === '' || /^\d+$/.test(value)) {
                      setMinInput(value);
                    }
                  }}
                  onBlur={() => {
                    const num = Number(minInput);
                    if (minInput === '' || isNaN(num)) {
                      // Reset to current range if empty
                      setMinInput(String(priceRange[0]));
                    } else {
                      // Clamp to bounds
                      const clamped = Math.max(minPrice, Math.min(num, priceRange[1]));
                      setPriceRange([clamped, priceRange[1]]);
                      setMinInput(String(clamped));
                    }
                  }}
                  className='w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-700'
                  placeholder={`₹${minPrice}`}
                />
              </div>
              <span className='text-gray-400 mt-5'>-</span>
              <div>
                <label className='text-xs text-gray-500 mb-1 block'>Max Price</label>
                <input
                  type="text"
                  value={maxInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or numbers
                    if (value === '' || /^\d+$/.test(value)) {
                      setMaxInput(value);
                    }
                  }}
                  onBlur={() => {
                    const num = Number(maxInput);
                    if (maxInput === '' || isNaN(num)) {
                      // Reset to current range if empty
                      setMaxInput(String(priceRange[1]));
                    } else {
                      // Clamp to bounds
                      const clamped = Math.min(maxPrice, Math.max(num, priceRange[0]));
                      setPriceRange([priceRange[0], clamped]);
                      setMaxInput(String(clamped));
                    }
                  }}
                  className='w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-700'
                  placeholder={`₹${maxPrice}`}
                />
              </div>
            </div>
            
            {/* Range Display */}
            <div className='flex justify-between text-xs text-gray-600'>
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            
            {/* Min Price Slider */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-500'>Slide Min</label>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="100"
                value={priceRange[0]}
                onChange={(e) => {
                  const newMin = Number(e.target.value);
                  if (newMin <= priceRange[1]) {
                    setPriceRange([newMin, priceRange[1]]);
                    setMinInput(String(newMin));
                  }
                }}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-700'
              />
            </div>
            
            {/* Max Price Slider */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-500'>Slide Max</label>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="100"
                value={priceRange[1]}
                onChange={(e) => {
                  const newMax = Number(e.target.value);
                  if (newMax >= priceRange[0]) {
                    setPriceRange([priceRange[0], newMax]);
                    setMaxInput(String(newMax));
                  }
                }}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-700'
              />
            </div>
            
            <button
              onClick={() => {
                setPriceRange([minPrice, maxPrice]);
                setMinInput(String(minPrice));
                setMaxInput(String(maxPrice));
              }}
              className='text-xs text-red-700 hover:text-red-900 font-medium mt-1 text-left'
            >
              Reset Price
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            {/* Porduct Sort */}
            <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
              <option value="relavent">Sort by: Relavent</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8'>
          {
            visibleProducts.map((item,index)=>(
              <ProductItem 
                key={index} 
                name={item.name} 
                id={item._id} 
                price={item.retailPrice || item.price} 
                wholesalePrice={item.wholesalePrice} 
                minimumWholesaleQuantity={item.minimumWholesaleQuantity} 
                image={item.image} 
                stock={item.stock} 
              />
            ))
          }
        </div>
        
        {/* Loading indicator or end message */}
        {isLoadingMore && (
          <div className='text-center py-8'>
            <p className='text-gray-500'>Loading more products...</p>
          </div>
        )}
        
        {!isLoadingMore && displayCount >= filterProducts.length && filterProducts.length > 20 && (
          <div className='text-center py-8'>
            <p className='text-gray-400 text-sm'>You've reached the end • {filterProducts.length} products shown</p>
          </div>
        )}
        
        {filterProducts.length === 0 && (
          <div className='text-center py-20'>
            <p className='text-gray-500 text-lg'>No products found matching your filters</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Collection
