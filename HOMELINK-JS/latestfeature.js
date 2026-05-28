
// Load data directly from JSON
let houselisting = [];
let homepageRentList = [];
let homepageSaleList = [];

/**
 * Load property data from houselisting.json
 */
async function loadHouselistingData() {
    try {
        const response = await fetch('./HOMELINK-JS/houselisting.json');
        const data = await response.json();
        houselisting = data.houselisting || [];
        homepageRentList = data.homepageRentList || [];
        homepageSaleList = data.homepageSaleList || [];
        console.log('House listing data loaded:', { homepageRentList, homepageSaleList });
        
        // Initialize displays once data is loaded
        displayRentFeatures();
        displaySaleFeatures();
        attachEventHandlers();
    } catch (error) {
        console.error('Error loading houselisting.json:', error);
    }
}

/**
 * Display rent properties in featured section
 */
function displayRentFeatures() {
    const latestrentfeatures = document.querySelector('.feature-grid-rent-container');
    if (!latestrentfeatures) return;

    homepageRentList.forEach((houses, index) => {
        let homerentlistHTML = `
            <div class="feature-box">
                <div class="feature-image-div">
                    <img src="${houses.image}" alt="" class="feature-image">
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
                        <span>${houses.bedspace || '3 Beds'}</span> | 
                        <span>${houses.bathspace || '2 Baths'}</span> | 
                        <span>${houses.compoundspace || 'Parking'}</span>        
                    </div>
                    <h5>
                        <div class="location-div">
                            <img class="location-feature" src="../images/locationpin.png" alt="">
                        </div>
                        <div class="location-area">${houses.location}</div> 
                    </h5>
                    <button class="book-now-btn"><a href="./HOMELINK-HTML/detailpage.html">Book Now</a></button>
                </div>
            </div>`;

        latestrentfeatures.innerHTML += homerentlistHTML;
    });
}

/**
 * Display sale properties in featured section
 */
function displaySaleFeatures() {
    const latestsalefeatures = document.querySelector('.feature-grid-sale-container');
    if (!latestsalefeatures) return;

    homepageSaleList.forEach((houses, index) => {
        let homesalelistHTML = `
            <div class="feature-box">
                <div class="feature-image-div">
                    <img src="${houses.image}" alt="" class="feature-image">
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
                        <span>${houses.bedspace || '3 Beds'}</span> | 
                        <span>${houses.bathspace || '2 Baths'}</span> | 
                        <span>${houses.compoundspace || 'Parking'}</span>        
                    </div>
                    <h5>
                        <div class="location-div">
                            <img class="location-feature" src="../images/locationpin.png" alt="">
                        </div>
                        <div class="location-area">${houses.location}</div> 
                    </h5>
                    <button class="book-now-btn"><a href="../HOMELINK-HTML/detailpage.html">Book Now</a></button>
                </div>
            </div>`;
        
        latestsalefeatures.innerHTML += homesalelistHTML;
    });
}

/**
 * Attach click event handlers to book-now buttons
 */
function attachEventHandlers() {
    // Attach click handlers to rent section book-now buttons
    document.querySelectorAll('.feature-grid-rent-container .book-now-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (index < homepageRentList.length) {
                const id = homepageRentList[index].id
                window.location.href = `detailpage.html?id=${encodeURIComponent(id)}`;
            }
        });
    });

    // Attach click handlers to sale section book-now buttons
    document.querySelectorAll('.feature-grid-sale-container .book-now-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (index < homepageSaleList.length) {
                const id = homepageSaleList[index].id
                window.location.href = `detailpage.html?id=${encodeURIComponent(id)}`;
            }
        });
    });
}

// Load data when page is ready
document.addEventListener('DOMContentLoaded', loadHouselistingData);

