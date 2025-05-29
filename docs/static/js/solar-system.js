// --- Sidebar for planet info ---
let planetData = {};
d3.csv("../static/data/planets_updated.csv").then(data => {
  console.log("CSV data loaded:", data); // Debug log
  data.forEach(d => {
    planetData[d.Planet.trim().toLowerCase()] = d;
  });
  console.log("Processed planet data:", planetData); // Debug log
});

// Add click listeners to planets
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM Content Loaded"); // Debug log
  const planets = [
    "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "moon", "sun"
  ];
  planets.forEach(planet => {
    const el = document.querySelector(`.${planet}-body`);
    console.log(`Looking for ${planet}-body:`, el); // Debug log
    if (el) {
      console.log(`Attaching click event to: ${planet}`); // Debug log
      el.addEventListener("click", () => {
        console.log(`Clicked on ${planet}`); // Debug log
        showSidebar(planet);
      });
      el.addEventListener("mouseenter", () => el.classList.add("active"));
      el.addEventListener("mouseleave", () => el.classList.remove("active"));
    } else {
      console.warn(`No element found for: ${planet}`); // Debug log
    }
  });

  document.getElementById("closeSidebar").onclick = () => {
    document.getElementById("planetSidebar").classList.remove("active");
  };
  // Close sidebar on outside click
  document.addEventListener("click", function(e) {
    const sidebar = document.getElementById("planetSidebar");
    if (
      sidebar.contains(e.target) ||
      e.target.classList.contains("planet-body")
    ) return;
    sidebar.classList.remove("active");
  });

  // Attach D3 tooltip events after all planets are in the DOM
  d3.selectAll('.planet-body')
    .on('mouseover', function(event) {
      // Get the planet name from the class, e.g. "earth-body"
      const classList = this.classList;
      let planet = null;
      classList.forEach(cls => {
        if (cls.endsWith('-body')) {
          planet = cls.replace('-body', '');
        }
      });
      if (!planet) return;
      // Lookup data for this planet
      const d = planetData[planet];
      if (!d) return;
      tooltip
        .html(`
          <div style="font-size:1.3em;color:#00ffe0;text-shadow:0 0 8px #00ffe0,0 0 2px #fff;margin-bottom:0.5em;">
            ${d.Planet}
          </div>
          <div><b>Distance from Sun:</b> ${d["Distance from Sun (10^6 km)"]} × 10⁶ km</div>
          <div><b>Orbital Period:</b> ${d["Orbital Period (days)"]} days</div>
          <div><b>Orbital Velocity:</b> ${d["Orbital Velocity (km/s)"]} km/s</div>
          <div><b>Orbital Inclination:</b> ${d["Orbital Inclination (degrees)"]}°</div>
          <div><b>Obliquity to Orbit:</b> ${d["Obliquity to Orbit (degrees)"]}°</div>
          <div><b>Rotation Period:</b> ${d["Rotation Period (hours)"]} hours</div>
          <div><b>Length of Day:</b> ${d["Length of Day (hours)"]} hours</div>
        `)
        .style("left", (event.pageX + 24) + "px")
        .style("top", (event.pageY - 24) + "px")
        .style("opacity", 1);
    })
    .on('mousemove', function(event) {
      tooltip
        .style("left", (event.pageX + 24) + "px")
        .style("top", (event.pageY - 24) + "px");
    })
    .on('mouseout', function() {
      tooltip.style("opacity", 0);
    });
});

