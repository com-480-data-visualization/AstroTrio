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
    "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "moon"
  ];
  planets.forEach(planet => {
    const el = document.querySelector(`.${planet}-body`);
    console.log(`Looking for ${planet}-body:`, el); // Debug log
    if (el) {
      el.addEventListener("click", () => {
        console.log(`Clicked on ${planet}`); // Debug log
        showSidebar(planet);
      });
      el.addEventListener("mouseenter", () => el.classList.add("active"));
      el.addEventListener("mouseleave", () => el.classList.remove("active"));
    }
  });

  document.getElementById("closeSidebar").onclick = () => {
    document.getElementById("planetSidebar").classList.remove("active");
  };
  // Close sidebar on outside click
  document.addEventListener("click", function(e) {
    // Don't close if clicking the sidebar, close button, or a planet
    if (
      e.target.classList.contains("sidebar") ||
      e.target.id === "closeSidebar" ||
      e.target.classList.contains("planet-body")
    ) return;
    document.getElementById("planetSidebar").classList.remove("active");
  });
});

function showSidebar(planet) {
  console.log("Showing sidebar for planet:", planet); // Debug log
  console.log("Available planet data:", planetData); // Debug log
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

  let html = `<h2>${data.Planet}</h2>`;
  if (note) html += note;
  html += '<div id="radarChart" style="width:340px;height:340px;margin-bottom:1em;"></div>';
  html += '<ul>';
  
  // Group related data
  const groups = {
    "Physical Characteristics": [
      "Mass (10^24kg)", "Diameter (km)", "Density (kg/m^3)", 
      "Surface Gravity(m/s^2)", "Escape Velocity (km/s)"
    ],
    "Orbital Parameters": [
      "Distance from Sun (10^6 km)", "Orbital Period (days)", 
      "Orbital Velocity (km/s)", "Orbital Inclination (degrees)", 
      "Orbital Eccentricity", "Obliquity to Orbit (degrees)"
    ],
    "Rotation": [
      "Rotation Period (hours)", "Length of Day (hours)"
    ],
    "Temperature & Atmosphere": [
      "Mean Temperature (C)", "Surface Pressure (bars)", 
      "Surface Temperature (C)", "Atmospheric Pressure (bars)",
      "Atmospheric Composition"
    ],
    "Features": [
      "Number of Moons", "Ring System?", "Global Magnetic Field?",
      "Surface Features", "Composition"
    ]
  };

  // Add data by groups
  for (const [groupName, keys] of Object.entries(groups)) {
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

  // Radar chart features and normalization
  const radarFeatures = [
    { key: "Mass (10^24kg)", label: "Mass", unit: "10²⁴kg" },
    { key: "Diameter (km)", label: "Diameter", unit: "km" },
    { key: "Density (kg/m^3)", label: "Density", unit: "kg/m³" },
    { key: "Surface Gravity(m/s^2)", label: "Gravity", unit: "m/s²" },
    { key: "Escape Velocity (km/s)", label: "Escape Vel.", unit: "km/s" },
    { key: "Mean Temperature (C)", label: "Mean Temp", unit: "°C" },
    { key: "Orbital Eccentricity", label: "Eccentricity", unit: "" },
    { key: "Obliquity to Orbit (degrees)", label: "Obliquity", unit: "°" }
  ];

  // Gather all planet values for normalization
  const allPlanets = Object.values(planetData);
  const featureStats = {};
  radarFeatures.forEach(f => {
    const vals = allPlanets.map(p => +p[f.key]).filter(v => !isNaN(v));
    featureStats[f.key] = { min: Math.min(...vals), max: Math.max(...vals) };
  });

  // Prepare data for radar chart
  const radarData = radarFeatures.map(f => {
    let raw = +data[f.key];
    if (isNaN(raw)) raw = 0;
    const { min, max } = featureStats[f.key];
    let value;
    if (max === min) {
      value = 1;
    } else {
      value = (raw - min) / (max - min);
    }
    if (isNaN(value)) value = 0;
    return { axis: f.label, value, raw, min, max, unit: f.unit };
  });

  console.log("Radar Data:", radarData);
  drawRadarChart("#radarChart", radarData);
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
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "rgba(34,34,34,0.98)")
    .style("color", "#aaffee")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px");

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
        tooltip.transition().duration(200).style("opacity", .95);
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
        tooltip.transition().duration(200).style("opacity", .95);
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
  const width = 480, height = 400, margin = {top: 60, right: 40, bottom: 80, left: 100};
  // Filter to only major planets for clarity
  const majorPlanets = ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  data = data.filter(d => majorPlanets.includes(d.eName));
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
    .attr("y", height - 40)
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
    .style("opacity", 0)
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
      tooltip.transition().duration(200).style("opacity", .95);
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
  const w = 380, h = 320, radius = 120;
  const levels = 5;
  const angleSlice = (2 * Math.PI) / data.length;

  const svg = d3.select(selector)
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", `translate(190,160)`);

  // Draw grid
  for (let level = 1; level <= levels; level++) {
    const r = radius * (level / levels);
    svg.append("polygon")
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
    svg.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", Math.cos(angle)*radius)
      .attr("y2", Math.sin(angle)*radius)
      .attr("stroke", "#00ffe0")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    // Axis labels with units
    svg.append("text")
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
          tooltip.transition().duration(200).style("opacity", .95);
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

  svg.append("path")
    .datum(data)
    .attr("d", radarLine.curve(d3.curveLinearClosed)(data))
    .attr("fill", "#00ffe0")
    .attr("fill-opacity", 0.25)
    .attr("stroke", "#00ffe0")
    .attr("stroke-width", 2);

  // Draw data points and tooltips
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#222")
    .style("color", "#aaffee")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px");

  svg.selectAll(".radar-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "radar-point")
    .attr("cx", (d, i) => {
      const x = Math.cos(i*angleSlice - Math.PI/2) * d.value * radius;
      console.log(`Radar point ${d.axis}: x=${x}`);
      return x;
    })
    .attr("cy", (d, i) => {
      const y = Math.sin(i*angleSlice - Math.PI/2) * d.value * radius;
      console.log(`Radar point ${d.axis}: y=${y}`);
      return y;
    })
    .attr("r", 10)
    .attr("fill", "#ffb347")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .style("filter", "drop-shadow(0 0 8px #ffb347)")
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill", "#fff").attr("stroke", "#ffb347");
      tooltip.transition().duration(200).style("opacity", .95);
      tooltip.html(`<b>${d.axis}</b>: ${d.raw} ${d.unit}`)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", "#ffb347").attr("stroke", "#fff");
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
  'Eccentricity': 'How much the orbit deviates from a circle.',
  'Obliquity': 'Tilt of the planet\'s axis relative to its orbit.'
};

function createTemperatureRangeChart(data, selector) {
  const width = 480, height = 400, margin = {top: 60, right: 40, bottom: 60, left: 120};
  const svg = d3.select(selector)
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Y scale (planet names)
  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  // X scale (temperature)
  const x = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.min),
      d3.max(data, d => d.max)
    ])
    .range([margin.left, width - margin.right]);

  // Draw range bars
  svg.selectAll(".range-bar")
    .data(data)
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
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "min-dot")
    .attr("cy", d => y(d.name) + y.bandwidth()/2)
    .attr("cx", d => x(d.min == null && d.max != null ? d.max : d.min))
    .attr("r", 8)
    .attr("fill", "#0033ff");

  svg.selectAll(".max-dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "max-dot")
    .attr("cy", d => y(d.name) + y.bandwidth()/2)
    .attr("cx", d => x(d.max == null && d.min != null ? d.min : d.max))
    .attr("r", 8)
    .attr("fill", "#ff3333");

  // Y axis
  svg.append("g")
    .attr("transform", `translate(${margin.left-5},0)`)
    .call(d3.axisLeft(y));

  // X axis
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
    .text("Temperature (°C)");
  svg.append("text")
    .attr("x", margin.left-80)
    .attr("y", margin.top-30)
    .attr("text-anchor", "start")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.3em")
    .text("Celestial Body");
}