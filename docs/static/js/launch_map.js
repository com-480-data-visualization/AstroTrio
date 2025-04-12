var map = L.map('map').setView([30, 8], 2);

var dayLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
});
var nightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; Carto',
    subdomains: 'abcd'
});
var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '&copy; Esri'
});
dayLayer.addTo(map);

let currentBaseLayer = dayLayer;

document.getElementById('map-style').addEventListener('change', function(e) {
    map.removeLayer(currentBaseLayer);

    if (e.target.value === 'night') {
        currentBaseLayer = nightLayer;
    } else if (e.target.value === 'satellite') {
        currentBaseLayer = satelliteLayer;
    } else {
        currentBaseLayer = dayLayer;
    }
    currentBaseLayer.addTo(map);
});

var yearRange = document.getElementById('year-range');
var currentYearElement = document.getElementById('current-year');

yearRange.addEventListener('input', function() {
    currentYearElement.textContent = yearRange.value;
});


const markerLayer = L.layerGroup().addTo(map);
const allLaunches = [];

fetch('static/data/launch_data.csv')
    .then(response => response.text())
    .then(csvText => {
        console.log("CSV loaded");
        const lines = csvText.trim().split('\n');
        let headers = lines[0].split(',').map(h => h.trim());

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            const launch = {};
            for (let j = 0; j < headers.length; j++) {
                launch[headers[j]] = row[j];
            }
            console.log(launch["Date"], launch["Latitude"], launch["Longitude"]);
            allLaunches.push(launch);
        }

        updateMarkers(+yearRange.value);
    });

function updateMarkers(selectedYear) {
    markerLayer.clearLayers();

    allLaunches.forEach(launch => {
        const year = parseInt(launch["Date"].slice(0, 4));

        if (year === selectedYear) {
            const lat = parseFloat(launch["Latitude"]);
            const lon = parseFloat(launch["Longitude"]);

            if (!isNaN(lat) && !isNaN(lon)) {
                const color = launch["MissionStatus"] === "Success" ? 'green' : 'red';
                L.circleMarker([lat, lon], {
                    radius: 4,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7
                }).bindPopup(`
                    <strong>${launch["Mission"]}</strong><br>
                    ${launch["Company"]}<br>
                    ${launch["Date"]}
                `).addTo(markerLayer);
            }
        }
    });
}

yearRange.addEventListener('input', function() {
    const selectedYear = +yearRange.value;
    currentYearElement.textContent = selectedYear;
    updateMarkers(selectedYear);
});
