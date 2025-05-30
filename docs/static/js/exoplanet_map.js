// D3 Exoplanet Map using <svg>

const width = window.innerWidth * 0.65; // 65% of window width to match layout
const height = window.innerHeight * 0.7; // 80vh to match the container height

const svg = d3.select("#exoplanet-map")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "black");

const centerX = width / 2;
const centerY = height / 2;

const radiusScale = d3.scaleLinear()
    .domain([0, 10000])  
    .range([0, Math.min(centerX, centerY) - 40]);

const colorScale = d3.scaleOrdinal()
    .domain([
        "Gas Giant", "Super Earth", "Neptune-like",
        "Terrestrial", "Jupiter-like"
    ])
    .range(["#b730ff", "#3e0b9e", "#e77cd7", "#ff8e8e", "#ffb07c"]);

let allPlanets = [];
let currentYear = 1991;
let viewMode = 'chart'; // Toggle between 'chart' and 'description'
let exoChart = null;

// Planet type descriptions
const planetTypeDescriptions = {
    "Gas Giant": "Large planets composed mainly of hydrogen and helium, similar to Jupiter and Saturn in our solar system.",
    "Super Earth": "Rocky planets larger than Earth but smaller than Neptune, potentially habitable under right conditions.",
    "Terrestrial": "Rocky planets similar to Earth, Mars, Venus, and Mercury, with solid surfaces.",
    "Neptune-like": "Ice giants with thick atmospheres, similar to Neptune and Uranus in our solar system."
};

var playButton = document.getElementById('play-button');

function polarToCartesian(distance, angleRad) {
    const r = radiusScale(+distance);
    return [
        centerX + r * Math.cos(angleRad),
        centerY + r * Math.sin(angleRad)
    ];
}

function drawYear(year) {
    const newPlanets = allPlanets.filter(p => +p.discovery_year === year);
    
    svg.selectAll(`.planet-glow-${year}`)
        .data(newPlanets)
        .enter()
        .append("circle")
        .attr("cx", d => polarToCartesian(+d.distance, +d.random_angle_rad)[0])
        .attr("cy", d => polarToCartesian(+d.distance, +d.random_angle_rad)[1])
        .attr("r", 6) // bigger "aura"
        .attr("fill", "white")
        .attr("opacity", 0.05)
        .attr("class", `planet-glow-${year}`);

    svg.selectAll(`.planet-${year}`)
        .data(newPlanets)
        .enter()
        .append("circle")
        .attr("cx", d => polarToCartesian(+d.distance, +d.random_angle_rad)[0])
        .attr("cy", d => polarToCartesian(+d.distance, +d.random_angle_rad)[1])
        .attr("r", 2)
        .attr("fill", "white")
        .attr("opacity", d => d.stellar_magnitude_scaled)
        .attr("class", `planet-${year}`);
}

function animateYears() {
    const interval = setInterval(() => {
        currentYear++;
        if (currentYear > 2023) {
            clearInterval(interval);
            return;
        }
        drawYear(currentYear);
        updateSidebar(currentYear);
    }, 450);
}

//---------------------------------------------------------------------
// Sidebar functionality

function updateSidebar(year) {
    const data = allPlanets.filter(p => +p.discovery_year <= year);
    
    if (viewMode === 'chart') {
        updateChart(year);
    } else {
        updateDescriptions(year);
    }
    
    // Update year display and progress bar
    document.getElementById("exo-current-year").textContent = year;
    document.getElementById("exo-year-range").value = year;
    updateProgressBar(year);
}

function updateProgressBar(year) {
    const progress = ((year - 1991) / (2023 - 1991)) * 100;
    const rangeInput = document.getElementById("exo-year-range");
    rangeInput.style.setProperty('--progress', `${progress}%`);
}

function updateChart(selectedYear) {
    const data = allPlanets.filter(p => +p.discovery_year <= selectedYear);
    
    // Count planets by type
    const typeCounts = {};
    const planetTypes = ["Gas Giant", "Super Earth", "Terrestrial", "Neptune-like"];
    
    planetTypes.forEach(type => typeCounts[type] = 0);
    
    data.forEach(planet => {
        if (planet.planet_type && typeCounts.hasOwnProperty(planet.planet_type)) {
            typeCounts[planet.planet_type]++;
        }
    });
    
    const labels = planetTypes;
    const chartData = planetTypes.map(type => typeCounts[type]);
    const backgroundColors = planetTypes.map(type => colorScale(type));
    
    // Ensure we have a canvas element
    const chartBox = document.getElementById('chart-box');
    if (!document.getElementById('exo-chart')) {
        chartBox.innerHTML = '<canvas id="exo-chart"></canvas>';
        // Chart was destroyed, need to recreate
        if (exoChart) {
            exoChart = null;
        }
    }
    
    if (exoChart) {
        // Update existing chart smoothly
        exoChart.data.labels = labels;
        exoChart.data.datasets[0].data = chartData;
        exoChart.data.datasets[0].backgroundColor = backgroundColors;
        exoChart.update();
    } else {
        // Create chart for the first time or after toggle
        const ctx = document.getElementById('exo-chart').getContext('2d');
        exoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
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
                    x: {
                        ticks: { 
                            font: { family: 'Orbitron', size: 10 },
                            color: '#00ffe0'
                        }, 
                        beginAtZero: true, 
                        title: {
                            display: true, 
                            text:'Discovered Planets', 
                            font: { family: 'Orbitron', size: 12 },
                            color: '#00ffe0'
                        },
                        grid: { color: '#333' }
                    },
                    y: {
                        ticks: { 
                            font: { family: 'Orbitron', size: 10 },
                            color: '#00ffe0'
                        },
                        title: { 
                            display: true, 
                            text: 'Planet Type', 
                            font: { family: 'Orbitron', size: 12 },
                            color: '#00ffe0'
                        },
                        grid: { color: '#333' }
                    }
                }
            }
        });
    }
}