function showSidebar(planet) {
  console.log("Showing sidebar for planet:", planet); // Debug log
  console.log("Available planet data:", planetData); // Debug log
  if (planet === 'sun') {
    console.log('planetData["sun"]:', planetData["sun"]); // Debug log
  }
  let data;
  let note = '';
  if (planet === 'moon') {
    // Use the CSV row for Earth's Moon
    data = planetData["earth's moon"];
    note = '<div style="color:#ffb347; font-size:1em; margin-bottom:1em;">Note: The Moon is not a planet, but Earth\'s natural satellite.</div>';
  } else if (planet === 'pluto') {
    // Use the CSV row for Pluto
    data = planetData["pluto"];
    note = '<div style="color:#ffb347; font-size:1em; margin-bottom:1em;">Note: Pluto is classified as a dwarf planet.</div>';
  } else if (planet === 'sun') {
    // Use the CSV row for Sun
    data = planetData["sun"];
    note = '<div style="color:#ffb347; font-size:1em; margin-bottom:1em;">Note: The Sun is not a planet, but the star at the center of our solar system.</div>';
  } else {
    data = planetData[planet];
  }
  console.log("Data for planet:", data); // Debug log
  if (!data) return;
  
  // Format the data for display
  const formatValue = (key, value) => {
    if (value === "Unknown" || value === "No" || value === "0" || !value) return null;
    
    // Add units and formatting based on the key
    switch(key) {
      case "Mass (10^24kg)":
        return `${value} × 10²⁴ kg`;
      case "Diameter (km)":
        return `${value} km`;
      case "Density (kg/m^3)":
        return `${value} kg/m³`;
      case "Surface Gravity(m/s^2)":
        return `${value} m/s²`;
      case "Escape Velocity (km/s)":
        return `${value} km/s`;
      case "Rotation Period (hours)":
        return `${value} hours`;
      case "Length of Day (hours)":
        return `${value} hours`;
      case "Distance from Sun (10^6 km)":
        return `${value} × 10⁶ km`;
      case "Orbital Period (days)":
        return `${value} days`;
      case "Orbital Velocity (km/s)":
        return `${value} km/s`;
      case "Orbital Inclination (degrees)":
        return `${value}°`;
      case "Obliquity to Orbit (degrees)":
        return `${value}°`;
      case "Mean Temperature (C)":
        return `${value}°C`;
      case "Surface Pressure (bars)":
        return `${value} bars`;
      case "Number of Moons":
        return value;
      case "Ring System?":
        return value === "Yes" ? "Has rings" : "No rings";
      case "Global Magnetic Field?":
        return value === "Yes" ? "Has magnetic field" : "No magnetic field";
      case "Surface Temperature (C)":
        return value;
      case "Atmospheric Pressure (bars)":
        return value === "Trace" ? value : `${value} bars`;
      default:
        return value;
    }
  };

  let html = `<h2 style="text-align:center;color:#00ffe0;font-family:'Orbitron',sans-serif;font-size:2em;font-weight:bold;margin-bottom:0.2em;letter-spacing:1px;text-shadow:0 0 8px #00ffe0,0 0 2px #fff;">${data.Planet}</h2>`;
  if (note) html += note;
  html += `<div style="text-align:center;color:#00ffe0;font-family:'Orbitron',sans-serif;font-size:1.3em;font-weight:bold;margin-bottom:0.5em;letter-spacing:1px;text-shadow:0 0 8px #00ffe0,0 0 2px #fff;">General Characteristics</div>`;
  html += `<div id="chartFilter" style="margin-bottom: 1em; text-align: center;">
    <button id="showRadar" class="chart-toggle active">Radar Chart</button>
    <button id="showBar" class="chart-toggle">Bar Chart</button>
  </div>`;
  html += '<div id="radarChart" style="width:340px;height:340px;margin:0 auto 0.5em auto;"></div>';
  html += '<div id="physBarChart" style="width:340px;height:340px;margin:0 auto 0.5em auto;display:none;"></div>';
  html += '<div id="featureBadges" style="margin-bottom:1em;text-align:center;min-height:70px;"></div>';
  html += '<ul>';
  // Group related data
  const groups = {
    "Physical Characteristics": [
      "Mass (10^24kg)", "Diameter (km)", "Density (kg/m^3)", 
      "Surface Gravity(m/s^2)", "Escape Velocity (km/s)"
    ],
    "Features": [
      "Number of Moons", "Ring System?", "Global Magnetic Field?",
      "Surface Features", "Composition"
    ]
  };
  // Remove old features list from the bottom
  for (const [groupName, keys] of Object.entries(groups)) {
    if (groupName === "Physical Characteristics" || groupName === "Features") continue;
    const groupData = keys
      .map(key => {
        const value = formatValue(key, data[key]);
        return value ? `<li><b>${key}:</b> ${value}</li>` : null;
      })
      .filter(Boolean);
    if (groupData.length > 0) {
      html += `<li class="group-header">${groupName}</li>`;
      html += groupData.join('');
    }
  }
  html += "</ul>";
  document.getElementById("sidebarContent").innerHTML = html;
  document.getElementById("planetSidebar").classList.add("active");

  // --- D3 Feature Badges for categorical features ---
  function renderFeatureBadges(features, selector) {
    const container = d3.select(selector).html("");
    const badge = container.selectAll(".feature-badge")
      .data(features)
      .enter()
      .append("div")
      .attr("class", "feature-badge")
      .style("display", "inline-block")
      .style("margin", "0 8px 8px 0")
      .style("padding", "7px 16px")
      .style("border-radius", "16px")
      .style("background", d => {
        if (d.label === "Rings" || d.label === "Magnetic Field") {
          if (d.value === "Yes") return "#00ff99"; // green
          if (d.value === "No") return "#ff2222"; // true red
        }
        if (d.value === "Yes") return "#00ffe0";
        if (d.value === "No") return "#ffb347";
        return "#222";
      })
      .style("color", d => {
        if (d.label === "Rings" || d.label === "Magnetic Field") {
          if (d.value === "Yes") return "#181c20";
          if (d.value === "No") return "#fff";
        }
        if (d.value === "Yes") return "#181c20";
        if (d.value === "No") return "#181c20";
        return "#aaffee";
      })
      .style("font-weight", "bold")
      .style("font-size", "1.08em")
      .style("box-shadow", d => {
        if (d.label === "Rings" || d.label === "Magnetic Field") {
          if (d.value === "Yes") return "0 0 8px #00ff99";
          if (d.value === "No") return "0 0 8px #ff2222";
        }
        if (d.value === "Yes") return "0 0 8px #00ffe0";
        if (d.value === "No") return "0 0 8px #ffb347";
        return "0 0 8px #222";
      })
      .html(d => {
        let icon = "";
        if (d.label === "Moons") icon = "🌙 ";
        else if (d.label === "Rings") icon = "🪐 ";
        else if (d.label === "Magnetic Field") icon = "🧲 ";
        else if (d.label === "Surface") icon = "🪨 ";
        else if (d.label === "Composition") icon = "🧪 ";
        else if (d.label === "Atmosphere") icon = "🌫️ ";
        return `${icon}${d.label}: ${d.value}`;
      })
      .append("title")
      .text(d => d.description || d.label);
  }
  // Prepare features for badges
  const featureKeys = [
    { key: "Number of Moons", label: "Moons" },
    { key: "Ring System?", label: "Rings" },
    { key: "Global Magnetic Field?", label: "Magnetic Field" },
    { key: "Surface Features", label: "Surface" },
    { key: "Composition", label: "Composition" },
    { key: "Atmospheric Composition", label: "Atmosphere" }
  ];
  const featureBadges = featureKeys.map(f => ({
    label: f.label,
    value: data[f.key] && data[f.key] !== "Unknown" ? data[f.key] : "-",
    description: f.key
  }));
  renderFeatureBadges(featureBadges, "#featureBadges");

  // --- Chart toggle logic ---
  document.getElementById("physBarChart").style.display = "none";
  const radarBtn = document.getElementById("showRadar");
  const barBtn = document.getElementById("showBar");
  radarBtn.onclick = function() {
    document.getElementById("radarChart").style.display = "";
    document.getElementById("physBarChart").style.display = "none";
    radarBtn.classList.add("active");
    barBtn.classList.remove("active");
  };
  barBtn.onclick = function() {
    document.getElementById("radarChart").style.display = "none";
    document.getElementById("physBarChart").style.display = "";
    drawBarChart(barData, barMaxVals, xAxisType);
    barBtn.classList.add("active");
    radarBtn.classList.remove("active");
  };

  // --- Only use planets (including Pluto) for normalization ---
  const planetNames = [
    "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"
  ];
  const isPlanet = planetNames.includes(planet);
  const isSun = planet === 'sun';
  const isMoon = planet === 'moon';

  // Radar chart features and normalization
  const radarFeatures = [
    { key: "Mass (10^24kg)", label: "Mass", unit: isSun ? "10³⁰kg" : "10²⁴kg", format: v => isSun ? v / 1e6 : v },
    { key: "Diameter (km)", label: "Diameter", unit: isSun ? "10⁶ km" : "10³ km", format: v => isSun ? v / 1e6 : v / 1000 },
    { key: "Density (kg/m^3)", label: "Density", unit: "g/cm³", format: v => v/1000 },
    { key: "Surface Gravity(m/s^2)", label: "Gravity", unit: isSun ? "10² m/s²" : "m/s²", format: v => isSun ? v / 100 : v },
    { key: "Escape Velocity (km/s)", label: "Escape Vel.", unit: isSun ? "10² km/s" : "km/s", format: v => isSun ? v / 100 : v },
    { key: "Mean Temperature (C)", label: isSun ? "Mean Temp" : "Mean Temp", unit: isSun ? "10³ K" : "K", format: v => isSun ? (v + 273.15) / 1000 : v + 273.15 },
    { key: "Obliquity to Orbit (degrees)", label: "Obliquity", unit: "°", format: v => v }
  ];

  // Gather values for normalization
  let normalizationBodies;
  if (isPlanet) {
    normalizationBodies = planetNames.map(name => planetData[name]);
  } else if (isSun) {
    normalizationBodies = [planetData["sun"]];
  } else if (isMoon) {
    normalizationBodies = [planetData["earth's moon"]];
  } else {
    normalizationBodies = Object.values(planetData);
  }

  // Radar chart min/max
  const featureStats = {};
  radarFeatures.forEach(f => {
    const vals = normalizationBodies.map(p => f.format(+p[f.key])).filter(v => !isNaN(v));
    featureStats[f.key] = { min: Math.min(...vals), max: Math.max(...vals) };
  });

  // Prepare data for radar chart
  const radarData = radarFeatures.map(f => {
    let raw = f.format(+data[f.key]);
    if (isNaN(raw)) raw = 0;
    const { min, max } = featureStats[f.key];
    let value;
    if (max === min) {
      value = 1;
    } else {
      value = (raw - min) / (max - min);
    }
    if (isNaN(value)) value = 0;
    return {
      axis: f.label,
      value,
      raw,
      min,
      max,
      unit: f.unit,
      negative: f.label === "Mean Temp" && raw < (isSun ? 0 : 273.15)
    };
  });

  drawRadarChart("#radarChart", radarData);

  // --- D3 Horizontal Bar Chart for Physical Characteristics ---
  const physKeys = [
    {
      key: "Mass (10^24kg)",
      label: isSun ? "Mass (10³⁰kg)" : "Mass (10²⁴kg)",
      format: v => isSun ? v / 1e6 : v,
      unit: isSun ? "×10³⁰ kg" : "×10²⁴ kg"
    },
    {
      key: "Diameter (km)",
      label: isSun ? "Diameter (10⁶ km)" : "Diameter (10³ km)",
      format: v => isSun ? v / 1e6 : v / 1000,
      unit: isSun ? "×10⁶ km" : "×10³ km"
    },
    { key: "Density (kg/m^3)", label: "Density (g/cm³)", format: v => (v/1000), unit: "g/cm³" },
    {
      key: "Surface Gravity(m/s^2)",
      label: isSun ? "Gravity (10² m/s²)" : "Gravity (m/s²)",
      format: v => isSun ? v / 100 : v,
      unit: isSun ? "×10² m/s²" : "m/s²"
    },
    {
      key: "Escape Velocity (km/s)",
      label: isSun ? "Escape Vel. (10² km/s)" : "Escape Vel. (km/s)",
      format: v => isSun ? v / 100 : v,
      unit: isSun ? "×10² km/s" : "km/s"
    },
    { key: "Obliquity to Orbit (degrees)", label: "Obliquity (°)", format: v => v, unit: "°" },
    {
      key: "Mean Temperature (C)",
      label: isSun ? "Mean Temp (10³ K)" : isMoon ? "Mean Temp (10² K)" : "Mean Temp (K)",
      format: v => isSun ? (v + 273.15) / 1000 : isMoon ? (v + 273.15) / 100 : v + 273.15,
      unit: isSun ? "×10³ K" : isMoon ? "×10² K" : "K"
    }
  ];

  // --- Bar chart normalization logic ---
  let barData, barMaxVals, xAxisType;
  if (isPlanet) {
    // For planets: normalize to max among all planets
    const barNormalizationBodies = planetNames.map(name => planetData[name]);
    barMaxVals = {};
    physKeys.forEach(d => {
      barMaxVals[d.label] = Math.max(...barNormalizationBodies.map(p => d.format(+p[d.key] || 0)));
    });
    barData = physKeys.map(d => {
      const raw = +data[d.key] || 0;
      const value = d.format(raw);
      const max = barMaxVals[d.label] || 1;
      return {
        label: d.label,
        value: value / max, // normalized for bar width
        raw: raw,
        unit: d.unit,
        display: value, // for label
        original: raw,
        max: max
      };
    });
    xAxisType = 'percent';
  } else if (isSun || isMoon) {
    // For Sun/Moon: use actual values, no normalization
    barData = physKeys.map(d => {
      const raw = +data[d.key] || 0;
      const value = d.format(raw);
      return {
        label: d.label,
        value: value, // actual value for bar width
        raw: raw,
        unit: d.unit,
        display: value, // for label
        original: raw
      };
    });
    // Find max for each attribute for axis scaling
    barMaxVals = {};
    physKeys.forEach((d, i) => {
      barMaxVals[d.label] = barData[i].value;
    });
    xAxisType = 'number';
  }

  drawBarChart(barData, barMaxVals, xAxisType);
}

