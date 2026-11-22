export const APPAREL_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "Free Size"];
export const BEDSHEET_SIZES = ["Single Bed", "King Size"];
export const ALL_FILTER_SIZES = ["All", "S", "M", "L", "XL", "XXL", "3XL", "Free Size", "Single Bed", "King Size"];

/**
 * Determine if a product is out of stock.
 * 
 * Rules:
 * 1. If product has no sizes (e.g. Bags, Accessories, or no_sizes: true):
 *    - It is OUT OF STOCK only if sizes.in_stock === false.
 *    - Otherwise it is IN STOCK.
 * 2. If product has size options (e.g. S/M/L or King Size/Single Bed):
 *    - It is OUT OF STOCK only if NONE of the available sizes are true.
 */
export function isProductOutOfStock(product) {
  if (!product) return true;
  const sizes = (product.sizes && typeof product.sizes === 'object') ? product.sizes : {};

  // Products with no sizes configured (like Bags)
  if (sizes.no_sizes === true || sizes.has_no_sizes === true) {
    return sizes.in_stock === false;
  }

  // Filter out meta keys to get actual size keys
  const sizeKeys = Object.keys(sizes).filter(k => k !== 'no_sizes' && k !== 'has_no_sizes' && k !== 'in_stock');
  
  // If no size keys exist in the object at all, it's a product without sizes -> in stock by default
  if (sizeKeys.length === 0) {
    return sizes.in_stock === false;
  }

  // If actual size keys exist, check if at least one is true
  return !sizeKeys.some(key => sizes[key] === true);
}

/**
 * Get relevant size keys for a product.
 * Returns array of size strings, or empty array if product has no sizes.
 */
export function getProductSizes(product) {
  if (!product) return [];
  const sizes = (product.sizes && typeof product.sizes === 'object') ? product.sizes : {};

  if (sizes.no_sizes === true || sizes.has_no_sizes === true) {
    return [];
  }

  const category = (product.category || '').toLowerCase();

  // If it's a bedsheet or has bedsheet sizes
  if (category.includes('bedsheet') || 'King Size' in sizes || 'Single Bed' in sizes) {
    return BEDSHEET_SIZES;
  }

  // If no sizes were configured at all and it's bags
  if (category.includes('bag') && Object.keys(sizes).length === 0) {
    return [];
  }

  return APPAREL_SIZES;
}
