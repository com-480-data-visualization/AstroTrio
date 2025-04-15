//---------------------------------------------------------------------
// Adding the night map layer with leaftlet  
var map = L.map('map').setView([30, 17], 2.4);

var nightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    minZoom: 1.9,
    maxZoom: 18,
    attribution: '&copy; Carto',
    subdomains: 'abcd'
});
nightLayer.addTo(map);

//---------------------------------------------------------------------
// Loading CSV file launch_data.csv, get longitude, latitude, etc... 
const markerLayer = L.layerGroup().addTo(map);
const allLaunches = [];

fetch('../static/data/launch_data.csv')
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
            console.log(launch["Date"], launch["Latitude"], launch["Longitude"], launch["Country"]);
            allLaunches.push(launch);
        }
        //display 1957 at the start
        updateMarkers(+yearRange.value);
        updateChart(+yearRange.value);
    });

//---------------------------------------------------------------------
// Function to update the point in function of the year selected
function updateMarkers(selectedYear) {
    markerLayer.clearLayers();

    const selectedStatus = statusFilter.value;
    const locationMap = {};

    allLaunches.forEach(launch => {
        const year = parseInt(launch["Date"].slice(0, 4));
        const status = launch["MissionStatus"]?.toLowerCase();
        
        if (year <= selectedYear && status === selectedStatus) {
            const lat = parseFloat(launch["Latitude"]);
            const lon = parseFloat(launch["Longitude"]);
            const key = `${lat},${lon}`;

            if (!locationMap[key]) {
                locationMap[key] = {
                    lat: lat,
                    lon: lon,
                    count: 0,
                    country: launch["Country"],
                    locationName: launch["Location"],
                };
            }
            locationMap[key].count++;
        }
    });

    for (const key in locationMap) {
        const { lat, lon, country, locationName, count } = locationMap[key];
        const radius = 1 + 0.8 * Math.log2(count*count);
        const popupContent = `<strong>${country}</strong> <br> ${locationName} <br> <strong>${count} launches</strong>`;

        const color = selectedStatus === 'success' ? 'green' : 'red';

        L.circleMarker([lat, lon], {
            radius: radius,
            color: color,
            fillColor: color,
            fillOpacity: 0.7
        }).bindPopup(popupContent).addTo(markerLayer);
    }
}


//---------------------------------------------------------------------
// Function to update the graph in function of the year selected
let countryChart = null;

function updateChart(selectedYear) {
    const selectedStatus = statusFilter.value;
    const countryCounts = {};
    const orderedCountries = ["Russia", "USA", "Kazakhstan", "China", "France", "Japan", "India", "Other"];

    allLaunches.forEach(launch => {
        const year = parseInt(launch["Date"].slice(0, 4));
        const status = launch["MissionStatus"]?.toLowerCase();
        
        if (year <= selectedYear && status === selectedStatus) {
            const country = launch["Country"].trim();
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        }
    });

    const data = orderedCountries.map(country => countryCounts[country] || 0);
    
    if (countryChart) {
        countryChart.data.labels = orderedCountries;
        countryChart.data.datasets[0].data = data;
        countryChart.data.datasets[0].backgroundColor = selectedStatus === 'success' ? 'rgba(0, 128, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)';
        countryChart.data.datasets[0].borderColor = selectedStatus === 'success' ? 'green' : 'red';
        countryChart.update();
    }
    else {
        const ctx = document.getElementById('country-chart').getContext('2d');
        countryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: orderedCountries,
                datasets: [{
                    data: data,
                    backgroundColor: selectedStatus === 'success' ? 'rgba(0, 128, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)',
                    borderColor: selectedStatus === 'success' ? 'green' : 'red',
                    borderWidth: 1
                    }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                responsive: true,
                plugins: {legend: {display: false}
                },
                scales: {
                    x: {ticks: {font: {family: 'Orbitron',size:10}},beginAtZero: true,title: {display: true, text: 'Launches',font: {family: 'Orbitron',size: 12}}},
                    y: {ticks: {font: {family: 'Orbitron',size:10}},title: {display: true, text: 'Country',font: {family: 'Orbitron',size: 12}}}
                }
            }
        });
    }
}


//---------------------------------------------------------------------
// Configuration of the button to play automatically

var yearRange = document.getElementById('year-range');
var currentYearElement = document.getElementById('current-year');
var statusFilter = document.getElementById('launch-status');
var playButton = document.getElementById('play-button');

let isPlaying = false;
let interval = null;
playButton.innerHTML = '▶';

playButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playButton.innerHTML = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
        interval = setInterval(() => {
            let currentYear = +yearRange.value;
            if (currentYear < 2022) { 
                yearRange.value = currentYear + 1;
                currentYearElement.textContent = currentYear + 1;
                updateMarkers(currentYear);
                updateChart(currentYear);
            }
            else {  // end of animation
                clearInterval(interval);
                isPlaying = false;
                playButton.innerHTML = '▶';
            }
        }, 400); //speed of the button
    }
    else {clearInterval(interval);
    }
});

//---------------------------------------------------------------------
// Updating when we move with the cursor

yearRange.addEventListener('input', function() {
    const selectedYear = +yearRange.value;
    currentYearElement.textContent = selectedYear;
    updateMarkers(selectedYear);
    updateChart(selectedYear);
});

statusFilter.addEventListener('change', () => {
    const selectedYear = +yearRange.value;
    updateMarkers(selectedYear);
    updateChart(selectedYear);
});
