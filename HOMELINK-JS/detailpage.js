let houselisting = []
let selectedHouse = null

// Load data from JSON file
async function loadHouselisting() {
    try {
        const response = await fetch('../HOMELINK-JS/houselisting.json')
        const data = await response.json()
        houselisting = data.houselisting
        console.log('JSON loaded successfully:', houselisting)
        
        const selectedId = new URLSearchParams(window.location.search).get('id')
        if (selectedId) {
            selectedHouse = houselisting.find(item => String(item.id) === selectedId)
            console.log('Selected house from URL id:', selectedHouse)
        }

        if (!selectedHouse) {
            selectedHouse = JSON.parse(localStorage.getItem('selectedHouse'))
            console.log('Selected house from localStorage fallback:', selectedHouse)
        }

        // If no data, show default message
        if (!selectedHouse) {
            console.log('No house selected')
        } else {
            console.log('Initializing slider with:', selectedHouse)
            initializeSlider(selectedHouse)
            updatePropertyDetails(selectedHouse)
        }
    } catch (error) {
        console.error('Error loading houselisting:', error)
    }
}

function initializeSlider(selectedHouse) {
    // Update image gallery
    const sliderViewer = document.querySelector('.slide-viewer')
    const sliderDots = document.querySelector('.slider-dots')
    const prevArrow = document.querySelector('.slider-prev')
    const nextArrow = document.querySelector('.slider-next')

    const galleryItems = Array.isArray(selectedHouse.gallery)
        ? selectedHouse.gallery.filter(item => item)
        : []

    const mediaItems = []
    if (selectedHouse.image) {
        mediaItems.push(selectedHouse.image)
    }

    galleryItems.forEach(item => {
        if (!item) return
        if (String(item).trim() === String(selectedHouse.image).trim()) return
        mediaItems.push(item)
    })

    if (!mediaItems.length && selectedHouse.image) {
        mediaItems.push(selectedHouse.image)
    }

    let currentMediaIndex = 0

    const renderSlide = (index) => {
        if (!sliderViewer) return
        const item = mediaItems[index]
        if (!item) {
            sliderViewer.innerHTML = '<div class="slide-empty">No media available</div>'
            return
        }

        const value = typeof item === 'string' ? item : item.src || item.url || ''
        const isVideo = /\.(mp4|webm|ogg)$/i.test(value)

        sliderViewer.innerHTML = isVideo
            ? `<video class="slide-media" src="${value}" controls playsinline muted loop></video>`
            : `<img class="slide-media" src="${value}" alt="Property media" loading="lazy">`

        renderDots()
    }

    const renderDots = () => {
        if (!sliderDots) return
        sliderDots.innerHTML = mediaItems.map((_, dotIndex) => `
            <button class="slider-dot ${dotIndex === currentMediaIndex ? 'active' : ''}" aria-label="Slide ${dotIndex + 1}" data-index="${dotIndex}"></button>
        `).join('')
    }

    const updateControls = () => {
        if (!prevArrow || !nextArrow) return
        const visible = mediaItems.length > 1
        prevArrow.style.display = visible ? 'grid' : 'none'
        nextArrow.style.display = visible ? 'grid' : 'none'
    }

    const goToSlide = (index) => {
        if (!mediaItems.length) return
        currentMediaIndex = (index + mediaItems.length) % mediaItems.length
        renderSlide(currentMediaIndex)
        updateControls()
    }

    goToSlide(0)

    prevArrow?.addEventListener('click', () => goToSlide(currentMediaIndex - 1))
    nextArrow?.addEventListener('click', () => goToSlide(currentMediaIndex + 1))
    sliderDots?.addEventListener('click', (event) => {
        const dot = event.target.closest('.slider-dot')
        if (!dot) return
        goToSlide(Number(dot.dataset.index))
    })

    let startX = null
    sliderViewer?.addEventListener('pointerdown', (event) => {
        startX = event.clientX
        sliderViewer.setPointerCapture(event.pointerId)
    })

    sliderViewer?.addEventListener('pointerup', (event) => {
        if (startX === null) return
        const diff = event.clientX - startX
        if (diff > 50) goToSlide(currentMediaIndex - 1)
        else if (diff < -50) goToSlide(currentMediaIndex + 1)
        startX = null
    })

    sliderViewer?.addEventListener('pointercancel', () => {
        startX = null
    })
}

