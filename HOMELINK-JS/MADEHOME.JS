
ho// MADEHOME.JS - Single source of truth for all property data from houselisting.json

let houselisting = [];
let homepageRentList = [];
let homepageSaleList = [];

/**
 * Load all property data from houselisting.json
 */
async function loadHouselistingData() {
    try {
        const response = await fetch('./HOMELINK-JS/houselisting.json');
        const data = await response.json();
        houselisting = data.houselisting || [];
        homepageRentList = data.homepageRentList || [];
        homepageSaleList = data.homepageSaleList || [];
        console.log('House listing data loaded successfully:', { houselisting, homepageRentList, homepageSaleList });
        return true;
    } catch (error) {
        console.error('Error loading houselisting.json:', error);
        return false;
    }
}

/**
 * Get all properties
 */
function getAllProperties() {
    return houselisting;
}

/**
 * Get homepage rent list
 */
function getHomepageRentList() {
    return homepageRentList;
}

/**
 * Get homepage sale list
 */
function getHomepageSaleList() {
    return homepageSaleList;
}

/**
 * Get filtered properties by service type
 */
function getPropertiesByType(servicetype) {
    return houselisting.filter(house => 
        house.servicetype.toLowerCase() === servicetype.toLowerCase()
    );
}

/**
 * Get property by ID
 */
function getPropertyById(id) {
    return houselisting.find(house => house.id === id);
}

// Export functions for module usage
export { 
    loadHouselistingData, 
    getAllProperties, 
    getHomepageRentList, 
    getHomepageSaleList, 
    getPropertiesByType, 
    getPropertyById,
    houselisting
};

// Auto-load data when this module is imported
loadHouselistingData();
