// Load data directly from houselisting.json
let houselisting = [];
let currentProperties = [];

/**
 * Load property data from JSON file
 */
async function loadHouselistingData() {
    try {
        const response = await fetch('./HOMELINK-JS/houselisting.json');
        const data = await response.json();
        houselisting = data.houselisting || [];
        currentProperties = houselisting.slice();
        console.log('Houselisting data loaded:', houselisting);
        // Initialize search UI once data is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSearch);
        } else {
            initSearch();
        }
    } catch (error) {
        console.error('Error loading houselisting.json:', error);
        houselisting = [];
        currentProperties = [];
    }
}

// Results containers: properties page or Index page
const searchbox = document.querySelector('.search-input');
if (searchbox) searchbox.value = '';

const searchselect = document.querySelector('.search-location');
const searchtype = document.querySelector('.search-type');
const propertyDiv = document.querySelector('.property-div');
const homeDisplaySearch = document.querySelector('.all-features-properties');
const resultsRoot = propertyDiv || null;

// Search inputs (support different pages)
const searchBox = document.querySelector('.searchbox') || document.querySelector('.search-input');
const locationSelect = document.querySelector('.search-select');
const filterSelect = document.querySelector('.filter-select');
const searchBtn = document.querySelector('.search-btn');
const summaryText = document.querySelector('.property-summary') || document.querySelector('.more-features');

const textValue = (value) =>
    String(value || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

const locationText = (location) => {
    const raw = String(location || '')
    const clean = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const match = clean.match(/\b(plateau|abuja)\b/i)

    if (!match) {
        return `<div class="location-text">${clean}</div>`
    }

    const state = match[0].toUpperCase()
    const address = clean.replace(new RegExp(match[0], 'i'), '').replace(/[-,\s]+$/, '').trim()

    return `
        <div class="location-text">${address}</div>
        <div class="location-state">${state}</div>
    `
}

const initSearch = () => {
    // Initialize bindings even if a particular results container is not present
    displayProperties(houselisting)

    searchBox?.addEventListener('input', performSearch)
    searchBox?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            performSearch()
        }
    })
    locationSelect?.addEventListener('change', performSearch)
    filterSelect?.addEventListener('change', performSearch)
    searchBtn?.addEventListener('click', performSearch)
}

const performSearch = () => {
    const query = textValue(searchBox?.value)
    const selectedType = filterSelect?.value || 'All property types'
    const selectedLocation = locationSelect?.value || 'All locations'

    const results = houselisting.filter((house) => {
        const typeMatches =
            selectedType === 'All property types' ||
            textValue(house.servicetype) === selectedType.toLowerCase()

        const locationMatches =
            selectedLocation === 'All locations' ||
            textValue(house.location).includes(selectedLocation.toLowerCase())

        const searchMatches =
            !query ||
            textValue(house.venue).includes(query) ||
            textValue(house.description).includes(query) ||
            textValue(house.location).includes(query) ||
            textValue(house.bedspace).includes(query) ||
            textValue(house.bathspace).includes(query) ||
            textValue(house.compoundspace).includes(query) ||
            textValue(house.servicetype).includes(query) ||
            String(house.totalFee).includes(query) ||
            String(house.basicFee).includes(query)

        return typeMatches && locationMatches && searchMatches
    })

    currentProperties = results
    displayProperties(results)
}

function displayProperties(properties) {
    // Choose where to render: primary resultsRoot (properties page) and/or homeDisplaySearch (Index page)
    const target = resultsRoot
    const homeTarget = homeDisplaySearch

    if (!target && !homeTarget) return

    if (!properties || properties.length === 0) {
        const noResultsHtml = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <h3 style="color: #1b3a72; font-size: 1.3rem; margin-bottom: 10px;">No properties found</h3>
                <p style="color: #5a6a84; font-size: 0.95rem;">Try adjusting your search filters or browse all listings.</p>
            </div>
        `
        if (target) target.innerHTML = noResultsHtml
        if (homeTarget) homeTarget.innerHTML = noResultsHtml
        summaryText && (summaryText.textContent = 'No matching properties found. Try a broader location or type.')
        return
    }

    let fullHtml = ''
    properties.forEach((house, index) => {
        const formattedPrice =
            typeof house.totalFee === 'number'
                ? `₦${house.totalFee.toLocaleString()}`
                : house.totalFee || '₦0'

        const propertyCard = `
            <div class="feature-grid-container">
                <div class="feature-box" data-property-id="${house.id}">
                    <div class="feature-image-div">
                        ${String(house.image || '').toLowerCase().endsWith('.mp4')
                            ? `<video width="100%" autoplay muted loop class="feature-image" poster="../images/house3.jpg"><source src="${house.image}" type="video/mp4"></video>`
                            : `<img src="${house.image}" alt="${house.venue}" class="feature-image">`
                        }
                        <button class="feature-price">${formattedPrice}</button>
                        <button class="service-type">${house.servicetype || 'Property'}</button>
                    </div>
                    <div class="feature-details">
                        <h3 class="rooms">${house.venue}</h3>
                        <div class="property-specs">
                            <span>${house.bedspace || 'N/A'}</span> | <span>${house.bathspace || 'N/A'}</span> | <span>${house.compoundspace || 'N/A'}</span>
                        </div>
                        <h5 class="location-row">
                            <div class="location-div">
                                <img class="location-feature" src="../images/location.png" alt="Location">
                            </div>
                            <div class="location-area">
                                ${locationText(house.location)}
                            </div>
                        </h5>
                        <button class="book-now-btn" data-index="${index}">Book Now</button>
                    </div>
                </div>
            </div>
        `

        fullHtml += propertyCard
    })

    if (target) target.innerHTML = fullHtml
    if (homeTarget) homeTarget.innerHTML = fullHtml

    summaryText && (summaryText.textContent = `${properties.length} homes matching your criteria are available.`)
}

// Delegate clicks so booking works from either page/container
document.addEventListener('click', (event) => {
    const button = event.target.closest('.book-now-btn')
    if (!button) return

    const index = Number(button.dataset.index)
    const selectedProperty = currentProperties[index]
    if (!selectedProperty) return

    const id = selectedProperty.id
    window.location.href = `detailpage.html?id=${encodeURIComponent(id)}`
})

// Load data and initialize on page ready
loadHouselistingData();
