import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import ConfirmModal from '../components/ConfirmModal'

const Edit = ({ token }) => {

  const { productId } = useParams()
  const navigate = useNavigate()

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)
  const [existingImages, setExistingImages] = useState([])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [retailPrice, setRetailPrice] = useState("")
  const [wholesalePrice, setWholesalePrice] = useState("")
  const [minimumWholesaleQuantity, setMinimumWholesaleQuantity] = useState("10")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("LED String Lights")
  const [subCategory, setSubCategory] = useState("Pixel String Lights")
  const [bestseller, setBestseller] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false)

  // Warn on browser tab close/refresh when dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

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
  })

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
  }

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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.post(backendUrl + '/api/product/single', { productId }, { headers: { token } })
        if (response.data.success) {
          const product = response.data.product
          setName(product.name)
          setDescription(product.description)
          setRetailPrice(product.retailPrice || product.price || "")
          setWholesalePrice(product.wholesalePrice || "")
          setMinimumWholesaleQuantity(product.minimumWholesaleQuantity || "10")
          setStock(product.stock || 0)
          setCategory(product.category)
          setSubCategory(product.subCategory)
          setBestseller(product.bestseller || false)
          setExistingImages(product.image || [])

          // Load specifications
          if (product.specifications) {
            const newSpec = { ...specifications }
            Object.keys(product.specifications).forEach(key => {
              if (key in newSpec) {
                newSpec[key] = product.specifications[key]
              }
            })
            setSpecifications(newSpec)
          }
        } else {
          toast.error('Failed to load product')
          navigate('/list')
        }
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error(error.message)
        navigate('/list')
      } finally {
        setLoading(false)
        setIsDirty(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value
    setCategory(selectedCategory)
    setSubCategory(categoryOptions[selectedCategory][0])
    setIsDirty(true)
  }

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target
    setSpecifications({
      ...specifications,
      [name]: value
    })
    setIsDirty(true)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    // Validate retail price
    if (!retailPrice || Number(retailPrice) <= 0) {
      toast.error('Retail price must be greater than 0');
      return;
    }
    
    // Validate wholesale price (required)
    if (!wholesalePrice || Number(wholesalePrice) <= 0) {
      toast.error('Wholesale price is required and must be greater than 0');
      return;
    }
    
    // Validate wholesale price is less than retail
    if (Number(wholesalePrice) >= Number(retailPrice)) {
      toast.error('Wholesale price must be less than retail price');
      return;
    }
    
    // Validate stock
    if (stock === '' || Number(stock) < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowUpdateConfirm(true)
  }

  const executeUpdate = async () => {
    setShowUpdateConfirm(false)
    setSubmitting(true);

    try {
      const formData = new FormData()

      formData.append("productId", productId)
      formData.append("name", name)
      formData.append("description", description)
      formData.append("retailPrice", retailPrice)
      formData.append("wholesalePrice", wholesalePrice)
      formData.append("minimumWholesaleQuantity", minimumWholesaleQuantity)
      formData.append("stock", stock)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)

      // Add specifications
      Object.keys(specifications).forEach(key => {
        formData.append(key, specifications[key])
      })

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const response = await axios.post(backendUrl + "/api/product/update", formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setIsDirty(false)
        navigate('/list')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error.message)
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className='text-center py-10'>Loading product...</div>
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <h1 className='text-2xl font-semibold mb-4'>Edit Product</h1>

      <div>
        <p className='mb-2'>Upload Images (Leave empty to keep existing)</p>

        <div className='flex gap-2'>
          <label htmlFor="image1">
            <img className='w-20' src={!image1 ? (existingImages[0] || assets.upload_area) : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e) => { setImage1(e.target.files[0]); setIsDirty(true) }} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img className='w-20' src={!image2 ? (existingImages[1] || assets.upload_area) : URL.createObjectURL(image2)} alt="" />
          <input onChange={(e) => { setImage2(e.target.files[0]); setIsDirty(true) }} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? (existingImages[2] || assets.upload_area) : URL.createObjectURL(image3)} alt="" />
          <input onChange={(e) => { setImage3(e.target.files[0]); setIsDirty(true) }} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? (existingImages[3] || assets.upload_area) : URL.createObjectURL(image4)} alt="" />
          <input onChange={(e) => { setImage4(e.target.files[0]); setIsDirty(true) }} type="file" id="image4" hidden />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input onChange={(e) => { setName(e.target.value); setIsDirty(true) }} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea onChange={(e) => { setDescription(e.target.value); setIsDirty(true) }} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

        <div>
          <p className='mb-2'>Product category</p>
          <select onChange={handleCategoryChange} value={category} className='w-full px-3 py-2'>
            {Object.keys(categoryOptions).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub category</p>
          <select onChange={(e) => { setSubCategory(e.target.value); setIsDirty(true) }} value={subCategory} className='w-full px-3 py-2'>
            {categoryOptions[category].map((subCat) => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Pricing Section */}
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div className='w-full sm:w-[150px]'>
          <p className='mb-2'>Retail Price *</p>
          <input 
            onChange={(e) => { setRetailPrice(e.target.value); setIsDirty(true) }} 
            value={retailPrice} 
            className='w-full px-3 py-2' 
            type="number" 
            placeholder='25' 
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className='w-full sm:w-[150px]'>
          <p className='mb-2'>Wholesale Price *</p>
          <input 
            onChange={(e) => { setWholesalePrice(e.target.value); setIsDirty(true) }} 
            value={wholesalePrice} 
            className='w-full px-3 py-2' 
            type="number" 
            placeholder='20' 
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className='w-full sm:w-[150px]'>
          <p className='mb-2'>Min Wholesale Qty</p>
          <input 
            onChange={(e) => { setMinimumWholesaleQuantity(e.target.value); setIsDirty(true) }} 
            value={minimumWholesaleQuantity} 
            className='w-full px-3 py-2' 
            type="number" 
            placeholder='10' 
            min="1"
            step="1"
          />
        </div>

        <div className='w-full sm:w-[120px]'>
          <p className='mb-2'>Stock *</p>
          <input 
            onChange={(e) => { setStock(e.target.value); setIsDirty(true) }} 
            value={stock} 
            className='w-full px-3 py-2' 
            type="number" 
            min="0" 
            step="1" 
            placeholder='0' 
            required 
          />
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={() => { setBestseller(prev => !prev); setIsDirty(true) }} checked={bestseller} type="checkbox" id='bestseller' />
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
      </div>

      {/* ----------- Product Specifications Section ----------- */}
      <div className='w-full mt-8 border-t pt-8'>
        <h2 className='text-lg font-semibold mb-6'>Product Specifications (Leave blank if not applicable)</h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-[900px]'>
          {Object.keys(specifications).map((key) => (
            <div key={key}>
              <p className='mb-2 text-sm'>{specificationLabels[key]}</p>
              <input
                type="text"
                name={key}
                value={specifications[key]}
                onChange={handleSpecificationChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
                placeholder={`Enter ${specificationLabels[key]}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className='flex gap-2 mt-4'>
        <button 
          type="submit" 
          disabled={submitting}
          className='w-32 py-3 bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {submitting ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Updating...
            </>
          ) : 'UPDATE'}
        </button>
        <button 
          type="button" 
          onClick={() => {
            if (isDirty) {
              setShowUnsavedConfirm(true)
            } else {
              navigate('/list')
            }
          }}
          disabled={submitting}
          className='w-28 py-3 bg-gray-400 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
        >
          CANCEL
        </button>
      </div>

      {/* Confirm save modal */}
      <ConfirmModal
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={executeUpdate}
        title='Save Changes'
        message='Are you sure you want to update this product?'
        confirmLabel='Yes, Save'
        confirmClassName='bg-black hover:bg-gray-800 text-white'
      />

      {/* Unsaved changes warning */}
      <ConfirmModal
        isOpen={showUnsavedConfirm}
        onClose={() => setShowUnsavedConfirm(false)}
        onConfirm={() => { setIsDirty(false); navigate('/list') }}
        title='Unsaved Changes'
        message='You have unsaved changes. Leave without saving?'
        confirmLabel='Leave Without Saving'
        confirmClassName='bg-red-600 hover:bg-red-700 text-white'
      />

    </form>
  )
}

export default Edit