function updatePropertyDetails(selectedHouse) {
    // Update property title and location
    let propertyTitle = document.querySelector('.property-title')
    if (propertyTitle) {
        propertyTitle.textContent = selectedHouse.venue || 'Stylish property for rent'
    }

    let propertyLocation = document.querySelector('.property-location')
    if (propertyLocation) {
        propertyLocation.innerHTML = selectedHouse.location || 'Jos, Nigeria'
    }

    // Update description
    let descriptions = document.querySelector('.descriptions')
    if (descriptions) {
        descriptions.textContent = selectedHouse.description || 'A beautiful property with modern finishes and a calm, convenient location.'
    }

    // Update property meta values
    let metaId = document.querySelector('#meta-property-id')
    if (metaId) {
        metaId.textContent = selectedHouse.id || 'N/A'
    }

    let metaType = document.querySelector('#meta-property-type')
    if (metaType) {
        metaType.textContent = selectedHouse.servicetype ? selectedHouse.servicetype.charAt(0).toUpperCase() + selectedHouse.servicetype.slice(1) : 'N/A'
    }

    let metaBed = document.querySelector('#meta-property-bed')
    if (metaBed) {
        metaBed.textContent = selectedHouse.bedspace || 'N/A'
    }

    let metaBath = document.querySelector('#meta-property-bath')
    if (metaBath) {
        metaBath.textContent = selectedHouse.bathspace || 'N/A'
    }

    // Update fees: only show rows for fees present on the selected house object
    const setFeeRow = (selector, value) => {
        const feeEl = document.querySelector(selector);
        if (!feeEl) return;
        const row = feeEl.closest('.fee-row');

        if (value == null || value === '') {
            if (row) row.style.display = 'none';
            return;
        }

        if (row) row.style.display = '';
        feeEl.textContent = typeof value === 'number'
            ? '₦' + value.toLocaleString()
            : String(value).trim().startsWith('₦')
                ? String(value).trim()
                : '₦' + String(value).trim();
    };

    const numericValue = (value) => {
        if (value == null || value === '') return null;
        return typeof value === 'number'
            ? value
            : Number(String(value).replace(/[^0-9.-]/g, '')) || null;
    };

    setFeeRow('.basic-fee', selectedHouse.basicFee);
    setFeeRow('.agent-fee', selectedHouse.agentFee ?? (selectedHouse.basicFee ? selectedHouse.basicFee / 10 : null));
    setFeeRow('.caution-fee', selectedHouse.cautionFee);
    setFeeRow('.documentation-fee', selectedHouse.documentaton);
    setFeeRow('.inspection-fee', selectedHouse.inspection);

    const totalFee = document.querySelector('.total-fee');
    if (totalFee) {
        const totalValue = selectedHouse.totalFee != null
            ? selectedHouse.totalFee
            : [
                numericValue(selectedHouse.basicFee),
                numericValue(selectedHouse.agentFee) ?? (selectedHouse.basicFee ? selectedHouse.basicFee / 10 : 0),
                numericValue(selectedHouse.inspection)
            ].reduce((sum, amount) => sum + (amount || 0), 0);

        totalFee.textContent = typeof totalValue === 'number'
            ? '₦' + totalValue.toLocaleString()
            : '₦' + String(totalValue).trim();
    }
}

// Booking functionality
const getBookingOverlay = () => document.querySelector('.booking-modal-overlay')

const removeBookingOverlay = () => {
    const overlay = getBookingOverlay()
    if (overlay) overlay.remove()
}

const showBookingOverlay = ({ title, message, variant }) => {
    let overlay = getBookingOverlay()
    if (!overlay) {
        overlay = document.createElement('div')
        overlay.className = 'booking-modal-overlay'
        document.body.appendChild(overlay)
    }

    const iconHtml = variant === 'progress'
        ? '<div class="booking-spinner"></div>'
        : variant === 'success'
            ? `
                <svg class="booking-checkmark" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r="30" fill="none" />
                    <path d="M22 36 L30 44 L48 26" fill="none" />
                </svg>
            `
            : '<div class="booking-error-badge">!</div>'

    overlay.innerHTML = `
        <div class="booking-modal-card ${variant}">
            ${iconHtml}
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `
}