function drawBarChart(physData, barMaxVals, xAxisType) {
  const width = 340, height = 340, margin = {top: 44, right: 40, bottom: 40, left: 120};
  const svg = d3.select("#physBarChart").html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Remove the bar chart title (no title for bar chart)

  const y = d3.scaleBand()
    .domain(physData.map(d => d.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);
  let x;
  if (xAxisType === 'percent') {
    x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right]);
  } else {
    // Sun/Moon: use actual value range
    const max = Math.max(...physData.map(d => d.value));
    x = d3.scaleLinear()
      .domain([0, max])
      .range([margin.left, width - margin.right]);
  }

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
      .ticks(5)
      .tickFormat(d => xAxisType === 'percent' ? `${Math.round(d * 100)}%` : d)
      .tickSizeOuter(0)
    )
    .selectAll("text")
    .style("font-size", "12px");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .selectAll("text")
    .style("fill", "#00ffe0")
    .style("font-size", "13px");

  svg.selectAll(".bar")
    .data(physData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", x(0))
    .attr("y", d => y(d.label))
    .attr("height", y.bandwidth())
    .attr("fill", d => 
      d.label === "Mean Temp (K)" || d.label === "Mean Temp (10³ K)"
        ? (d.display < (d.label === "Mean Temp (10³ K)" ? 0 : 273.15) ? "#3399ff" : "#ffb347")
        : "#00ffe0"
    )
    .attr("opacity", 0.7)
    .attr("width", 0)
    .transition()
    .duration(900)
    .attr("width", d => xAxisType === 'percent' ? x(d.value) - x(0) : x(d.value) - x(0));

  svg.selectAll(".bar-label")
    .data(physData)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", d => xAxisType === 'percent' ? x(d.value) + 8 : x(d.value) + 8)
    .attr("y", d => y(d.label) + y.bandwidth()/2 + 5)
    .text(d => {
      // Show original value for label
      if (d.label === "Mean Temp (K)" || d.label === "Mean Temp (10³ K)") {
        return d.display.toFixed(2) + (d.unit ? ' ' + d.unit : '');
      }
      if (d.display < 10) return d.display.toFixed(2) + (d.unit ? ' ' + d.unit : '');
      if (d.display < 100) return d.display.toFixed(1) + (d.unit ? ' ' + d.unit : '');
      return d.display.toFixed(0) + (d.unit ? ' ' + d.unit : '');
    })
    .style("fill", "#fff")
    .style("font-size", "13px")
    .append("title")
    .text(d => d.original + (d.unit ? ' ' + d.unit : ''));
}

