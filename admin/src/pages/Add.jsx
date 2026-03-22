import React, { useState } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({token}) => {

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)
  const [loading, setLoading] = useState(false);

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [retailPrice, setRetailPrice] = useState("");
   const [compareAtPrice, setCompareAtPrice] = useState("");
   const [useCases, setUseCases] = useState("");
   const [wholesalePrice, setWholesalePrice] = useState("");
   const [minimumWholesaleQuantity, setMinimumWholesaleQuantity] = useState("10");
   const [stock, setStock] = useState("");
   const [category, setCategory] = useState("LED String Lights");
   const [subCategory, setSubCategory] = useState("Pixel String Lights");
   const [bestseller, setBestseller] = useState(false);
   const [activeTab, setActiveTab] = useState("description");
   const [trackInventory, setTrackInventory] = useState(true);
   const [allowBackorders, setAllowBackorders] = useState(false);
   const [hasVariants, setHasVariants] = useState(false)
   const [variants, setVariants] = useState([])

   // Specifications state
   const [specifications, setSpecifications] = useState({
     wattage: "",
     productWattage: "",
     inputVoltage: "",
     outputVoltageDC: "",
     outputCurrentDC: "",
     powerSource: "",
     powerFactor: "",
     frequency: "",
     material: "",
     bodyMaterial: "",
     bodyType: "",
     shape: "",
     beamAngle: "",
     ipRating: "",
     protection: "",
     design: "",
     length: "",
     wireLength: "",
     numberOfBulbs: "",
     lightingColor: "",
     color: "",
     pattern: "",
     functionality: "",
     adjustableBrightness: "",
     controlMethod: "",
     brand: "",
     modelName: "",
     countryOfOrigin: "",
     warranty: "",
     usage: ""
   });

   // Specification field labels mapping
   const specificationLabels = {
     wattage: "Wattage",
     productWattage: "Product Wattage",
     inputVoltage: "Input Voltage",
     outputVoltageDC: "Output Voltage (DC)",
     outputCurrentDC: "Output Current (DC)",
     powerSource: "Power Source",
     powerFactor: "Power Factor",
     frequency: "Frequency",
     material: "Material",
     bodyMaterial: "Body Material",
     bodyType: "Body Type",
     shape: "Shape",
     beamAngle: "Beam Angle",
     ipRating: "IP Rating",
     protection: "Protection",
     design: "Design",
     length: "Length",
     wireLength: "Wire Length",
     numberOfBulbs: "Number of Bulbs/LEDs",
     lightingColor: "Lighting Color",
     color: "Color/Colour",
     pattern: "Pattern",
     functionality: "Functionality",
     adjustableBrightness: "Adjustable Brightness",
     controlMethod: "Control Method/Type",
     brand: "Brand",
     modelName: "Model Name/Number",
     countryOfOrigin: "Country of Origin",
     warranty: "Warranty",
     usage: "Usage/Application"
   };

   // Category and Subcategory Mapping
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

   const handleCategoryChange = (e) => {
     const selectedCategory = e.target.value;
     setCategory(selectedCategory);
     setSubCategory(categoryOptions[selectedCategory][0]);
   }

   const handleSpecificationChange = (e) => {
     const { name, value } = e.target;
     setSpecifications({
       ...specifications,
       [name]: value
     });
   }

   const addVariant = () => {
     setVariants([...variants, {
       color: '',
       colorCode: '#ef4444',
       price: '',
       compareAtPrice: '',
       wholesalePrice: '',
       stock: '',
       images: [null, null, null, null],
       previews: [null, null, null, null]
     }])
   }

   const removeVariant = (index) => {
     setVariants(variants.filter((_, i) => i !== index))
   }

   const updateVariant = (index, field, value) => {
     const updated = [...variants]
     updated[index][field] = value
     setVariants(updated)
   }

   const handleVariantImage = (vIndex, imgIndex, file) => {
     if (!file) return
     const updated = [...variants]
     updated[vIndex].images[imgIndex] = file
     updated[vIndex].previews[imgIndex] = URL.createObjectURL(file)
     setVariants(updated)
   }

   const onSubmitHandler = async (status = 'active') => {
    // Validate retail price (only for non-variant products)
    if (!hasVariants && (!retailPrice || retailPrice <= 0)) {
      toast.error('Retail price must be greater than 0');
      return;
    }

    // Validate wholesale price if provided (only for non-variant products)
    if (!hasVariants && wholesalePrice && Number(wholesalePrice) >= Number(retailPrice)) {
      toast.error('Wholesale price must be less than retail price');
      return;
    }

    // Validate stock (only for non-variant products)
    if (!hasVariants && (stock === '' || stock < 0)) {
      toast.error('Stock must be 0 or greater');
      return;
    }

    // Validate at least one image
    if (!hasVariants && !image1) {
      toast.error('Please upload at least one product image')
      return
    }
    if (hasVariants && variants.length === 0) {
      toast.error('Please add at least one color variant')
      return
    }
    if (hasVariants) {
      for (let i = 0; i < variants.length; i++) {
        if (!variants[i].color) {
          toast.error(`Please enter color name for Variant ${i + 1}`)
          return
        }
        if (!variants[i].stock && variants[i].stock !== 0) {
          toast.error(`Please enter stock for Variant ${i + 1}`)
          return
        }
        if (variants[i].images.every(img => img === null)) {
          toast.error(`Please upload at least one image for Variant ${i + 1}`)
          return
        }
      }
    }

    setLoading(true);

    try {
      
      const formData = new FormData()

      formData.append("name",name)
      formData.append("description",description)
      if (useCases) formData.append("useCases",useCases)
      if (minimumWholesaleQuantity) formData.append("minimumWholesaleQuantity",minimumWholesaleQuantity)

      // Handle pricing and stock based on variant mode
      if (!hasVariants) {
        formData.append("retailPrice",retailPrice)
        formData.append("stock",stock)
        if (compareAtPrice) formData.append("compareAtPrice",compareAtPrice)
        if (wholesalePrice) formData.append("wholesalePrice",wholesalePrice)
      } else {
        formData.append("retailPrice", variants[0]?.price || 0)
        formData.append("stock", 0)
      }
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("status",status)

      // Add specifications
      Object.keys(specifications).forEach(key => {
        formData.append(key, specifications[key]);
      });

      formData.append('hasVariants', hasVariants)

      if (hasVariants) {
        // Append variant data as JSON
        const variantsData = variants.map(v => ({
          color: v.color,
          colorCode: v.colorCode,
          price: v.price || '',
          compareAtPrice: v.compareAtPrice || '',
          wholesalePrice: v.wholesalePrice || '',
          stock: v.stock || 0
        }))
        formData.append('variants', JSON.stringify(variantsData))

        // Append variant images (only if images exist)
        variants.forEach((variant, vIndex) => {
          variant.images.forEach((img, imgIndex) => {
            if (img && img instanceof File) {
              formData.append(`variantImage_${vIndex}_${imgIndex}`, img)
            }
          })
        })
      } else {
        // Append base images
        image1 && formData.append("image1",image1)
        image2 && formData.append("image2",image2)
        image3 && formData.append("image3",image3)
        image4 && formData.append("image4",image4)
      }

      const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setRetailPrice('')
        setCompareAtPrice('')
        setUseCases('')
        setWholesalePrice('')
        setMinimumWholesaleQuantity('10')
        setStock('')
        setActiveTab("description")
        setSpecifications({
          wattage: "",
          productWattage: "",
          inputVoltage: "",
          outputVoltageDC: "",
          outputCurrentDC: "",
          powerSource: "",
          powerFactor: "",
          frequency: "",
          material: "",
          bodyMaterial: "",
          bodyType: "",
          shape: "",
          beamAngle: "",
          ipRating: "",
          protection: "",
          design: "",
          length: "",
          wireLength: "",
          numberOfBulbs: "",
          lightingColor: "",
          color: "",
          pattern: "",
          functionality: "",
          adjustableBrightness: "",
          controlMethod: "",
          brand: "",
          modelName: "",
          countryOfOrigin: "",
          warranty: "",
          usage: ""
        })
        setHasVariants(false)
        setVariants([])
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
   }

  return (
    <div className='w-full min-h-screen bg-gray-100 p-8'>
      {/* Section Title */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold mb-2 text-gray-900'>Create Product Listing</h2>
        <p className='text-gray-600'>Add detailed information about your new lighting fixture.</p>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* LEFT COLUMN */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Images / Variants Toggle */}
          <div className='bg-white rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Product Images & Variants</h3>
                <p className='text-sm text-gray-500 mt-1'>Choose if this product comes in multiple colors</p>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium text-gray-700'>Color Variants</span>
                <div
                  onClick={() => { setHasVariants(!hasVariants); setVariants([]) }}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 flex items-center px-1 ${hasVariants ? 'bg-red-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${hasVariants ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </div>

            {!hasVariants ? (
              // Normal image upload
              <div>
                <div className='flex gap-4 mb-3'>
                  {[
                    { id: 'image1', state: image1, setter: setImage1 },
                    { id: 'image2', state: image2, setter: setImage2 },
                    { id: 'image3', state: image3, setter: setImage3 },
                    { id: 'image4', state: image4, setter: setImage4 }
                  ].map(({ id, state, setter }) => (
                    <label key={id} htmlFor={id} className='cursor-pointer'>
                      <img
                        className='w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 hover:border-red-400 transition-colors'
                        src={!state ? assets.upload_area : URL.createObjectURL(state)}
                        alt='Product'
                      />
                      <input onChange={(e) => setter(e.target.files[0])} type='file' id={id} hidden />
                    </label>
                  ))}
                </div>
                <p className='text-xs text-gray-500'>Upload up to 4 product images. First image will be the main display image.</p>
              </div>
            ) : (
              // Variant mode
              <div className='space-y-4'>
                {variants.map((variant, vIndex) => (
                  <div key={vIndex} className='border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-200 transition-colors'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div
                          className='w-8 h-8 rounded-full border-2 border-white shadow-md flex-shrink-0'
                          style={{ backgroundColor: variant.colorCode }}
                        ></div>
                        <span className='font-medium text-gray-900'>
                          {variant.color || `Variant ${vIndex + 1}`}
                        </span>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeVariant(vIndex)}
                        className='text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-all'
                      >
                        Remove
                      </button>
                    </div>

                    <div className='grid grid-cols-2 gap-3 mb-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Color Name *</label>
                        <input
                          type='text'
                          placeholder='e.g. Red, Blue, Warm White'
                          value={variant.color}
                          onChange={(e) => updateVariant(vIndex, 'color', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Color Swatch</label>
                        <div className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={variant.colorCode}
                            onChange={(e) => updateVariant(vIndex, 'colorCode', e.target.value)}
                            className='w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5'
                          />
                          <span className='text-xs text-gray-400 font-mono'>{variant.colorCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-4 gap-3 mb-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Price ₹ *</label>
                        <input
                          type='number'
                          placeholder='0'
                          value={variant.price}
                          onChange={(e) => updateVariant(vIndex, 'price', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Compare at ₹</label>
                        <input
                          type='number'
                          placeholder='Original price'
                          value={variant.compareAtPrice}
                          onChange={(e) => updateVariant(vIndex, 'compareAtPrice', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Wholesale ₹</label>
                        <input
                          type='number'
                          placeholder='Optional'
                          value={variant.wholesalePrice}
                          onChange={(e) => updateVariant(vIndex, 'wholesalePrice', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                        />
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-600 mb-1'>Stock *</label>
                        <input
                          type='number'
                          placeholder='0'
                          value={variant.stock}
                          onChange={(e) => updateVariant(vIndex, 'stock', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-2'>Images (up to 4) *</label>
                      <div className='flex gap-3'>
                        {[0, 1, 2, 3].map((imgIndex) => (
                          <label key={imgIndex} className='cursor-pointer'>
                            <div className='w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-400 transition-colors overflow-hidden flex items-center justify-center bg-gray-50'>
                              {variant.previews[imgIndex] ? (
                                <img src={variant.previews[imgIndex]} className='w-full h-full object-cover' alt='' />
                              ) : (
                                <span className='text-2xl text-gray-300'>+</span>
                              )}
                            </div>
                            <input
                              type='file'
                              accept='image/*'
                              hidden
                              onChange={(e) => handleVariantImage(vIndex, imgIndex, e.target.files[0])}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type='button'
                  onClick={addVariant}
                  className='w-full py-3 border-2 border-dashed border-red-200 text-red-500 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all text-sm font-medium flex items-center justify-center gap-2'
                >
                  <span className='text-lg'>+</span> Add Color Variant
                </button>
              </div>
            )}
          </div>

          {/* Product Information Box */}
          <div className='bg-white rounded-2xl p-6'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900'>Product Information</h3>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Product Name</label>
              <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500' type="text" placeholder='e.g. Modern Brass Pendant Light' required/>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-900 mb-2'>Category</label>
                <select onChange={(e) => { setCategory(e.target.value); setSubCategory(categoryOptions[e.target.value][0]); }} value={category} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'>
                  {Object.keys(categoryOptions).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-900 mb-2'>Sub Category</label>
                <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'>
                  {categoryOptions[category].map((subCat) => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabs for Description/Use Cases */}
            <div className='mb-4'>
              <div className='flex gap-0 border-b mb-4'>
                <button
                  type='button'
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'description' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
                >
                  Product Description
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTab('use-cases')}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'use-cases' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
                >
                  Use Cases / Application
                </button>
              </div>

              {activeTab === 'description' && (
                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>Product Description</label>
                  <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full px-4 py-3 border border-gray-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-red-500' placeholder='Describe the product material, design features, and installation requirements...' required/>
                </div>
              )}

              {activeTab === 'use-cases' && (
                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>Use Cases / Application</label>
                  <textarea onChange={(e)=>setUseCases(e.target.value)} value={useCases} className='w-full px-4 py-3 border border-gray-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-red-500' placeholder='e.g., Ideal for modern living rooms, hotel lobbies, or high-ceiling dining areas...' />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className='lg:col-span-1 space-y-8'>
          {!hasVariants && (
            <>
          {/* Pricing Details Box */}
          <div className='bg-white rounded-2xl p-6'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900'>Pricing Details</h3>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Retail Price</label>
              <div className='flex items-center'>
                <span className='text-lg font-semibold text-gray-700 mr-2'>₹</span>
                <input 
                  onChange={(e) => setRetailPrice(e.target.value)} 
                  value={retailPrice} 
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500' 
                  type="number" 
                  placeholder='0.00' 
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Compare at Price</label>
              <div className='flex items-center'>
                <span className='text-lg font-semibold text-gray-700 mr-2'>₹</span>
                <input 
                  onChange={(e) => setCompareAtPrice(e.target.value)} 
                  value={compareAtPrice} 
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500' 
                  type="number" 
                  placeholder='0.00' 
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Wholesale Price</label>
              <div className='flex items-center'>
                <span className='text-lg font-semibold text-gray-700 mr-2'>₹</span>
                <input 
                  onChange={(e) => setWholesalePrice(e.target.value)} 
                  value={wholesalePrice} 
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500' 
                  type="number" 
                  placeholder='0.00' 
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Min Wholesale Qty</label>
              <input 
                onChange={(e) => setMinimumWholesaleQuantity(e.target.value)} 
                value={minimumWholesaleQuantity} 
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500' 
                type="number" 
                placeholder='10' 
                min="1"
                step="1"
              />
            </div>
          </div>

          {/* Inventory Box */}
          <div className='bg-white rounded-2xl p-6'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900'>Inventory</h3>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Stock Availability</label>
              <input 
                onChange={(e) => setStock(e.target.value)} 
                value={stock} 
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500' 
                type="number" 
                placeholder='0' 
                min="0"
                step="1"
                required
              />
            </div>

            <div className='space-y-3'>
              <label className='flex items-center cursor-pointer'>
                <input onChange={() => setTrackInventory(prev => !prev)} checked={trackInventory} type="checkbox" className='w-4 h-4 rounded accent-red-600' />
                <span className='ml-3 text-sm font-medium text-gray-900'>Track inventory for this product</span>
              </label>

              <label className='flex items-center cursor-pointer'>
                <input onChange={() => setAllowBackorders(prev => !prev)} checked={allowBackorders} type="checkbox" className='w-4 h-4 rounded accent-red-600' />
                <span className='ml-3 text-sm font-medium text-gray-900'>Allow backorders when out of stock</span>
              </label>

              <label className='flex items-center cursor-pointer'>
                <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" className='w-4 h-4 rounded accent-red-600' />
                <span className='ml-3 text-sm font-medium text-gray-900'>Add to bestseller</span>
              </label>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Product Specifications Box - Full Width */}
      <div className='bg-white rounded-2xl p-6 mt-8'>
        <h3 className='text-lg font-semibold mb-2 text-gray-900'>Product Specifications</h3>
        <p className='text-sm text-gray-500 mb-6'>Leave blank if not applicable</p>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Object.keys(specifications).map((key) => (
            <div key={key}>
              <label className='block text-sm font-medium text-gray-900 mb-2'>{specificationLabels[key]}</label>
              <input 
                type="text" 
                name={key}
                value={specifications[key]} 
                onChange={handleSpecificationChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500'
                placeholder={`Enter ${specificationLabels[key]}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className='flex gap-3 mt-8 mx-auto max-w-6xl'>
        <button 
          onClick={() => onSubmitHandler('active')}
          disabled={loading}
          className='flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2'
        >
          {loading ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Saving...
            </>
          ) : '✓ Save and Publish'}
        </button>
        <button 
          onClick={() => onSubmitHandler('draft')}
          disabled={loading}
          className='flex-1 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-semibold'
        >
          Save as Draft
        </button>
      </div>
    </div>
  )
}

export default Add