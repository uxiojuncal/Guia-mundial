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
    
    // Create a div icon with rounded image
    const markerDiv = document.createElement('div');
    markerDiv.className = 'stadium-marker';
    
    const img = document.createElement('img');
    img.className = 'stadium-marker-img';
    img.alt = props.name;
    img.src = props.image_url;
    img.onerror = () => {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"%3E%3Crect width="256" height="256" fill="%232f7d32"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="white" font-family="Arial"%3E🏟️%3C/text%3E%3C/svg%3E';
    };
    
    markerDiv.appendChild(img);
    
    const icon = L.divIcon({
        html: markerDiv.outerHTML,
        iconSize: [52, 52],
        iconAnchor: [26, 52],
        popupAnchor: [0, -52],
        className: 'stadium-div-icon'
    });
    
    return L.marker(latlng, { icon }).bindPopup(createPopup(props), {
        className: 'stadium-popup',
        maxWidth: 280
    });
}

// Function to create popup content
function createPopup(props) {
    return `
        <div>
            <h4 class="stadium-popup-header">${props.name}</h4>
            <p class="stadium-popup-info"><strong>City:</strong> ${props.city}</p>
            <p class="stadium-popup-info"><strong>Country:</strong> ${props.country}</p>
            <p class="stadium-popup-info"><strong>Capacity:</strong> ${props.capacity.toLocaleString()}</p>
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
