
let houselisting = []
let propertydiv = null
let searchBox = null
let filterSelect = null

// Load data from JSON file
async function loadHouselisting() {
    try {
        const response = await fetch('../HOMELINK-JS/houselisting.json')
        const data = await response.json()
        houselisting = data.houselisting
        console.log('JSON loaded successfully:', houselisting)
        
        // Guard: only run if property div exists
        if (propertydiv) {
            // Initialize - show all properties on page load
            renderproperties(houselisting)
        }
    } catch (error) {
        console.error('Error loading houselisting:', error)
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    propertydiv = document.querySelector('.property-div')
    searchBox = document.querySelector('.searchbox')
    filterSelect = document.querySelector('.filter-select')

    // Load initial data
    loadHouselisting()

    // Add search functionality if search elements exist
    if (searchBox && filterSelect) {
        // Listen to search input
        searchBox.addEventListener('input', performSearch)
        
        // Listen to filter dropdown
        filterSelect.addEventListener('change', performSearch)
    }

    // Handle feature-more-detail buttons on MADEHOME.HTML
    let featureMoreDetailBtns = document.querySelectorAll('.feature-more-detail')
    featureMoreDetailBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (index < houselisting.length) {
                const id = houselisting[index].id
                window.location.href = `detailpage.html?id=${encodeURIComponent(id)}`
            }
        })
    })
})

// Main search and filter function
function performSearch() {
    let searchQuery = searchBox.value.toLowerCase().trim()
    let selectedType = filterSelect.value

    // Filter properties based on search query and type
    let filtered = houselisting.filter(house => {
        // Check if property type matches filter
        let typeMatch = selectedType === 'All property types' || 
                       house.servicetype.toLowerCase() === selectedType.toLowerCase()
        
        // Check if property matches search query across multiple fields
        let searchMatch = !searchQuery || 
            house.location.toLowerCase().includes(searchQuery) ||
            house.venue.toLowerCase().includes(searchQuery) ||
            house.description.toLowerCase().includes(searchQuery) ||
            house.bedspace.toLowerCase().includes(searchQuery) ||
            house.bathspace.toLowerCase().includes(searchQuery) ||
            house.compoundspace.toLowerCase().includes(searchQuery) ||
            String(house.totalFee).includes(searchQuery) ||
            String(house.basicFee).includes(searchQuery)

        // Return true if both type and search match
        return typeMatch && searchMatch
    })

    // Display filtered results
    renderproperties(filtered)
}

function renderproperties(properties) {
    // Clear previous content
    propertydiv.innerHTML = ''

    // If no results found, show message
    if (!properties || properties.length === 0) {
        propertydiv.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <h3 style="color: #1b3a72; font-size: 1.3rem; margin-bottom: 10px;">No properties found</h3>
                <p style="color: #5a6a84; font-size: 0.95rem;">Try adjusting your search filters or browse all listings</p>
            </div>
        `
        return
    }

    // Render each property
    properties.forEach((houses, index) => {


        if(houses.image.endsWith('jpg')||houses.image.endsWith('jpg')||houses.image.endsWith('jpg') ){
             let houselistingHTML = `
            <div class="feature-grid-container">
                <div class="feature-box" data-property-id="${houses.id}">
                    <div class="feature-image-div">
                        <img src="${houses.image}" alt="${houses.venue}" class="feature-image">
                        <button class="feature-price">
                            ₦${houses.totalFee.toLocaleString()}
                        </button>
                        <button class="service-type">
                            ${houses.servicetype}
                        </button>
                    </div>     
                    <div class="feature-details">
                        <h3 class="rooms">
                            ${houses.venue}
                        </h3>
                        <div class="property-specs">          
                            <span>${houses.bedspace}</span> | <span>${houses.bathspace}</span> | <span>${houses.compoundspace}</span>
                        </div>
                        <h5>
                            <div class="location-div">
                                <img class="location-feature" src="../images/locationpin.png" alt="">
                            </div>
                            <div class="location-area locations-area" >${houses.location}</div> 
                        </h5>
                        <button class="book-now-btn" data-index="${index}">Book Now</button>
                    </div>
                </div>
            </div>
        `
        propertydiv.innerHTML += houselistingHTML  
        }
        
        else if(houses.image.endsWith('mp4') ){
             let houselistingHTML = `
            <div class="feature-grid-container">
                <div class="feature-box" data-property-id="${houses.id}">
                    <div class="feature-image-div">
                        <video width="100%" autoplay controls poster="../images/house3.jpg" loop styles"position"" src="${houses.image}" alt="${houses.venue}" class="feature-image">
                        <button class="feature-price">
                            ₦${houses.totalFee.toLocaleString()}
                        </button>
                        <button class="service-type">
                            ${houses.servicetype}
                        </button>
                    </div>     
                    <div class="feature-details">
                        <h3 class="rooms">
                            ${houses.venue}
                        </h3>
                        <div class="property-specs">          
                            <span>${houses.bedspace}</span> | <span>${houses.bathspace}</span> | <span>${houses.compoundspace}</span>
                        </div>
                        <h5>
                            <div class="location-div">
                                <img class="location-feature" src="../images/locationpin.png" alt="">
                            </div>
                            <div class="location-area">${houses.location}</div> 
                        </h5>
                        <button class="book-now-btn" data-index="${index}">Book Now</button>
                    </div>
                </div>
            </div>
        `
        propertydiv.innerHTML += houselistingHTML  
        }
        
           
    })

    // Attach click handlers to book-now buttons using event delegation
    let bookBtns = document.querySelectorAll('.book-now-btn')
    bookBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const id = properties[index]?.id
            if (!id) return
            window.location.href = `detailpage.html?id=${encodeURIComponent(id)}`
        })
    })
}









