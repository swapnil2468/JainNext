/**
 * Utility functions for handling product variants
 * Extracted to reduce code duplication across controllers
 */

/**
 * Find a variant in a product by matching variant attributes
 * Supports both simple (color-only) and complex (color + multiple attributes) formats
 * 
 * @param {Object} product - Product object containing variants array
 * @param {string} variantString - Variant identifier (e.g., "Green" or "color:Green::length:5m")
 * @returns {Object|undefined} - Matching variant object or undefined if not found
 */
export const findVariantByAttributes = (product, variantString) => {
    if (!product || !product.variants || product.variants.length === 0) {
        return undefined;
    }

    // Handle complex variant format: "color:Green::length:5m"
    if (variantString.includes(':') && variantString.includes('::')) {
        const attributes = {};
        const pairs = variantString.split('::');
        
        pairs.forEach(pair => {
            const [type, value] = pair.split(':');
            if (type && value) {
                attributes[type] = value;
            }
        });

        return product.variants.find(v => {
            for (const [type, value] of Object.entries(attributes)) {
                // Handle both color (direct property) and other attributes (nested)
                const variantValue = type === 'color' 
                    ? (v.color || v.attributes?.color) 
                    : v.attributes?.[type];
                
                if (variantValue !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    // Handle simple variant format: "Green" (color only)
    return product.variants.find(v => v.color === variantString);
};

/**
 * Find variant index in product variants array
 * Useful for updating stock or other variant-specific properties
 * 
 * @param {Object} product - Product object containing variants array
 * @param {string} variantString - Variant identifier
 * @returns {number} - Index of variant in array, or -1 if not found
 */
export const findVariantIndex = (product, variantString) => {
    if (!product || !product.variants || product.variants.length === 0) {
        return -1;
    }

    if (variantString.includes(':') && variantString.includes('::')) {
        const attributes = {};
        const pairs = variantString.split('::');
        
        pairs.forEach(pair => {
            const [type, value] = pair.split(':');
            if (type && value) attributes[type] = value;
        });

        return product.variants.findIndex(v => {
            for (const [type, value] of Object.entries(attributes)) {
                const variantValue = type === 'color' 
                    ? (v.color || v.attributes?.color) 
                    : v.attributes?.[type];
                if (variantValue !== value) return false;
            }
            return true;
        });
    }

    return product.variants.findIndex(v => v.color === variantString);
};
