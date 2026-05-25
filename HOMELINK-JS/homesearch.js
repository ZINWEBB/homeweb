
    let houselisting = [];

    // Load data from JSON file
    async function loadHouselisting() {
        try {
            const response = await fetch('./HOMELINK-JS/houselisting.json')
            const data = await response.json()
            houselisting = data.houselisting
            init()
        } catch (error) {
            console.error('Error loading houselisting:', error)
        }
    }

    const searchInput = document.querySelector('.search-input');
    const searchType = document.querySelector('.search-type');
    const searchLocation = document.querySelector('.search-location');
    const searchBtn = document.querySelector('.search-btn');
    const resultsContainer = document.querySelector('.all-features-properties');

    let currentProperties = [];
    let originalContent = '';

    const textValue = (value) =>
        String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    // Save original featured content
    function saveOriginalContent() {
        if (resultsContainer) {
            originalContent = resultsContainer.innerHTML;
        }
    }

    // Display Search Results with X button
    function displaySearchResults(properties) {
        if (!resultsContainer) return;

        let html = `
            <div style="position: relative; margin-bottom: 25px;">
                <!-- X Exit Button -->
                <button id="exit-search" 
                        style="position: absolute; top: 10px; right: 10px; 
                               background: #e11d48; color: white; border: none; 
                               width: 40px; height: 40px; border-radius: 50%; 
                               font-size: 20px; cursor: pointer; z-index: 10;
                               box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                    ✕
                </button>
            </div>
            <div class="search-results-grid">`;

        if (!properties || properties.length === 0) {
            html += `
                <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
                    <h3>No properties found</h3>
                    <p>Try different keywords or filters.</p>
                </div>`;
        } else {
            properties.forEach((house, index) => {
                const price = typeof house.totalFee === 'number' 
                    ? `₦${house.totalFee.toLocaleString()}` 
                    : house.totalFee || '₦0';

                html += `
                    <div class="feature-grid-container">
                        <div class="feature-box" data-property-id="${house.id}">
                            <div class="feature-image-div">
                                ${String(house.image || '').toLowerCase().endsWith('.mp4')
                                    ? `<video width="100%" autoplay muted loop class="feature-image"><source src="${house.image}" type="video/mp4"></video>`
                                    : `<img src="${house.image}" alt="${house.venue}" class="feature-image">`
                                }
                                <button class="feature-price">${price}</button>
                                <button class="service-type">${house.servicetype || 'Property'}</button>
                            </div>
                            <div class="feature-details">
                                <h3 class="rooms">${house.venue}</h3>
                                <div class="property-specs">
                                    <span>${house.bedspace || 'N/A'}</span> | 
                                    <span>${house.bathspace || 'N/A'}</span> | 
                                    <span>${house.compoundspace || 'N/A'}</span>
                                </div>
                                <h5 class="location-row">${house.location || ''}</h5>
                                <button class="book-now-btn" data-index="${index}">Book Now</button>
                            </div>
                        </div>
                    </div>`;
            });
        }

        html += `</div>`;
        resultsContainer.innerHTML = html;

        // Add click event for X button
        document.getElementById('exit-search')?.addEventListener('click', showDefaultContent);
    }

    // Restore default view
    function showDefaultContent() {
        if (resultsContainer && originalContent) {
            resultsContainer.innerHTML = originalContent;
            currentProperties = [];
            
            // Optional: Clear search inputs when exiting
            if (searchInput) searchInput.value = '';
            if (searchType) searchType.value = 'Select Type';
            if (searchLocation) searchLocation.value = 'Select Location';
        }
    }

    // Perform Search
    function performSearch() {
        const query = textValue(searchInput?.value);
        const type = searchType?.value || '';
        const location = searchLocation?.value || '';

        const filtered = houselisting.filter(house => {
            const matchesQuery = !query || 
                textValue(house.venue).includes(query) ||
                textValue(house.description || '').includes(query) ||
                textValue(house.location).includes(query);

            const matchesType = !type || 
                type === 'Select Type' || 
                textValue(house.servicetype) === type.toLowerCase();

            const matchesLocation = !location || 
                location === 'Select Location' || 
                textValue(house.location).includes(location.toLowerCase());

            return matchesQuery && matchesType && matchesLocation;
        });

        currentProperties = filtered;
        displaySearchResults(filtered);
    }

    // Event Listeners
    searchBtn?.addEventListener('click', performSearch);

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Book Now Handler
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.book-now-btn');
        if (!btn) return;

        const index = Number(btn.dataset.index);
        const property = currentProperties[index];
        if (property) {
            localStorage.setItem('selectedHouse', JSON.stringify(property));
            window.location.href = 'detailpage.html';
        }
    });

    // Initialize
    function init() {
        saveOriginalContent();
    }

    loadHouselisting();

    // Scroll reveal animation
    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });

    const revealItems = document.querySelectorAll(
        'section, .service-card, .operation-card, .agent-card, .offering-card, .feature-grid-container, .contact-card, .value-card, .service-hero-card'
    );

    revealItems.forEach(item => {
        item.classList.add('reveal-on-scroll');
        scrollRevealObserver.observe(item);
    });