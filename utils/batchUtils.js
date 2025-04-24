/**
 * Utility functions for handling batch operations
 */

/**
 * Generate a unique batch number
 * @param {string} productId - ID of the product
 * @param {Date} purchaseDate - Date of purchase
 * @param {number} sequence - Sequence number for multiple batches of same product on same day
 * @returns {string} - Generated batch number
 */
exports.generateBatchNumber = (productId, purchaseDate = new Date(), sequence = 1) => {
    // Extract parts from product ID (last 4 characters)
    const productCode = productId.toString().slice(-4);
    
    // Format date as YYYYMMDD
    const dateString = purchaseDate.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Format sequence with leading zeros
    const sequenceStr = sequence.toString().padStart(3, '0');
    
    // Combine to form: PROD-YYYYMMDD-SEQ
    return `${productCode}-${dateString}-${sequenceStr}`;
};

/**
 * Parse information from a batch number
 * @param {string} batchNumber - The batch number to parse
 * @returns {Object} - Parsed information
 */
exports.parseBatchNumber = (batchNumber) => {
    const parts = batchNumber.split('-');
    if (parts.length !== 3) {
        throw new Error('Invalid batch number format');
    }
    
    const productCode = parts[0];
    
    // Parse date YYYYMMDD format
    const year = parseInt(parts[1].substring(0, 4));
    const month = parseInt(parts[1].substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(parts[1].substring(6, 8));
    const date = new Date(year, month, day);
    
    const sequence = parseInt(parts[2]);
    
    return {
        productCode,
        date,
        sequence
    };
};