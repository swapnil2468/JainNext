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
   const [wholesalePrice, setWholesalePrice] = useState("");
   const [minimumWholesaleQuantity, setMinimumWholesaleQuantity] = useState("10");
   const [stock, setStock] = useState("");
   const [category, setCategory] = useState("LED String Lights");
   const [subCategory, setSubCategory] = useState("Pixel String Lights");
   const [bestseller, setBestseller] = useState(false);

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

   const onSubmitHandler = async (e) => {
    e.preventDefault();

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
      if (wholesalePrice) formData.append("wholesalePrice",wholesalePrice)
      if (minimumWholesaleQuantity) formData.append("minimumWholesaleQuantity",minimumWholesaleQuantity)
      formData.append("stock",stock)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)

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
        setWholesalePrice('')
        setMinimumWholesaleQuantity('10')
        setStock('')
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
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Upload Image</p>

          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
            </label>
          </div>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product name</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product description</p>
          <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required/>
        </div>

        {/* Category Selection */}
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
              <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
                  {categoryOptions[category].map((subCat) => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
              </select>
            </div>
        </div>

        {/* Pricing Section */}
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
            <div className='w-full sm:w-[150px]'>
              <p className='mb-2'>Retail Price</p>
              <input 
                onChange={(e) => setRetailPrice(e.target.value)} 
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
              <p className='mb-2'>Wholesale Price</p>
              <input 
                onChange={(e) => setWholesalePrice(e.target.value)} 
                value={wholesalePrice} 
                className='w-full px-3 py-2' 
                type="number" 
                placeholder='20' 
                min="0.01"
                step="0.01"
              />
            </div>

            <div className='w-full sm:w-[150px]'>
              <p className='mb-2'>Min Wholesale Qty</p>
              <input 
                onChange={(e) => setMinimumWholesaleQuantity(e.target.value)} 
                value={minimumWholesaleQuantity} 
                className='w-full px-3 py-2' 
                type="number" 
                placeholder='10' 
                min="1"
                step="1"
              />
            </div>
        </div>

        {/* Stock and Bestseller */}
        <div className='flex flex-col sm:flex-row gap-4 w-full sm:items-end'>
            <div className='w-full sm:w-[150px]'>
              <p className='mb-2'>Stock</p>
              <input 
                onChange={(e) => setStock(e.target.value)} 
                value={stock} 
                className='w-full px-3 py-2' 
                type="number" 
                placeholder='0' 
                min="0"
                step="1"
                required
              />
            </div>

            <div className='flex gap-2 pb-2'>
              <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
              <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
            </div>
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

        <button 
          type="submit" 
          disabled={loading}
          className='w-28 py-3 mt-4 bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {loading ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Adding...
            </>
          ) : 'ADD'}
        </button>

    </form>
  )
}

export default Add