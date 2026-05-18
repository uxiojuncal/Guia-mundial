// Initialize map centered on North America
const map = L.map('map').setView([39.8, -95.7], 4);

// Add OSM tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 2
}).addTo(map);

// Function to create custom marker with rounded image
function createStadiumMarker(feature, latlng) {
    const props = feature.properties;

    const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"%3E%3Crect width="256" height="256" fill="%232f7d32"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="white" font-family="Arial"%3E🏟️%3C/text%3E%3C/svg%3E';
    const imageUrl = props.image_url || fallbackImage;
    const safeName = props.name.replace(/"/g, '&quot;');
    const countryClass = `stadium-marker--${props.country.toLowerCase().replace(/\s+/g, '-')}`;

    const markerMarkup = `
        <div class="stadium-marker ${countryClass}">
            <div class="stadium-marker-frame">
                <span class="stadium-marker-image-wrap">
                    <img class="stadium-marker-img" alt="${safeName}" src="${imageUrl}" onerror="this.onerror=null;this.src='${fallbackImage}'">
                </span>
            </div>
        </div>
    `;
    
    const icon = L.divIcon({
        html: markerMarkup,
        iconSize: [60, 60],
        iconAnchor: [30, 60],
        popupAnchor: [0, -60],
        className: 'stadium-div-icon'
    });
    
    return L.marker(latlng, { icon }).bindPopup(createPopup(props), {
        className: 'stadium-popup',
        minWidth: 190,
        maxWidth: 260
    });
}

// Function to create popup content
function createPopup(props) {
    return `
        <div class="stadium-popup-card">
            <img src="${props.image_url}" alt="${props.name}" class="stadium-popup-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 256 256%22%3E%3Crect width=%22256%22 height=%22256%22 fill=%22%232f7d32%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2232%22 fill=%22white%22 font-family=%22Arial%22%3E🏟️%3C/text%3E%3C/svg%3E';">
            <div class="stadium-popup-details">
                <h4 class="stadium-popup-header ${props.country}">${props.name}</h4>
                <p class="stadium-popup-info"><strong>Ciudad:</strong> ${props.city}</p>
                <p class="stadium-popup-info"><strong>País:</strong> ${props.country}</p>
                <p class="stadium-popup-info"><strong>Capacidad:</strong> ${props.capacity.toLocaleString()}</p>
            </div>
        </div>
    `;
}

// Load and render GeoJSON
fetch('./estdios.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: createStadiumMarker
        }).addTo(map);
        
        // Optional: fit map bounds to all markers
        const group = L.featureGroup();
        L.geoJSON(data).eachLayer(layer => group.addLayer(layer));
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
