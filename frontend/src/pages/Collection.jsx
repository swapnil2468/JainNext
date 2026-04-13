import React, { useContext, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const [searchParams] = useSearchParams()
  const { products, search, setSearch, showSearch, setShowSearch, selectedCategory, setSelectedCategory } = useContext(ShopContext);
  const searchInputRef = useRef(null)
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent')
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minInput, setMinInput] = useState('0');
  const [maxInput, setMaxInput] = useState('5000');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  // Calculate dynamic min/max from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.retailPrice || p.price).filter(p => p > 0);
      if (prices.length > 0) {
        const max = Math.max(...prices);
        // Always start from 0, round max up to nearest 50
        const roundedMin = 0;
        const roundedMax = Math.ceil(max / 50) * 50;
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
    }
  }, [searchParams])

  // Sync context filters (set from navbar mega-menu) into local state on every change
  useEffect(() => {
    if (!searchParams.get('category')) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory, searchParams]);

  // Auto-focus search input when showSearch is true
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }, [showSearch])

  // Categories
  const categories = [
    "String Lights",
    "Waterfalls Lights",
    "SMD Lights",
    "Strip Lights",
    "Par & DJ Lights",
    "Flood & Outdoor Lights",
    "Decorative Lighting",
    "Neon Sign Lights",
    "Alluminium Profile",
    "Power Accessories"
  ]



  const toggleCategory = (e) => {

    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
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

    // Filter by price range
    productsCopy = productsCopy.filter(item => {
      const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null
      const price = firstVariant?.price || item.retailPrice || item.price
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
      setCurrentPage(1); // Reset to page 1 when filters change
  },[category,search,showSearch,products,priceRange])

  useEffect(()=>{
    sortProduct();
    setCurrentPage(1); // Reset to page 1 when sort order changes
  },[sortType])

  // Calculate pagination
  const totalPages = Math.ceil(filterProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleProducts = filterProducts.slice(startIndex, endIndex);

  return (
    <div className='min-h-screen bg-white'>
      {/* Header Section */}
      <div className='pt-32 pb-12 bg-gradient-to-b from-rose-50/30 to-white px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6'>
          <div className='flex-1'>
            <h1 className='text-4xl md:text-5xl font-light text-neutral-900 mb-4'>
              All <span className='text-rose-600'>Collections</span>
            </h1>
            <p className='text-lg text-neutral-600'>
              Discover our complete range of premium lighting solutions
            </p>
          </div>
          
          {/* Search Bar */}
          <div className='w-full lg:w-[550px]'>
            <div className='flex items-center border-2 border-neutral-300 rounded-xl px-5 py-3 bg-white hover:border-rose-300 transition-all duration-300 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 shadow-sm'>
              <i className='ri-search-line text-neutral-400 text-lg mr-3'></i>
              <input 
                ref={searchInputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.length > 0) {
                    setShowSearch(true);
                  }
                }}
                type="text" 
                placeholder='Search products here...'
                className='flex-1 outline-none bg-transparent text-sm text-neutral-900 placeholder-neutral-500'
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                  }}
                  className='text-neutral-400 hover:text-neutral-600 transition-colors'
                >
                  <i className='ri-close-line text-lg'></i>
                </button>
              )}
            </div>
          </div>
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
            {categories.map((cat) => (
              <label key={cat} className='flex items-center gap-3 cursor-pointer group'>
                <div className='relative'>
                  <input type='checkbox' value={cat} checked={category.includes(cat)} onChange={toggleCategory} className='peer sr-only' />
                  <div className='w-5 h-5 border-2 border-neutral-300 rounded peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all flex items-center justify-center'>
                    <i className='ri-check-line text-white text-xs opacity-0 peer-checked:opacity-100'></i>
                  </div>
                </div>
                <span className='text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors'>{cat}</span>
              </label>
            ))}
          </div>
        </div>

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
                  className='w-full px-3 py-2 bg-neutral-50 border-2 border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all'
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
                  className='w-full px-3 py-2 bg-neutral-50 border-2 border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all'
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
            visibleProducts.map((item,index)=>{
              // For variant products use first variant's data
              const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null
              const displayImage = firstVariant?.images?.length > 0 ? firstVariant.images : item.image
              const displayPrice = firstVariant?.price || item.retailPrice || item.price
              const displayStock = firstVariant ? item.variants.reduce((total, v) => total + v.stock, 0) : item.stock

              return (
                <ProductItem
                  key={index}
                  name={item.name}
                  id={item._id}
                  slug={item.slug}
                  price={displayPrice}
                  wholesalePrice={firstVariant?.wholesalePrice || item.wholesalePrice}
                  minimumWholesaleQuantity={item.minimumWholesaleQuantity}
                  image={displayImage}
                  stock={displayStock}
                />
              )
            })
          }
        </div>
        
        {/* Pagination Controls */}
        {filterProducts.length > 0 && (
          <div className='mt-12 flex flex-col items-center gap-6'>
            {/* Items Per Page Selector */}
            <div className='flex items-center gap-3'>
              <label className='text-sm font-medium text-neutral-700'>Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className='px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer'
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>

            {/* Page Info */}
            <p className='text-sm text-neutral-600'>
              Page <span className='font-semibold text-neutral-900'>{currentPage}</span> of <span className='font-semibold text-neutral-900'>{totalPages}</span>
            </p>

            {/* Pagination Buttons */}
            <div className='flex items-center gap-2 flex-wrap justify-center'>
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              >
                <i className='ri-arrow-left-s-line mr-1'></i>Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first, last, current, and neighbors
                const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                const showDots = page === 2 && currentPage > 3;
                
                if (!isVisible && !showDots) return null;
                
                return (
                  <div key={page}>
                    {showDots && <span className='px-2 text-neutral-400'>...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-white border border-neutral-200 text-neutral-900 hover:border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className='px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              >
                Next<i className='ri-arrow-right-s-line ml-1'></i>
              </button>
            </div>
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
              onClick={() => { setCategory([]); setPriceRange([minPrice, maxPrice]); }}
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