function updateDescriptions(selectedYear) {
    const panel = document.getElementById('chart-box');
    
    panel.innerHTML = `
        <div style="padding: 20px; text-align: left; line-height: 1.6;">
            <h3 style="color: #00ffe0; margin-bottom: 20px; text-align: center;">Exoplanet Types</h3>
            
            <div class="planet-description">
                <div class="planet-name">Gas Giant</div>
                <div class="planet-details">
                    Large planets composed mainly of hydrogen and helium, similar to Jupiter and Saturn in our solar system. 
                    These massive worlds often have thick atmospheres and may host numerous moons.
                </div>
            </div>
            
            <div class="planet-description">
                <div class="planet-name">Super Earth</div>
                <div class="planet-details">
                    Rocky planets larger than Earth but smaller than Neptune. They may have the potential for habitability 
                    under the right conditions, with possible thick atmospheres and surface water.
                </div>
            </div>
            
            <div class="planet-description">
                <div class="planet-name">Terrestrial</div>
                <div class="planet-details">
                    Rocky planets similar to Earth, Mars, Venus, and Mercury, with solid surfaces. These are the most 
                    Earth-like planets and prime candidates for studying potential habitability.
                </div>
            </div>
            
            <div class="planet-description">
                <div class="planet-name">Neptune-like</div>
                <div class="planet-details">
                    Ice giants with thick atmospheres, similar to Neptune and Uranus in our solar system. They typically 
                    have substantial amounts of water, methane, and ammonia in their atmospheres.
                </div>
            </div>
        </div>
    `;
}

//---------------------------------------------------------------------
// Button toggle functionality

function setActiveButton(mode) {
    const chartBtn = document.getElementById('chart-toggle');
    const descBtn = document.getElementById('desc-toggle');
    
    if (mode === 'chart') {
        chartBtn.style.backgroundColor = '#00ffe0';
        chartBtn.style.color = '#0d1117';
        chartBtn.style.boxShadow = '0 0 10px 2px #00ffe0';

        descBtn.style.backgroundColor = '#1f2d36';
        descBtn.style.color = '#00ffe0';
        descBtn.style.boxShadow = 'none';
    } else {
        descBtn.style.backgroundColor = '#00ffe0';
        descBtn.style.color = '#0d1117';
        descBtn.style.boxShadow = '0 0 10px 2px #00ffe0';

        chartBtn.style.backgroundColor = '#1f2d36';
        chartBtn.style.color = '#00ffe0';
        chartBtn.style.boxShadow = 'none';
    }
}

// Initialize button listeners
document.addEventListener('DOMContentLoaded', function() {
    const chartBtn = document.getElementById('chart-toggle');
    const descBtn = document.getElementById('desc-toggle');
    
    chartBtn.addEventListener('click', () => {
        viewMode = 'chart';
        setActiveButton(viewMode);
        updateSidebar(currentYear);
    });

    descBtn.addEventListener('click', () => {
        viewMode = 'description';
        setActiveButton(viewMode);
        updateSidebar(currentYear);
    });
    
    // Set initial button state
    setActiveButton(viewMode);
});

//---------------------------------------------------------------------
// Add a scale
const r = radiusScale(2000);  // converts LY to pixel distance


//---------------------------------------------------------------------
// Load data and initialize

d3.csv("../static/data/nasa_exoplanets.csv").then(data => {
    allPlanets = data;
    updateSidebar(currentYear); // Initialize sidebar
    // animateYears();
    // Draw distance scale bar
    const scaleGroup = svg.append("g")
    .attr("class", "scale-bar")
    .attr("transform", `translate(${width - 140}, ${height - 50})`);

    const barLength = radiusScale(2000);

    scaleGroup.append("line")
    .attr("x1", 0)
    .attr("x2", barLength)
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke", "white")
    .attr("stroke-width", 2);

    scaleGroup.append("text")
    .attr("x", barLength / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#00ffe0")
    .style("font-family", "Orbitron")
    .style("font-size", "12px")
    .text("2000 light years");

});

//---------------------------------------------------------------------
// Configuration of the button to play automatically

let isPlaying = false;
let interval = null;

const playBtn = document.getElementById("exo-play-button");
playBtn.innerHTML = '▶';

playBtn.addEventListener("click", () => {
    if (!isPlaying && currentYear >= 2023) {
        // Reset if we're at the end
        currentYear = 1991;
        svg.selectAll("circle").remove();
        updateSidebar(currentYear);
    }

    isPlaying = !isPlaying;
    playBtn.innerHTML = isPlaying ? "⏸" : "▶";

    if (isPlaying) {
        interval = setInterval(() => {
            if (currentYear < 2023) {
                currentYear++;
                drawYear(currentYear);
                updateSidebar(currentYear);
            } else {
                clearInterval(interval);
                isPlaying = false;
                playBtn.innerHTML = "▶";
            }
        }, 450);
    } else {
        clearInterval(interval);
    }
});

//---------------------------------------------------------------------