// --- D3 Graphs from sol_data.csv ---
d3.csv("../static/data/sol_data.csv").then(solData => {
  // Only planets
  const planets = solData.filter(d => d.isPlanet === "TRUE");

  // --- Graph 1: Mean Radius vs Gravity (Scatter) ---
  createScatterPlot({
    data: planets,
    xKey: "meanRadius",
    yKey: "gravity",
    xLabel: "Mean Radius (km)",
    yLabel: "Gravity (m/s²)",
    selector: "#graph1",
    color: "#aaffee",
    tooltipKeys: ["eName", "meanRadius", "gravity"]
  });

  // --- Graph 2: Orbital Period vs Mean Radius (Scatter) ---
  createScatterPlot({
    data: planets,
    xKey: "meanRadius",
    yKey: "sideralOrbit",
    xLabel: "Mean Radius (km)",
    yLabel: "Orbital Period (days)",
    selector: "#graph2",
    color: "#ffb347",
    tooltipKeys: ["eName", "meanRadius", "sideralOrbit"]
  });

  // --- Graph 3: Density Distribution (Bar) ---
  createBarChart({
    data: planets,
    xKey: "eName",
    yKey: "density",
    xLabel: "Planet",
    yLabel: "Density (g/cm³)",
    selector: "#graph3",
    color: "#00ffe0"
  });

  // --- Graph 4: Surface Temperature Ranges ---
  d3.csv("../static/data/planets_updated.csv").then(data => {
    // Filter to major planets
    const planets = data.filter(d =>
      ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"].includes(d.Planet)
    );

    // Parse min/max temperatures
    const tempData = planets.map(d => {
      let min = null, max = null;
      const tempStr = d["Surface Temperature (C)"];
      if (typeof tempStr === 'string') {
        if (tempStr.includes('to')) {
          const parts = tempStr.split('to').map(s => parseFloat(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            min = Math.min(parts[0], parts[1]);
            max = Math.max(parts[0], parts[1]);
          }
        } else if (tempStr.includes('–')) {
          const parts = tempStr.split('–').map(s => parseFloat(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            min = Math.min(parts[0], parts[1]);
            max = Math.max(parts[0], parts[1]);
          }
        } else if (!isNaN(parseFloat(tempStr))) {
          min = max = parseFloat(tempStr);
        }
      }
      return {
        name: d.Planet,
        min,
        max
      };
    });

    createTemperatureRangeChart(tempData, "#graph4");
  });
});

// --- Helper: Scatter Plot ---
function createScatterPlot({data, xKey, yKey, xLabel, yLabel, selector, color, tooltipKeys}) {
  const width = 480, height = 400, margin = {top: 60, right: 40, bottom: 80, left: 100};
  const svg = d3.select(selector)
    .html("") // clear
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d[xKey]) * 1.1])
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d[yKey]) * 1.1])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  
  // For the middle graph, use SI notation and fewer ticks for y-axis
  let yAxis = d3.axisLeft(y);
  if (selector === "#graph2") {
    yAxis = d3.axisLeft(y)
      .ticks(6)
      .tickFormat(d3.format(".2s")); // SI notation (e.g., 10k, 100k)
  }
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Axis labels
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.1em")
    .text(xLabel);
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.1em")
    .text(yLabel);

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#222")
    .style("color", "#aaffee")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("opacity", 1);

  const planetImages = {
    Mercury: "../static/images/mercury.png",
    Venus: "../static/images/venus.png",
    Earth: "../static/images/earth.png",
    Mars: "../static/images/mars.png",
    Jupiter: "../static/images/jupiter.png",
    Saturn: "../static/images/saturn.png",
    Uranus: "../static/images/uranus.png",
    Neptune: "../static/images/neptune.png",
    Pluto: "../static/images/pluto.png"
  };
  const imgSize = 40;

  if (selector === "#graph1") {
    svg.selectAll("image")
      .data(data)
      .enter()
      .append("image")
      .attr("xlink:href", d => planetImages[d.eName])
      .attr("x", d => x(+d[xKey]) - imgSize/2)
      .attr("y", d => y(+d[yKey]) - imgSize/2)
      .attr("width", imgSize)
      .attr("height", imgSize)
      .on("mouseover", function(e, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(tooltipKeys.map(k => `<b>${k}:</b> ${d[k]}`).join("<br>"))
          .style("left", (e.pageX + 10) + "px")
          .style("top", (e.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  } else {
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(+d[xKey]))
      .attr("cy", d => y(+d[yKey]))
      .attr("r", 18)
      .attr("fill", color)
      .attr("opacity", 0.7)
      .attr("stroke", "#222")
      .on("mouseover", function(e, d) {
        d3.select(this).attr("fill", "#fff").attr("r", 22);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(tooltipKeys.map(k => `<b>${k}:</b> ${d[k]}`).join("<br>"))
          .style("left", (e.pageX + 10) + "px")
          .style("top", (e.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", color).attr("r", 18);
        tooltip.transition().duration(300).style("opacity", 0);
      });
  }
}

// --- Helper: Bar Chart ---
function createBarChart({data, xKey, yKey, xLabel, yLabel, selector, color}) {
  const width = 480, height = 400, margin = {top: 60, right: 40, bottom: 100, left: 100};
  // Filter to only major planets for clarity and sort them in the correct order
  const majorPlanets = ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  data = data.filter(d => majorPlanets.includes(d.eName));
  // Sort data by the order in majorPlanets
  data.sort((a, b) => majorPlanets.indexOf(a.eName) - majorPlanets.indexOf(b.eName));
  const svg = d3.select(selector)
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(data.map(d => d[xKey]))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d[yKey]) * 1.1])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-60)")
    .attr("x", -8)
    .attr("y", 10)
    .style("text-anchor", "end")
    .style("font-size", "1em");
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Axis labels
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height - 10) // Move label lower to avoid overlap
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.3em")
    .text(xLabel);
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.1em")
    .text(yLabel);

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#222")
    .style("color", "#00ffe0")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px");

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d[xKey]))
    .attr("y", d => y(+d[yKey]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(+d[yKey]))
    .attr("fill", color)
    .attr("opacity", 0.8)
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill", "#fff");
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<b>${d[xKey]}</b><br>${yKey}: ${d[yKey]}`)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", color);
      tooltip.transition().duration(300).style("opacity", 0);
    });
}

function drawRadarChart(selector, data) {
  d3.select(selector).html(""); // Clear previous chart
  const w = 340, h = 340, radius = 110;
  const levels = 5;
  const angleSlice = (2 * Math.PI) / data.length;

  const svg = d3.select(selector)
    .append("svg")
    .attr("width", w)
    .attr("height", h);


  const g = svg.append("g")
    .attr("transform", `translate(${w/2},${h/2+10})`);

  // Draw grid
  for (let level = 1; level <= levels; level++) {
    const r = radius * (level / levels);
    g.append("polygon")
      .attr("points", data.map((d, i) => {
        const angle = i * angleSlice - Math.PI/2;
        return [Math.cos(angle)*r, Math.sin(angle)*r].join(",");
      }).join(" "))
      .attr("stroke", "#00ffe0")
      .attr("stroke-width", 0.7)
      .attr("fill", "none")
      .attr("opacity", 0.3);
  }

  // Draw axes
  data.forEach((d, i) => {
    const angle = i * angleSlice - Math.PI/2;
    g.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", Math.cos(angle)*radius)
      .attr("y2", Math.sin(angle)*radius)
      .attr("stroke", "#00ffe0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    // Axis labels with units
    g.append("text")
      .attr("x", Math.cos(angle)*(radius+18))
      .attr("y", Math.sin(angle)*(radius+18))
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#aaffee")
      .text(d.axis + (d.unit ? ` (${d.unit})` : ""))
      .style("cursor", "help")
      .on("mouseover", function(e) {
        const def = axisDefinitions[d.axis] || '';
        if (def) {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`<b>${d.axis}</b><br>${def}`)
            .style("left", (e.pageX + 10) + "px")
            .style("top", (e.pageY - 28) + "px");
        }
      })
      .on("mouseout", function() {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  });

  // Draw radar area
  const radarLine = d3.lineRadial()
    .radius(d => d.value * radius)
    .angle((d, i) => i * angleSlice);

  g.append("path")
    .datum(data)
    .attr("d", radarLine.curve(d3.curveLinearClosed)(data))
    .attr("fill", "#00ffe0")
    .attr("fill-opacity", 0.25)
    .attr("stroke", "#00ffe0")
    .attr("stroke-width", 2);

  // Draw data points and tooltips (fix: place relative to g, not svg)
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#222")
    .style("color", "#aaffee")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("opacity", 1);

  g.selectAll(".radar-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "radar-point")
    .attr("cx", (d, i) => Math.cos(i*angleSlice - Math.PI/2) * d.value * radius)
    .attr("cy", (d, i) => Math.sin(i*angleSlice - Math.PI/2) * d.value * radius)
    .attr("r", 10)
    .attr("fill", d => 
      d.axis === "Mean Temp" 
        ? (d.raw < 273.15 ? "#3399ff" : "#ffb347") 
        : "#ffb347"
    )
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .style("filter", d => d.axis === "Mean Temp" && d.raw < 273.15 ? "drop-shadow(0 0 8px #3399ff)" : d.axis === "Mean Temp" && d.raw >= 273.15 ? "drop-shadow(0 0 8px #ffb347)" : "drop-shadow(0 0 8px #ffb347)")
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill", "#fff").attr("stroke", d.axis === "Mean Temp" ? (d.raw < 273.15 ? "#3399ff" : "#ffb347") : "#ffb347");
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<b>${d.axis}</b>: ${d.raw.toFixed(2)} ${d.unit}`)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", d => 
        d.axis === "Mean Temp" 
          ? (d.raw < 273.15 ? "#3399ff" : "#ffb347") 
          : "#ffb347"
      ).attr("stroke", "#fff");
      tooltip.transition().duration(300).style("opacity", 0);
    })
    .raise();
}