const showBookingProgress = () => {
    showBookingOverlay({
        title: 'Booking in progress',
        message: 'Please wait while we confirm your reservation.',
        variant: 'progress'
    })
}

const showBookingSuccess = () => {
    showBookingOverlay({
        title: 'Booking confirmed',
        message: 'Your home has been successfully reserved.',
        variant: 'success'
    })
}

const showBookingError = (message) => {
    showBookingOverlay({
        title: 'Booking failed',
        message: message || 'Please try again or contact support.',
        variant: 'error'
    })
}

// Booking functionality
document.addEventListener('DOMContentLoaded', function() {
    const bookingButton = document.querySelector('.bookings');
    const customerNameInput = document.getElementById('customer-name');
    const customerEmailInput = document.getElementById('customer-email');
    const customerPhoneInput=document.getElementById('customer-phone');
    
    if (bookingButton) {
        bookingButton.addEventListener('click', function(e) {
            e.preventDefault();

            const customerName = customerNameInput.value.trim();
            const customerEmail = customerEmailInput.value.trim();
            const customerPhone=customerPhoneInput.value.trim();
            if (!customerName || !customerEmail || !customerPhone) {
                alert('Please fill in all required fields.');
                return;
            }

            if (!selectedHouse) {
                alert('No property selected.');
                return;
            }

            // Prepare booking data - include all fees even if null
            const basicFee = selectedHouse.basicFee ?? null;
            const agentFee = basicFee ? basicFee / 10 : null;
            const cautionFee = selectedHouse.cautionFee ?? null;
            const documentationFee = selectedHouse.documentaton ?? null;
            const inspectionFee = selectedHouse.inspection ?? null;
            
            // Calculate total only from non-null fees
            const totalFee = [basicFee, agentFee, cautionFee, documentationFee, inspectionFee]
                .reduce((sum, fee) => sum + (fee || 0), 0);
            
            const bookingData = {
                timestamp: new Date().toISOString(),
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone,
                propertyId: selectedHouse.id,
                propertyVenue: selectedHouse.venue,
                propertyType: selectedHouse.servicetype,
                bedrooms: selectedHouse.bedspace,
                bathrooms: selectedHouse.bathspace,
                compoundSpace: selectedHouse.compoundspace,
                location: selectedHouse.location,
                basicFee: basicFee,
                agentFee: agentFee,
                documentationFee: documentationFee,
                cautionFee: cautionFee,
                inspectionFee: inspectionFee,
                totalFee: totalFee,
                
            };

            // Send to Google Sheets
            submitToGoogleSheets(bookingData);
        });
    }
});

function submitToGoogleSheets(data) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz5LOrZuI1CdOW8jFBkL1nlaECdJRtDSasU-W2-vVD0LCWPPOPbjnKNFSI9amW1B52QLA/exec';  
    // ← Make sure this is your CURRENT deployed web app URL

    const bookingButton = document.querySelector('.bookings');
    const originalText = bookingButton ? bookingButton.textContent : 'Book Now';
    if (bookingButton) {
        bookingButton.textContent = 'Booking...';
        bookingButton.disabled = true;
    }

    // Convert to FormData - this works reliably with Apps Script
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key] != null ? data[key] : '');
    });

    showBookingProgress()

    fetch(scriptURL, {
        method: 'POST',
        body: formData
        // Do NOT set Content-Type header (browser handles it)
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
    })
    .then(result => {
        console.log('Success response:', result);
        showBookingSuccess()

        const PhoneInput = document.getElementById('customer-phone');
        const nameInput = document.getElementById('customer-name');
        const emailInput = document.getElementById('customer-email');
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (PhoneInput) PhoneInput.value = '';

        setTimeout(removeBookingOverlay, 2200)
    })
    .catch(error => {
        console.error('Submission error:', error);
        showBookingError('Error submitting booking. Please try again.')
        setTimeout(removeBookingOverlay, 2400)
    })
    .finally(() => {
        if (bookingButton) {
            bookingButton.textContent = originalText;
            bookingButton.disabled = false;
        }
    });
}

// Load slider on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHouselisting()
})
