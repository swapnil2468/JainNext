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
  const [compareAtPrice, setCompareAtPrice] = useState("")
  const [useCases, setUseCases] = useState("")
  const [wholesalePrice, setWholesalePrice] = useState("")
  const [minimumWholesaleQuantity, setMinimumWholesaleQuantity] = useState("10")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("String Lights")
  const [bestseller, setBestseller] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorders, setAllowBackorders] = useState(false);
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState([])
  const [variantTypes, setVariantTypes] = useState([])
  
  // Available variant types
  const availableVariantTypes = [
    { id: 'color', label: 'Color' },
    { id: 'length', label: 'Length' },
    { id: 'size', label: 'Size' },
    { id: 'material', label: 'Material' },
    { id: 'pattern', label: 'Pattern' },
    { id: 'wattage', label: 'Wattage' }
  ]

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

  const addVariant = () => {
    if (variantTypes.length === 0) {
      toast.error('Please select at least one variant type')
      return
    }
    
    if (isColorLengthMode) {
      // Color + Length mode: create color variant with empty lengths array
      const newVariant = {
        color: '',
        colorCode: '#ef4444',
        images: [null, null, null, null],
        previews: [null, null, null, null],
        lengths: []
      }
      setVariants([...variants, newVariant])
    } else {
      // Other modes: flat structure
      const newVariant = {
        price: '',
        compareAtPrice: '',
        wholesalePrice: '',
        stock: '',
        images: [null, null, null, null],
        previews: [null, null, null, null]
      }
      
      variantTypes.forEach(type => {
        newVariant[type] = ''
      })
      
      if (variantTypes.includes('color')) {
        newVariant.colorCode = '#ef4444'
      } else {
        newVariant.colorCode = '#000000'
      }
      
      setVariants([...variants, newVariant])
    }
    setIsDirty(true)
  }

  // Check if using color+length nested structure
  const isColorLengthMode = variantTypes.includes('color') && variantTypes.includes('length')

  const addLength = (colorIndex) => {
    const updated = [...variants]
    updated[colorIndex].lengths.push({
      length: '',
      price: '',
      compareAtPrice: '',
      wholesalePrice: '',
      stock: ''
    })
    setVariants(updated)
    setIsDirty(true)
  }

  const removeLength = (colorIndex, lengthIndex) => {
    const updated = [...variants]
    updated[colorIndex].lengths.splice(lengthIndex, 1)
    setVariants(updated)
    setIsDirty(true)
  }

  const updateLength = (colorIndex, lengthIndex, field, value) => {
    const updated = [...variants]
    updated[colorIndex].lengths[lengthIndex][field] = value
    setVariants(updated)
    setIsDirty(true)
  }

  const toggleVariantType = (typeId) => {
    const newTypes = variantTypes.includes(typeId) 
      ? variantTypes.filter(t => t !== typeId)
      : [...variantTypes, typeId]
    setVariantTypes(newTypes)
    setIsDirty(true)
  }

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
    setIsDirty(true)
  }

  const updateVariant = (index, field, value) => {
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
    setIsDirty(true)
  }

  const handleVariantImage = (vIndex, imgIndex, file) => {
    if (!file) return
    const updated = [...variants]
    updated[vIndex].images[imgIndex] = file
    updated[vIndex].previews[imgIndex] = URL.createObjectURL(file)
    setVariants(updated)
    setIsDirty(true)
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
          setCompareAtPrice(product.compareAtPrice || "")
          setUseCases(product.useCases || "")
          setWholesalePrice(product.wholesalePrice || "")
          setMinimumWholesaleQuantity(product.minimumWholesaleQuantity || "10")
          setStock(product.stock || 0)
          setCategory(product.category)
          setBestseller(product.bestseller || false)
          
          // Load variants if they exist
          // Check both hasVariants flag AND if variants array exists with items
          const productHasVariants = product.hasVariants || (product.variants && product.variants.length > 0)
          
          if (productHasVariants) {
            setHasVariants(true)
            
            // Load variant types from product
            const loadedVariantTypes = product.variantTypes || []
            setVariantTypes(loadedVariantTypes)
            
            // Check if this is color+length mode
            const isColorLengthMode = loadedVariantTypes.includes('color') && loadedVariantTypes.includes('length')
            
            let variantsWithPreviews
            
            if (isColorLengthMode) {
              // Reconstruct nested color+length structure from flattened variants
              const colorMap = new Map()
              
              product.variants.forEach(v => {
                const color = v.color || v.attributes?.color
                const length = v.attributes?.length
                
                // Both color and length must exist
                if (!color || !length) {
                  // Skipping variant - missing color or length
                  return
                }
                
                // Create color entry if it doesn't exist (use FIRST variant's images for that color)
                if (!colorMap.has(color)) {
                  colorMap.set(color, {
                    color,
                    colorCode: v.colorCode || '#000000',
                    images: [], // Will upload new images
                    previews: v.images && v.images.length > 0 ? [...v.images] : [], // Copy existing images from first variant
                    lengths: []
                  })
                }
                
                const colorVariant = colorMap.get(color)
                
                // Add length to this color variant
                colorVariant.lengths.push({
                  length,
                  price: v.price || '',
                  compareAtPrice: v.compareAtPrice || '',
                  wholesalePrice: v.wholesalePrice || '',
                  stock: v.stock || 0
                })
              })
              
              variantsWithPreviews = Array.from(colorMap.values())
            } else {
              // Flat structure - keep as is
              variantsWithPreviews = product.variants.map(v => {
                const variantData = {
                  price: v.price || '',
                  compareAtPrice: v.compareAtPrice || '',
                  wholesalePrice: v.wholesalePrice || '',
                  stock: v.stock || 0,
                  images: [],
                  previews: v.images || [],
                  colorCode: v.colorCode || '#000000'
                }
                
                // Add all variant type attributes
                if (v.attributes) {
                  loadedVariantTypes.forEach(type => {
                    variantData[type] = v.attributes[type] || ''
                  })
                }
                
                // Add legacy color field for backward compatibility
                if (v.color) {
                  variantData.color = v.color
                }
                
                return variantData
              })
            }
            setVariants(variantsWithPreviews)
            setExistingImages([])
          } else {
            setHasVariants(false)
            setVariants([])
            setVariantTypes([])
            setExistingImages(product.image || [])
          }

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
        toast.error(error.message)
        navigate('/list')
      } finally {
        setLoading(false)
        setIsDirty(false)
      }
    }

    fetchProduct()
  }, [productId, token])



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
    
    // Only validate retail price for non-variant products
    if (!hasVariants) {
      if (!retailPrice || Number(retailPrice) <= 0) {
        toast.error('Retail price must be greater than 0');
        return;
      }
      
      // Validate wholesale price (optional, but if provided must be less than retail)
      if (wholesalePrice && Number(wholesalePrice) >= Number(retailPrice)) {
        toast.error('Wholesale price must be less than retail price');
        return;
      }
      
      // Validate stock
      if (stock === '' || Number(stock) < 0) {
        toast.error('Stock cannot be negative');
        return;
      }
    }

    // Show confirmation modal instead of submitting directly
    setShowUpdateConfirm(true)
  }

  const executeUpdate = async () => {
    setShowUpdateConfirm(false)
    setSubmitting(true);

    // Validate retail price (only for non-variant products)
    if (!hasVariants && (!retailPrice || Number(retailPrice) <= 0)) {
      toast.error('Retail price must be greater than 0');
      setSubmitting(false);
      return;
    }

    // Validate wholesale price (optional, but if provided must be less than retail)
    if (!hasVariants && wholesalePrice && Number(wholesalePrice) >= Number(retailPrice)) {
      toast.error('Wholesale price must be less than retail price');
      setSubmitting(false);
      return;
    }

    // Validate stock
    if (!hasVariants && (stock === '' || Number(stock) < 0)) {
      toast.error('Stock cannot be negative');
      setSubmitting(false);
      return;
    }

    // Validate variants
    if (hasVariants && variants.length === 0) {
      toast.error(`Please add at least one variant for ${variantTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}`);
      setSubmitting(false);
      return;
    }
    
    const isColorLengthMode = variantTypes.includes('color') && variantTypes.includes('length')
    
    if (hasVariants) {
      if (isColorLengthMode) {
        // Validation for color+length mode
        for (let i = 0; i < variants.length; i++) {
          // Check color
          if (!variants[i].color || variants[i].color.trim() === '') {
            toast.error(`Please enter color for Variant ${i + 1}`)
            setSubmitting(false)
            return
          }
          // Check at least one length
          if (variants[i].lengths.length === 0) {
            toast.error(`Please add at least one length for ${variants[i].color} (Variant ${i + 1})`)
            setSubmitting(false)
            return
          }
          // Check all lengths
          for (let j = 0; j < variants[i].lengths.length; j++) {
            if (!variants[i].lengths[j].length || variants[i].lengths[j].length.trim() === '') {
              toast.error(`Please enter length for ${variants[i].color} - Length ${j + 1}`)
              setSubmitting(false)
              return
            }
            if (!variants[i].lengths[j].price && variants[i].lengths[j].price !== 0) {
              toast.error(`Please enter price for ${variants[i].color} - ${variants[i].lengths[j].length}`)
              setSubmitting(false)
              return
            }
            if (!variants[i].lengths[j].stock && variants[i].lengths[j].stock !== 0) {
              toast.error(`Please enter stock for ${variants[i].color} - ${variants[i].lengths[j].length}`)
              setSubmitting(false)
              return
            }
          }
        }
      } else {
        // Validation for flat mode
        for (let i = 0; i < variants.length; i++) {
          for (const type of variantTypes) {
            if (!variants[i][type] || variants[i][type].toString().trim() === '') {
              toast.error(`Please enter ${type} for Variant ${i + 1}`)
              setSubmitting(false)
              return
            }
          }
          if (!variants[i].stock && variants[i].stock !== 0) {
            toast.error(`Please enter stock for Variant ${i + 1}`)
            setSubmitting(false)
            return
          }
        }
      }
    }

    try {
      const formData = new FormData()

      formData.append("productId", productId)
      formData.append("name", name)
      formData.append("description", description)
      if (useCases) formData.append("useCases", useCases)
      if (minimumWholesaleQuantity) formData.append("minimumWholesaleQuantity", minimumWholesaleQuantity)

      // Handle pricing and stock based on variant mode
      if (!hasVariants) {
        formData.append("retailPrice", retailPrice)
        formData.append("stock", stock)
        if (compareAtPrice) formData.append("compareAtPrice", compareAtPrice)
        if (wholesalePrice) formData.append("wholesalePrice", wholesalePrice)
      } else {
        formData.append("retailPrice", variants[0]?.price || 0)
        formData.append("stock", 0)
      }

      formData.append("category", category)
      formData.append("bestseller", bestseller)

      // Add specifications
      Object.keys(specifications).forEach(key => {
        formData.append(key, specifications[key])
      })

      formData.append('hasVariants', hasVariants)

      if (hasVariants) {
        // Send variant types
        formData.append('variantTypes', JSON.stringify(variantTypes))
        
        // Build flat variants array for backend
        let variantsData = []
        
        if (isColorLengthMode) {
          // Flatten nested color+length structure
          variants.forEach(colorVariant => {
            colorVariant.lengths.forEach(lengthVariant => {
              variantsData.push({
                color: colorVariant.color,
                colorCode: colorVariant.colorCode || '#000000',
                length: lengthVariant.length,
                price: lengthVariant.price ? Number(lengthVariant.price) : undefined,
                compareAtPrice: lengthVariant.compareAtPrice ? Number(lengthVariant.compareAtPrice) : undefined,
                wholesalePrice: lengthVariant.wholesalePrice ? Number(lengthVariant.wholesalePrice) : undefined,
                stock: Number(lengthVariant.stock) || 0,
                images: colorVariant.previews || [] // Use existing images from color
              })
            })
          })
        } else {
          // Flat structure - keep as is
          variantsData = variants.map(v => {
            const variantData = {
              price: v.price ? Number(v.price) : '',
              compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : '',
              wholesalePrice: v.wholesalePrice ? Number(v.wholesalePrice) : '',
              stock: v.stock ? Number(v.stock) : 0,
              images: v.previews || [] // Include existing image URLs
            }
            
            // Add all variant type attributes
            variantTypes.forEach(type => {
              variantData[type] = v[type] || ''
            })
            
            // Add legacy color fields
            if (variantTypes.includes('color')) {
              variantData.color = v.color
              variantData.colorCode = v.colorCode || '#000000'
            } else {
              variantData.colorCode = '#000000'
            }
            
            return variantData
          })
        }
        formData.append('variants', JSON.stringify(variantsData))

        // Append variant images (only NEW File objects)
        if (isColorLengthMode) {
          // In color+length mode, each color's images need to be uploaded for EACH flattened variant
          let flatVariantIndex = 0
          variants.forEach((colorVariant) => {
            colorVariant.lengths.forEach((lengthVariant) => {
              colorVariant.images.forEach((img, imgIndex) => {
                // Only append if it's a File object (new upload)
                if (img && img instanceof File) {
                  formData.append(`variantImage_${flatVariantIndex}_${imgIndex}`, img)
                }
              })
              flatVariantIndex++
            })
          })
        } else {
          // In flat mode, images are per variant
          variants.forEach((variant, vIndex) => {
            variant.images.forEach((img, imgIndex) => {
              // Only append if it's a File object (new upload)
              if (img && img instanceof File) {
                formData.append(`variantImage_${vIndex}_${imgIndex}`, img)
              }
            })
          })
        }
      } else {
        // Append base images (only NEW File objects)
        image1 && image1 instanceof File && formData.append("image1", image1)
        image2 && image2 instanceof File && formData.append("image2", image2)
        image3 && image3 instanceof File && formData.append("image3", image3)
        image4 && image4 instanceof File && formData.append("image4", image4)
        
        // If no new images but we have existing images, send them via formData
        if (!image1 && !image2 && !image3 && !image4 && existingImages.length > 0) {
          formData.append("existingImages", JSON.stringify(existingImages))
        }
      }

      const response = await axios.post(backendUrl + "/api/product/update", formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setIsDirty(false)
        navigate('/list')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className='text-center py-10'>Loading product...</div>
  }

  return (
    <div className='w-full min-h-screen bg-gray-100 p-8'>
      {/* Section Title */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold mb-2 text-gray-900'>Edit Product Listing</h2>
        <p className='text-gray-600'>Update detailed information about your lighting fixture.</p>
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
                <p className='text-sm text-gray-500 mt-1'>Choose if this product comes in multiple variants</p>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium text-gray-700'>Use Variants</span>
                <div
                  onClick={() => { setHasVariants(!hasVariants); setVariantTypes([]); setVariants([]); setIsDirty(true) }}
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
                        src={!state ? (existingImages[id.slice(-1) - 1] || assets.upload_area) : URL.createObjectURL(state)}
                        alt='Product'
                      />
                      <input onChange={(e) => { setter(e.target.files[0]); setIsDirty(true) }} type='file' id={id} hidden />
                    </label>
                  ))}
                </div>
                <p className='text-xs text-gray-500'>Upload up to 4 product images. First image will be the main display image.</p>
              </div>
            ) : (
              // Variant mode
              <div className='space-y-4'>
                {/* Variant Type Selection */}
                <div className='bg-gray-50 rounded-xl p-4 mb-4'>
                  <label className='block text-sm font-medium text-gray-900 mb-3'>Select Variant Types</label>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {availableVariantTypes.map((type) => (
                      <label key={type.id} className='flex items-center cursor-pointer bg-white p-2 rounded-lg border border-gray-200 hover:border-red-400 transition-all'>
                        <input
                          type='checkbox'
                          checked={variantTypes.includes(type.id)}
                          onChange={() => { toggleVariantType(type.id); setIsDirty(true) }}
                          className='w-4 h-4 rounded accent-red-600'
                        />
                        <span className='ml-2 text-sm font-medium text-gray-900'>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {variantTypes.length > 0 && (
                  <>
                    {isColorLengthMode ? (
                      // Color + Length nested mode
                      <>
                        {variants.map((variant, vIndex) => (
                          <div key={vIndex} className='border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-200 transition-colors'>
                            <div className='flex items-center justify-between mb-4'>
                              <div>
                                <span className='font-medium text-gray-900'>
                                  Color {vIndex + 1}
                                </span>
                                {variant.color && (
                                  <div className='flex items-center gap-2 mt-1'>
                                    <div
                                      className='w-6 h-6 rounded-full border-2 border-white shadow-md flex-shrink-0'
                                      style={{ backgroundColor: variant.colorCode }}
                                    ></div>
                                    <span className='text-sm text-gray-600'>{variant.color}</span>
                                  </div>
                                )}
                              </div>
                              <button
                                type='button'
                                onClick={() => { removeVariant(vIndex); setIsDirty(true) }}
                                className='text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-all'
                              >
                                Remove Color
                              </button>
                            </div>

                            {/* Color Fields */}
                            <div className='grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200'>
                              <div>
                                <label className='block text-xs font-medium text-gray-600 mb-1'>Color Name *</label>
                                <input
                                  type='text'
                                  placeholder='e.g. Red, Blue, Warm White'
                                  value={variant.color || ''}
                                  onChange={(e) => { updateVariant(vIndex, 'color', e.target.value); setIsDirty(true) }}
                                  className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                />
                              </div>
                              <div>
                                <label className='block text-xs font-medium text-gray-600 mb-1'>Color Swatch</label>
                                <div className='flex items-center gap-2'>
                                  <input
                                    type='color'
                                    value={variant.colorCode || '#ef4444'}
                                    onChange={(e) => { updateVariant(vIndex, 'colorCode', e.target.value); setIsDirty(true) }}
                                    className='w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5'
                                  />
                                  <span className='text-xs text-gray-400 font-mono'>{variant.colorCode}</span>
                                </div>
                              </div>
                            </div>

                            {/* Images for Color */}
                            <div className='mb-4 pb-4 border-b border-gray-200'>
                              <label className='block text-xs font-medium text-gray-600 mb-2'>Images for {variant.color || 'this color'} (up to 4) *</label>
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
                                      onChange={(e) => { handleVariantImage(vIndex, imgIndex, e.target.files[0]); setIsDirty(true) }}
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Lengths for this Color */}
                            <div className='space-y-3 mb-4'>
                              <div className='flex items-center justify-between'>
                                <label className='block text-sm font-medium text-gray-900'>Length Variants</label>
                                <span className='text-xs text-gray-500'>{variant.lengths?.length || 0} length(s)</span>
                              </div>

                              {variant.lengths?.map((length, lIndex) => (
                                <div key={lIndex} className='bg-gray-50 rounded-xl p-3 grid grid-cols-5 gap-2 items-end'>
                                  <div>
                                    <label className='block text-xs font-medium text-gray-600 mb-1'>Length *</label>
                                    <input
                                      type='text'
                                      placeholder='e.g. 5m, 10m'
                                      value={length.length || ''}
                                      onChange={(e) => { updateLength(vIndex, lIndex, 'length', e.target.value); setIsDirty(true) }}
                                      className='w-full px-2 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                    />
                                  </div>
                                  <div>
                                    <label className='block text-xs font-medium text-gray-600 mb-1'>Price ₹ *</label>
                                    <input
                                      type='number'
                                      placeholder='0'
                                      value={length.price}
                                      onChange={(e) => { updateLength(vIndex, lIndex, 'price', e.target.value); setIsDirty(true) }}
                                      className='w-full px-2 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                    />
                                  </div>
                                  <div>
                                    <label className='block text-xs font-medium text-gray-600 mb-1'>Compare ₹</label>
                                    <input
                                      type='number'
                                      placeholder='Optional'
                                      value={length.compareAtPrice}
                                      onChange={(e) => { updateLength(vIndex, lIndex, 'compareAtPrice', e.target.value); setIsDirty(true) }}
                                      className='w-full px-2 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                    />
                                  </div>
                                  <div>
                                    <label className='block text-xs font-medium text-gray-600 mb-1'>Wholesale ₹</label>
                                    <input
                                      type='number'
                                      placeholder='Optional'
                                      value={length.wholesalePrice}
                                      onChange={(e) => { updateLength(vIndex, lIndex, 'wholesalePrice', e.target.value); setIsDirty(true) }}
                                      className='w-full px-2 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                    />
                                  </div>
                                  <div>
                                    <label className='block text-xs font-medium text-gray-600 mb-1'>Stock *</label>
                                    <input
                                      type='number'
                                      placeholder='0'
                                      value={length.stock}
                                      onChange={(e) => { updateLength(vIndex, lIndex, 'stock', e.target.value); setIsDirty(true) }}
                                      className='w-full px-2 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                    />
                                  </div>
                                  <button
                                    type='button'
                                    onClick={() => { removeLength(vIndex, lIndex); setIsDirty(true) }}
                                    className='text-xs text-red-500 hover:text-red-700 font-medium px-2 py-2 rounded hover:bg-red-50 transition-all'
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}

                              <button
                                type='button'
                                onClick={() => { addLength(vIndex); setIsDirty(true) }}
                                className='w-full py-2 text-sm border border-dashed border-red-300 text-red-600 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all font-medium'
                              >
                                + Add Length
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      // Flat mode
                      <>
                        {variants.map((variant, vIndex) => (
                          <div key={vIndex} className='border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-200 transition-colors'>
                            <div className='flex items-center justify-between mb-4'>
                              <div>
                                <span className='font-medium text-gray-900'>
                                  Variant {vIndex + 1}
                                </span>
                                {variantTypes.includes('color') && variant.color && (
                                  <div className='flex items-center gap-2 mt-1'>
                                    <div
                                      className='w-6 h-6 rounded-full border-2 border-white shadow-md flex-shrink-0'
                                      style={{ backgroundColor: variant.colorCode }}
                                    ></div>
                                    <span className='text-sm text-gray-600'>{variant.color}</span>
                                  </div>
                                )}
                              </div>
                              <button
                                type='button'
                                onClick={() => { removeVariant(vIndex); setIsDirty(true) }}
                                className='text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-all'
                              >
                                Remove
                              </button>
                            </div>

                            {/* Dynamic attribute fields based on selected variant types */}
                            <div className='grid gap-3 mb-4'>
                              {variantTypes.map((type) => (
                                <div key={type}>
                                  {type === 'color' ? (
                                    <div className='grid grid-cols-2 gap-3'>
                                      <div>
                                        <label className='block text-xs font-medium text-gray-600 mb-1'>Color Name *</label>
                                        <input
                                          type='text'
                                          placeholder='e.g. Red, Blue, Warm White'
                                          value={variant[type] || ''}
                                          onChange={(e) => { updateVariant(vIndex, type, e.target.value); setIsDirty(true) }}
                                          className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                        />
                                      </div>
                                      <div>
                                        <label className='block text-xs font-medium text-gray-600 mb-1'>Color Swatch</label>
                                        <div className='flex items-center gap-2'>
                                          <input
                                            type='color'
                                            value={variant.colorCode || '#ef4444'}
                                            onChange={(e) => { updateVariant(vIndex, 'colorCode', e.target.value); setIsDirty(true) }}
                                            className='w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5'
                                          />
                                          <span className='text-xs text-gray-400 font-mono'>{variant.colorCode}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <label className='block text-xs font-medium text-gray-600 mb-1'>
                                        {availableVariantTypes.find(t => t.id === type)?.label} *
                                      </label>
                                      <input
                                        type='text'
                                        placeholder={`Enter ${type}...`}
                                        value={variant[type] || ''}
                                        onChange={(e) => { updateVariant(vIndex, type, e.target.value); setIsDirty(true) }}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Pricing and Stock */}
                            <div className='grid grid-cols-4 gap-3 mb-4'>
                              <div>
                                <label className='block text-xs font-medium text-gray-600 mb-1'>Price ₹ *</label>
                                <input
                                  type='number'
                                  placeholder='0'
                                  value={variant.price}
                                  onChange={(e) => { updateVariant(vIndex, 'price', e.target.value); setIsDirty(true) }}
                                  className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                />
                              </div>
                              <div>
                                <label className='block text-xs font-medium text-gray-600 mb-1'>Compare at ₹</label>
                                <input
                                  type='number'
                                  placeholder='Original price'
                                  value={variant.compareAtPrice}
                                  onChange={(e) => { updateVariant(vIndex, 'compareAtPrice', e.target.value); setIsDirty(true) }}
                                  className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                />
                              </div>
                              <div>
                                <label className='block text-xs font-medium text-gray-600 mb-1'>Wholesale ₹</label>
                                <input
                                  type='number'
                                  placeholder='Optional'
                                  value={variant.wholesalePrice}
                                  onChange={(e) => { updateVariant(vIndex, 'wholesalePrice', e.target.value); setIsDirty(true) }}
                                  className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                />
                              </div>
                              <div>
                                <label className='block text-xs font-medium text-gray-600 mb-1'>Stock *</label>
                                <input
                                  type='number'
                                  placeholder='0'
                                  value={variant.stock}
                                  onChange={(e) => { updateVariant(vIndex, 'stock', e.target.value); setIsDirty(true) }}
                                  className='w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400'
                                />
                              </div>
                            </div>

                            {/* Images */}
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
                                      onChange={(e) => { handleVariantImage(vIndex, imgIndex, e.target.files[0]); setIsDirty(true) }}
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    <button
                      type='button'
                      onClick={addVariant}
                      className='w-full py-3 border-2 border-dashed border-red-200 text-red-500 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all text-sm font-medium flex items-center justify-center gap-2'
                    >
                      <span className='text-lg'>+</span> Add Another Variant
                    </button>
                  </>
                )}

                {variantTypes.length === 0 && (
                  <p className='text-sm text-gray-500 text-center py-4'>Select variant types above to start adding variants</p>
                )}
              </div>
            )}
          </div>

          {/* Product Information Box */}
          <div className='bg-white rounded-2xl p-6'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900'>Product Information</h3>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-900 mb-2'>Product Name</label>
              <input onChange={(e) => { setName(e.target.value); setIsDirty(true) }} value={name} className='w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500' type="text" placeholder='e.g. Modern Brass Pendant Light' required/>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-900 mb-2'>Category</label>
                <select onChange={(e) => { setCategory(e.target.value); setIsDirty(true) }} value={category} className='w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500'>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
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
                  <textarea onChange={(e) => { setDescription(e.target.value); setIsDirty(true) }} value={description} className='w-full px-4 py-3 border border-gray-300 rounded-2xl h-32 focus:outline-none focus:ring-2 focus:ring-red-500' placeholder='Describe the product material, design features, and installation requirements...' required/>
                </div>
              )}

              {activeTab === 'use-cases' && (
                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>Use Cases / Application</label>
                  <textarea onChange={(e) => { setUseCases(e.target.value); setIsDirty(true) }} value={useCases} className='w-full px-4 py-3 border border-gray-300 rounded-2xl h-32 focus:outline-none focus:ring-2 focus:ring-red-500' placeholder='e.g., Ideal for modern living rooms, hotel lobbies, or high-ceiling dining areas...' />
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
                  onChange={(e) => { setRetailPrice(e.target.value); setIsDirty(true) }} 
                  value={retailPrice} 
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500' 
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
                  onChange={(e) => { setCompareAtPrice(e.target.value); setIsDirty(true) }} 
                  value={compareAtPrice} 
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500' 
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
                  onChange={(e) => { setWholesalePrice(e.target.value); setIsDirty(true) }} 
                  value={wholesalePrice} 
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500' 
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
                onChange={(e) => { setMinimumWholesaleQuantity(e.target.value); setIsDirty(true) }} 
                value={minimumWholesaleQuantity} 
                className='w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500' 
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
                onChange={(e) => { setStock(e.target.value); setIsDirty(true) }} 
                value={stock} 
                className='w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500' 
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
                <input onChange={() => { setBestseller(prev => !prev); setIsDirty(true) }} checked={bestseller} type="checkbox" className='w-4 h-4 rounded accent-red-600' />
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
          onClick={onSubmitHandler}
          disabled={submitting}
          className='flex-1 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2'
        >
          {submitting ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Saving...
            </>
          ) : '✓ Save Changes'}
        </button>
        <button 
          type='button'
          onClick={() => {
            if (isDirty) {
              setShowUnsavedConfirm(true)
            } else {
              navigate('/list')
            }
          }}
          disabled={submitting}
          className='flex-1 py-3 bg-white text-gray-800 border border-gray-300 rounded-2xl hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-semibold'
        >
          Cancel
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
    </div>
  )
}

export default Edit