// Add this definitions object near the top of drawRadarChart or outside it
const axisDefinitions = {
  'Mass': 'Total amount of matter in the planet.',
  'Diameter': 'Distance across the planet at its widest point.',
  'Density': 'Mass per unit volume of the planet.',
  'Gravity': 'Surface gravity experienced on the planet.',
  'Escape Vel.': 'Speed needed to escape the planet\'s gravity.',
  'Mean Temp': 'Average surface temperature.',
  'Obliquity': 'Tilt of the planet\'s axis relative to its orbit.'
};

function createTemperatureRangeChart(data, selector) {
  const width = 480, height = 400, margin = {top: 60, right: 40, bottom: 60, left: 120};
  const svg = d3.select(selector)
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Convert all temperatures to Kelvin
  const kelvinData = data.map(d => ({
    name: d.name,
    min: d.min != null ? d.min + 273.15 : null,
    max: d.max != null ? d.max + 273.15 : null
  }));

  // Y scale (planet names)
  const y = d3.scaleBand()
    .domain(kelvinData.map(d => d.name))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  // X scale (temperature in Kelvin)
  const x = d3.scaleLinear()
    .domain([
      d3.min(kelvinData, d => d.min),
      d3.max(kelvinData, d => d.max)
    ])
    .range([margin.left, width - margin.right]);

  // Draw highlight for 273.15 K (0°C)
  svg.append("line")
    .attr("x1", x(273.15))
    .attr("x2", x(273.15))
    .attr("y1", margin.top - 10)
    .attr("y2", height - margin.bottom + 10)
    .attr("stroke", "#ffb347")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "6,3")
    .attr("opacity", 0.8);

  // Add label for 273.15 K
  svg.append("text")
    .attr("x", x(273.15) + 6)
    .attr("y", margin.top - 18)
    .attr("fill", "#ffb347")
    .attr("font-size", "1em")
    .attr("font-family", "Orbitron, sans-serif")
    .text("273.15 K (0°C)");

  // Draw range bars
  svg.selectAll(".range-bar")
    .data(kelvinData)
    .enter()
    .append("rect")
    .attr("class", "range-bar")
    .attr("y", d => y(d.name) + y.bandwidth()/3)
    .attr("x", d => x(d.min))
    .attr("width", d => x(d.max) - x(d.min))
    .attr("height", y.bandwidth()/3)
    .attr("fill", "#aaffee")
    .attr("opacity", 0.3);

  // Draw min/max points (fix: if min==null but max exists, set min=max; if max==null but min exists, set max=min)
  svg.selectAll(".min-dot")
    .data(kelvinData)
    .enter()
    .append("circle")
    .attr("class", "min-dot")
    .attr("cy", d => y(d.name) + y.bandwidth()/2)
    .attr("cx", d => x(d.min == null && d.max != null ? d.max : d.min))
    .attr("r", 8)
    .attr("fill", "#0033ff")
    .on("mouseover", function(e, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<b>${d.name} Min</b><br>${d.min.toFixed(2)} K`)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(300).style("opacity", 0);
    });

  svg.selectAll(".max-dot")
    .data(kelvinData)
    .enter()
    .append("circle")
    .attr("class", "max-dot")
    .attr("cy", d => y(d.name) + y.bandwidth()/2)
    .attr("cx", d => x(d.max == null && d.min != null ? d.min : d.max))
    .attr("r", 8)
    .attr("fill", "#ff3333")
    .on("mouseover", function(e, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<b>${d.name} Max</b><br>${d.max.toFixed(2)} K`)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(300).style("opacity", 0);
    });

  // Y axis
  svg.append("g")
    .attr("transform", `translate(${margin.left-5},0)`)
    .call(d3.axisLeft(y));

  // X axis (in Kelvin)
  svg.append("g")
    .attr("transform", `translate(0,${height-margin.bottom})`)
    .call(d3.axisBottom(x));

  // Axis labels
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height-15)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.3em")
    .text("Temperature (K)");

  // Vertical 'Celestial Body' label with tooltip
  const yLabel = svg.append("text")
    .attr("x", margin.left - 70)
    .attr("y", (margin.top + height - margin.bottom) / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.3em")
    .attr("font-family", "Orbitron, sans-serif")
    .attr("transform", `rotate(-90,${margin.left - 70},${(margin.top + height - margin.bottom) / 2})`)
    .style("cursor", "help")
    .text("Celestial Body")
    .on("mouseover", function(e) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html("<b>Celestial Body</b><br>A celestial body is a natural object in space, such as a planet, moon, or star.")
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(300).style("opacity", 0);
    });

  // Tooltip for data points
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#222")
    .style("color", "#aaffee")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("opacity", 1);

  // Draw min/max points (fix: if min==null but max exists, set min=max; if max==null but min exists, set max=min)
  svg.selectAll(".min-dot")
    .data(kelvinData)
    .enter()
    .append("circle")
    .attr("class", "min-dot")
    .attr("cy", d => y(d.name) + y.bandwidth()/2)
    .attr("cx", d => x(d.min == null && d.max != null ? d.max : d.min))
    .attr("r", 8)
    .attr("fill", "#0033ff")
    .on("mouseover", function(e, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<b>${d.name} Min</b><br>${d.min.toFixed(2)} K`)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(300).style("opacity", 0);
    });

  svg.selectAll(".max-dot")
    .data(kelvinData)
    .enter()
    .append("circle")
    .attr("class", "max-dot")
    .attr("cy", d => y(d.name) + y.bandwidth()/2)
    .attr("cx", d => x(d.max == null && d.min != null ? d.min : d.max))
    .attr("r", 8)
    .attr("fill", "#ff3333")
    .on("mouseover", function(e, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<b>${d.name} Max</b><br>${d.max.toFixed(2)} K`)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(300).style("opacity", 0);
    });
}

// 1. Create a tooltip div (once, outside your loop)
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "planet-tooltip")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background", "rgba(10,30,40,0.97)")
  .style("color", "#aaffee")
  .style("padding", "18px 22px")
  .style("border-radius", "16px")
  .style("box-shadow", "0 0 24px #00ffe0, 0 0 4px #fff")
  .style("font-family", "'Orbitron', sans-serif")
  .style("font-size", "1.1em")
  .style("z-index", 99999)
  .style("opacity", 0)
  .style("transition", "opacity 0.2s");