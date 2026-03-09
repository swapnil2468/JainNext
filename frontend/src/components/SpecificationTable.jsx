import React from 'react'

const SpecificationTable = ({ specifications }) => {

  // Field labels mapping
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

  // Filter out empty specifications
  const filteredSpecs = Object.entries(specifications || {})
    .filter(([key, value]) => value && value.trim() !== '')
    .map(([key, value]) => ({
      key,
      label: specificationLabels[key] || key,
      value
    }));

  // If no specifications, return null
  if (filteredSpecs.length === 0) {
    return null;
  }

  return (
    <div className='w-full overflow-x-auto'>
      <table className='w-full border-collapse'>
        <tbody>
          {filteredSpecs.map((spec, index) => (
            <tr key={spec.key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className='border border-gray-200 px-4 py-3 font-medium text-gray-700 w-1/3'>
                {spec.label}
              </td>
              <td className='border border-gray-200 px-4 py-3 text-gray-600'>
                {spec.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SpecificationTable
