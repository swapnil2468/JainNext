import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const [searchParams] = useSearchParams()
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

  // Check for category query parameter on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setCategory([categoryParam])
      setSubCategory([])
    }
  }, [searchParams])

  // Sync context filters (set from navbar mega-menu) into local state on every change
  useEffect(() => {
    if (!searchParams.get('category')) {
      setCategory(selectedCategory);
      setSubCategory(selectedSubCategory);
    }
  }, [selectedCategory, selectedSubCategory, searchParams]);

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
    <div className='min-h-screen bg-white'>
      {/* Header Section */}
      <div className='pt-32 pb-12 bg-white px-6 lg:px-8'>
        <div className='max-w-3xl'>
          <h1 className='text-4xl md:text-5xl font-light text-neutral-900 mb-4'>
            All <span className='text-rose-600'>Collections</span>
          </h1>
          <p className='text-lg text-neutral-600'>
            Discover our complete range of premium lighting solutions
          </p>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className='lg:hidden px-6 mb-4'>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-xl font-medium hover:border-rose-300 transition-colors'
        >
          <i className='ri-filter-3-line text-lg'></i>
          {showFilter ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className='flex flex-col lg:flex-row gap-8 px-6 lg:px-8 pb-20'>
      
      {/* Filter Options */}
      <div className='w-full lg:w-72 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 h-fit'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-semibold text-neutral-900'>Filters</h2>
          <button
            onClick={() => {
              setCategory([])
              setSubCategory([])
              setPriceRange([minPrice, maxPrice])
              setMinInput(String(minPrice))
              setMaxInput(String(maxPrice))
            }}
            className='text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors'
          >
            Reset All
          </button>
        </div>
        {/* Category Filter */}
        <div className={`${showFilter ? '' :'hidden'} lg:block`}>
          <p className='text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide'>Categories</p>
          <div className='flex flex-col gap-3'>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'LED String Lights'} checked={category.includes('LED String Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>LED String Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Decorative Lights'} checked={category.includes('Decorative Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Decorative Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Curtain & Net Lights'} checked={category.includes('Curtain & Net Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Curtain & Net Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Strip & Rope Lights'} checked={category.includes('Strip & Rope Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Strip & Rope Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'SMD & Module Lights'} checked={category.includes('SMD & Module Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>SMD & Module Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Flood & Outdoor Lights'} checked={category.includes('Flood & Outdoor Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Flood & Outdoor Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Stage & Effect Lights'} checked={category.includes('Stage & Effect Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Stage & Effect Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Festival & Patriotic Lights'} checked={category.includes('Festival & Patriotic Lights')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Festival & Patriotic Lights</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Power & Accessories'} checked={category.includes('Power & Accessories')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Power & Accessories</span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <div className='relative'>
                <input type='checkbox' value={'Specialty & Novelty Lighting'} checked={category.includes('Specialty & Novelty Lighting')} onChange={toggleCategory} className='peer sr-only' />
                <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                </div>
              </div>
              <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>Specialty & Novelty Lighting</span>
            </label>
          </div>
        </div>
        {/* SubCategory Filter */}
        {category.length > 0 && (
          <div className={`${showFilter ? '' :'hidden'} lg:block pt-6 border-t border-neutral-100`}>
            <p className='text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide'>Type</p>
            <div className='flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 filter-scroll'>
              {getAvailableSubCategories().map((subCat) => (
                <label key={subCat} className='flex items-center gap-3 cursor-pointer group'>
                  <div className='relative'>
                    <input 
                      type='checkbox' 
                      value={subCat} 
                      checked={subCategory.includes(subCat)}
                      onChange={toggleSubCategory}
                      className='peer sr-only'
                    />
                    <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                      <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                    </div>
                  </div>
                  <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>{subCat}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {/* Price Range Filter */}
        <div className={`${showFilter ? '' :'hidden'} lg:block pt-6 border-t border-neutral-100`}>
          <p className='text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide'>Price Range</p>
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
                  className='w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all'
                  placeholder={`₹${minPrice}`}
                />
              </div>
              <span className='text-neutral-400'>-</span>
              <div>
                <label className='text-xs text-neutral-600 mb-1 block'>Max Price</label>
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
                  className='w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all'
                  placeholder={`₹${maxPrice}`}
                />
              </div>
            </div>
            
            {/* Range Display */}
            <div className='flex justify-between text-xs text-neutral-600'>
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            
            {/* Min Price Slider */}
            <div className='flex flex-col gap-2'>
              <label className='text-xs text-neutral-600'>Slide Min</label>
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
                className='w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-rose-600'
              />
            </div>
            
            {/* Max Price Slider */}
            <div className='flex flex-col gap-2'>
              <label className='text-xs text-neutral-600'>Slide Max</label>
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
                className='w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-rose-600'
              />
            </div>
            
            <button
              onClick={() => {
                setPriceRange([minPrice, maxPrice]);
                setMinInput(String(minPrice));
                setMaxInput(String(maxPrice));
              }}
              className='w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg font-medium hover:from-rose-700 hover:to-rose-800 transition-all mt-1'
            >
              Reset Price
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        {/* Toolbar */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <p className='text-neutral-600'>
            Showing <span className='font-semibold text-neutral-900'>{visibleProducts.length}</span> of <span className='font-semibold text-neutral-900'>{filterProducts.length}</span> products
          </p>
          <div className='flex items-center gap-3'>
            <label className='text-sm font-medium text-neutral-700'>Sort by:</label>
            <select
              onChange={(e) => setSortType(e.target.value)}
              className='px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer'
            >
              <option value='relavent'>Relevant</option>
              <option value='low-high'>Price: Low to High</option>
              <option value='high-low'>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {category.length > 0 && (
          <div className='flex flex-wrap items-center gap-2 mb-6'>
            <span className='text-sm font-medium text-neutral-700'>Active Filters:</span>
            {category.map(cat => (
              <span key={cat} className='inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm font-medium'>
                {cat}
                <button onClick={() => setCategory(prev => prev.filter(c => c !== cat))} className='hover:bg-rose-100 rounded-full p-0.5 transition-colors'>
                  <i className='ri-close-line text-sm'></i>
                </button>
              </span>
            ))}
          </div>
        )}

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
            <p className='text-neutral-500'>Loading more products...</p>
          </div>
        )}
        
        {!isLoadingMore && displayCount >= filterProducts.length && filterProducts.length > 20 && (
          <div className='text-center py-8'>
            <p className='text-gray-400 text-sm'>You've reached the end • {filterProducts.length} products shown</p>
          </div>
        )}
        
        {filterProducts.length === 0 && (
          <div className='text-center py-20'>
            <div className='w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <i className='ri-shopping-bag-line text-4xl text-neutral-400'></i>
            </div>
            <h3 className='text-2xl font-light text-neutral-900 mb-2'>No products found</h3>
            <p className='text-neutral-600 mb-6'>Try adjusting your filters to find what you're looking for</p>
            <button
              onClick={() => { setCategory([]); setSubCategory([]); setPriceRange([minPrice, maxPrice]); }}
              className='px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-full font-medium hover:from-rose-700 hover:to-rose-800 transition-all'
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      </div>
    </div>
  )
}

export default Collection
