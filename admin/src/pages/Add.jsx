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

   const onSubmitHandler = async (status = 'active') => {
    // Validate retail price
    if (!retailPrice || retailPrice <= 0) {
      toast.error('Retail price must be greater than 0');
      return;
    }

    // Validate wholesale price if provided
    if (wholesalePrice && Number(wholesalePrice) >= Number(retailPrice)) {
      toast.error('Wholesale price must be less than retail price');
      return;
    }

    // Validate stock
    if (stock === '' || stock < 0) {
      toast.error('Stock must be 0 or greater');
      return;
    }

    // Validate at least one image
    if (!image1) {
      toast.error('Please upload at least one product image');
      return;
    }

    setLoading(true);

    try {
      
      const formData = new FormData()

      formData.append("name",name)
      formData.append("description",description)
      formData.append("retailPrice",retailPrice)
      if (compareAtPrice) formData.append("compareAtPrice",compareAtPrice)
      if (useCases) formData.append("useCases",useCases)
      if (wholesalePrice) formData.append("wholesalePrice",wholesalePrice)
      if (minimumWholesaleQuantity) formData.append("minimumWholesaleQuantity",minimumWholesaleQuantity)
      formData.append("stock",stock)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("status",status)

      // Add specifications
      Object.keys(specifications).forEach(key => {
        formData.append(key, specifications[key]);
      });

      image1 && formData.append("image1",image1)
      image2 && formData.append("image2",image2)
      image3 && formData.append("image3",image3)
      image4 && formData.append("image4",image4)

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
          {/* Product Images Box */}
          <div className='bg-white rounded-2xl p-6'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900'>Product Images</h3>
            <div className='flex gap-4 mb-4'>
              <label htmlFor="image1" className='cursor-pointer'>
                <img className='w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 hover:border-gray-400' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="Product 1" />
                <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
              </label>
              <label htmlFor="image2" className='cursor-pointer'>
                <img className='w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 hover:border-gray-400' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="Product 2" />
                <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
              </label>
              <label htmlFor="image3" className='cursor-pointer'>
                <img className='w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 hover:border-gray-400' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="Product 3" />
                <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
              </label>
              <label htmlFor="image4" className='cursor-pointer'>
                <img className='w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 hover:border-gray-400' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="Product 4" />
                <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
              </label>
            </div>
            <p className='text-xs text-gray-500'>Tip: Use high-resolution images (min 1200×1200px) for better customer conversion.</p>
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