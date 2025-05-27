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

var yearRange = document.getElementById('year-range');
var currentYearElement = document.getElementById('current-year');
var statusFilter = document.getElementById('launch-status');
var playButton = document.getElementById('play-button');

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

    const selectedStatus = launchStatus;
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
// Names of the tops countries and companies, as well as descriptions

const topCountries = ["Russia", "USA", "Kazakhstan", "China", "France", "Japan", "India"];
const topCompanies = ["RVSN USSR", "CASC", "Arianespace", "General Dynamics", "VKS RF", "NASA", "SpaceX", 'ULA', 'Boeing', 'US Air Force'];

const companyDescriptions = {
  "RVSN USSR": "The Strategic Missile Forces of the USSR, established in the late 1950s, were responsible for many of the Soviet Union's early space launches during the Cold War.",
  "CASC": "The China Aerospace Science and Technology Corporation, established in 1999, is the main contractor for the Chinese space program and operates the Long March rocket family.",
  "Arianespace": "A European launch service provider founded in 1980 and based in France. It operates Ariane, Vega, and Soyuz launches primarily from French Guiana.",
  "General Dynamics": "An American defense company active during the Cold War, known for producing the Atlas rockets used by NASA and the U.S. Air Force.",
  "VKS RF": "The Russian Aerospace Forces, established after the Cold War, inherited military space operations from the Soviet Union and manage many of Russia's government and military satellite launches.",
  "NASA": "The National Aeronautics and Space Administration, established in 1958, is the U.S. government agency responsible for civilian space exploration, scientific missions, and human spaceflight.",
  "SpaceX": "An American aerospace company founded by Elon Musk in 2002. It is known for the Falcon 9 and Falcon Heavy rockets and for pioneering reusable launch systems.",
  "ULA": "United Launch Alliance is a joint venture between Boeing and Lockheed Martin, created in 2006 to consolidate U.S. government space launches. It operates the Atlas V and Delta IV rockets.",
  "Boeing": "An American aerospace company involved in satellite manufacturing and space systems. It has contributed to the Delta rocket family and partners in ULA and the Starliner spacecraft.",
  "US Air Force": "Historically managed most U.S. military satellite launches during the Cold War, using Titan and Atlas rockets. Its role is now partly continued by the U.S. Space Force.",
  "Other": "All other companies not listed individually."
};

//---------------------------------------------------------------------
// Function to update the bar chart in function of the year selected
let countryChart = null;

function updateChart(selectedYear) {
    const selectedStatus = launchStatus;
    const counts = {};

    allLaunches.forEach(launch => {
        const year = parseInt(launch["Date"].slice(0, 4));
        const status = launch["MissionStatus"]?.toLowerCase();

        if (year <= selectedYear && status === selectedStatus) {
            const key = launch[sortBy === 'country' ? 'Country' : 'Company']?.trim();
            if (key) {
                counts[key] = (counts[key] || 0) + 1;
            }
        }
    });

    const topKeys = sortBy === 'country' ? topCountries : topCompanies;

    // Filter only top countries/companies, compute "Other"
    const filteredCounts = topKeys.map(key => [key, counts[key] || 0]);
    const otherSum = Object.entries(counts)
        .filter(([key]) => !topKeys.includes(key))
        .reduce((sum, [, value]) => sum + value, 0);

    // Sorting
    filteredCounts.sort((a, b) => b[1] - a[1]);

    const labels = [...filteredCounts.map(([key]) => key), "Other"];
    const data = [...filteredCounts.map(([_, value]) => value), otherSum];

    if (countryChart) {
        countryChart.data.labels = labels;
        countryChart.data.datasets[0].data = data;
        countryChart.data.datasets[0].backgroundColor = selectedStatus === 'success' ? 'rgba(0, 128, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)';
        countryChart.data.datasets[0].borderColor = selectedStatus === 'success' ? 'green' : 'red';
        countryChart.options.scales.y.title.text = capitalize(sortBy);
        countryChart.update();
    } else {
        const ctx = document.getElementById('country-chart').getContext('2d');
        countryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
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
                plugins: {
                    legend: {display: false}
                },
                scales: {
                    x: {ticks: { font: { family: 'Orbitron', size: 10 }}, beginAtZero: true, title: {display: true, text:'Launches', font: { family: 'Orbitron', size: 12 }}},
                    y: {ticks: { font: { family: 'Orbitron', size: 10 } },title: { display: true, text: capitalize(sortBy), font: { family: 'Orbitron', size: 12 }}}
                },
                //add the description box when clicking
                onClick: (evt, elements) => {
                    const box = document.getElementById("description-box");
                    const header = document.getElementById("description-header");
                    const popup = document.getElementById("description-popup");                
                    if (elements.length > 0 && sortBy === 'company') {
                        const index = elements[0].index;
                        const label = countryChart.data.labels[index];                
                        const description = companyDescriptions[label]; 
                        header.innerText = label;
                        popup.innerText = description;
                        box.style.left = (evt.native.clientX) + "px";
                        box.style.top = (evt.native.clientY) + "px";
                        box.style.display = "block";
                    }
                },
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

//---------------------------------------------------------------------
// Configuration of the button to switch the sorting between country / company
let sortBy = 'country';

document.getElementById('sort-toggle').addEventListener('click', () => {
    sortBy = (sortBy === 'country') ? 'company' : 'country';
    document.getElementById('sort-toggle').textContent = `Sort: ${capitalize(sortBy)}`;
    updateChart(parseInt(document.getElementById("year-range").value));
});

let launchStatus = 'success';

document.getElementById('status-toggle').addEventListener('click', () => {
    launchStatus = (launchStatus === 'success') ? 'failure' : 'success';
    const btn = document.getElementById('status-toggle');
    btn.textContent = `${capitalize(launchStatus)}`;
    btn.style.backgroundColor = launchStatus === 'success' ? '#00ff00c1' : '#ff0000';
    btn.style.boxShadow = launchStatus === 'success'  ? '0 0 10px 2px #00ff00c1' : '0 0 10px 2px #ff0000';
    updateChart(parseInt(document.getElementById("year-range").value));
    updateMarkers(parseInt(document.getElementById("year-range").value));
});

//---------------------------------------------------------------------
// Configuration of the button to play automatically

let isPlaying = false;
let interval = null;
playButton.innerHTML = '▶';

playButton.addEventListener('click', () => {

    // Loop back if it's at the end
    if (!isPlaying && yearRange.value == 2022) {
        yearRange.value = 1957;
        currentYearElement.textContent = 1957;
        updateMarkers(1957);
        updateChart(1957);
    } 

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
// Remove when clicking anywhere else

document.addEventListener("click", (e) => {
    const box = document.getElementById("description-box");
    if (!box.contains(e.target)){
        box.style.display = "none";}
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

//---------------------------------------------------------------------
// Helper function for the labels

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
