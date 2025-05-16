// Milky Way Visualizations

// --- Load CSV data ---
let exoplanetData = {};
d3.csv("../static/data/nasa_exoplanets.csv").then(data => {
  console.log("Exoplanet data loaded:", data.length, "records");
  exoplanetData = data;
  
  // Create all six visualizations with the same data
  createDiscoveryYearGraph(data, "#discovery-timeline-chart");
  createDetectionMethodsGraph(data, "#detection-methods-chart");
  createPlanetTypesGraph(data, "#planet-types-chart");
  createScatterPlot({
    data: data, 
    xKey: "orbital_radius", 
    yKey: "distance", 
    xLabel: "Orbital Radius (AU)", 
    yLabel: "Distance (Light Years)", 
    selector: "#distance-orbital-chart", 
    color: "#ffb347",
    tooltipKeys: ["name", "orbital_radius", "distance"]
  });
  createScatterPlot({
    data: data, 
    xKey: "orbital_radius", 
    yKey: "discovery_year", 
    xLabel: "Orbital Radius (AU)", 
    yLabel: "Discovery Year", 
    selector: "#habitability-chart", 
    color: "#aaffee",
    tooltipKeys: ["name", "orbital_radius", "discovery_year"]
  });
  createScatterPlot({
    data: data, 
    xKey: "radius_multiplier", 
    yKey: "mass_multiplier", 
    xLabel: "Radius (Jupiter = 1)", 
    yLabel: "Mass (Jupiter = 1)", 
    selector: "#size-comparison-chart", 
    color: "#00ffe0",
    tooltipKeys: ["name", "radius_multiplier", "mass_multiplier"]
  });
}).catch(error => {
  console.error("Error loading data:", error);
  showLoadingError();
});

// Create loading indicators
function createLoadingIndicators() {
  const containers = [
    '#discovery-timeline-chart',
    '#detection-methods-chart',
    '#planet-types-chart',
    '#distance-orbital-chart',
    '#habitability-chart',
    '#size-comparison-chart'
  ];
  
  containers.forEach(container => {
    d3.select(container)
      .html('<div class="loading-spinner"></div>');
  });
}

// Show loading error
function showLoadingError() {
  const containers = [
    '#discovery-timeline-chart',
    '#detection-methods-chart',
    '#planet-types-chart',
    '#distance-orbital-chart',
    '#habitability-chart',
    '#size-comparison-chart'
  ];
  
  containers.forEach(container => {
    d3.select(container)
      .html('<div style="text-align:center;color:#ff6b6b;padding:20px;">Error loading data</div>');
  });
}

// Create Discovery Year graph
function createDiscoveryYearGraph(data, selector) {
  // Process the data to count planets by discovery year
  const yearCounts = {};
  data.forEach(d => {
    if (d.discovery_year && !isNaN(+d.discovery_year)) {
      const year = +d.discovery_year;
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  
  // Convert to array for D3
  const yearData = Object.keys(yearCounts).map(year => ({
    eName: year,
    count: yearCounts[year]
  })).sort((a, b) => +a.eName - +b.eName);
  
  // Create bar chart
  createBarChart({
    data: yearData,
    xKey: "eName",
    yKey: "count",
    xLabel: "Discovery Year",
    yLabel: "Number of Exoplanets",
    selector: selector,
    color: "#00ffe0"
  });
}

// Create Detection Methods graph
function createDetectionMethodsGraph(data, selector) {
  // Process the data to count planets by detection method
  const methodCounts = {};
  data.forEach(d => {
    if (d.detection_method) {
      methodCounts[d.detection_method] = (methodCounts[d.detection_method] || 0) + 1;
    }
  });
  
  // Convert to array for D3
  const methodData = Object.keys(methodCounts).map(method => ({
    eName: method,
    count: methodCounts[method]
  })).sort((a, b) => b.count - a.count);
  
  // Create bar chart
  createBarChart({
    data: methodData,
    xKey: "eName",
    yKey: "count",
    xLabel: "Detection Method",
    yLabel: "Number of Exoplanets",
    selector: selector,
    color: "#ffb347"
  });
}

// Create Planet Types graph
function createPlanetTypesGraph(data, selector) {
  // Process the data to count planets by type
  const typeCounts = {};
  data.forEach(d => {
    if (d.planet_type) {
      typeCounts[d.planet_type] = (typeCounts[d.planet_type] || 0) + 1;
    }
  });
  
  // Convert to array for D3
  const typeData = Object.keys(typeCounts).map(type => ({
    eName: type,
    count: typeCounts[type]
  })).sort((a, b) => b.count - a.count);
  
  // Create bar chart
  createBarChart({
    data: typeData,
    xKey: "eName",
    yKey: "count",
    xLabel: "Planet Type",
    yLabel: "Number of Exoplanets",
    selector: selector,
    color: "#4deeea"
  });
}

// --- Helper: Scatter Plot ---
function createScatterPlot({data, xKey, yKey, xLabel, yLabel, selector, color, tooltipKeys}) {
  const width = 350, height = 300, margin = {top: 40, right: 30, bottom: 60, left: 70};
  const svg = d3.select(selector)
    .html("") // clear
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Filter out data points with invalid values
  const validData = data.filter(d => 
    d[xKey] && d[yKey] && 
    !isNaN(+d[xKey]) && 
    !isNaN(+d[yKey]) && 
    +d[xKey] > 0 && 
    +d[yKey] > 0
  );

  const x = d3.scaleLinear()
    .domain([0, d3.max(validData, d => +d[xKey]) * 1.1])
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(validData, d => +d[yKey]) * 1.1])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

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
    .style("background", "#222")
    .style("color", "#aaffee")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px");

  svg.selectAll("circle")
    .data(validData)
    .enter()
    .append("circle")
    .attr("cx", d => x(+d[xKey]))
    .attr("cy", d => y(+d[yKey]))
    .attr("r", 5)
    .attr("fill", color)
    .attr("opacity", 0.7)
    .attr("stroke", "#222")
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill", "#fff").attr("r", 7);
      tooltip.transition().duration(200).style("opacity", .95);
      tooltip.html(tooltipKeys.map(k => `<b>${k}:</b> ${d[k]}`).join("<br>"))
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", color).attr("r", 5);
      tooltip.transition().duration(300).style("opacity", 0);
    });
}

// --- Helper: Bar Chart ---
function createBarChart({data, xKey, yKey, xLabel, yLabel, selector, color}) {
  const width = 350, height = 300, margin = {top: 40, right: 30, bottom: 100, left: 60};
  
  // Take top 10 entries if more than 10
  let chartData = data;
  if (data.length > 10) {
    chartData = data.slice(0, 10);
  }
  
  const svg = d3.select(selector)
    .html("") // clear
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(chartData.map(d => d[xKey]))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => +d[yKey]) * 1.1])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-60)")
    .attr("x", -8)
    .attr("y", 10)
    .style("text-anchor", "end")
    .style("font-size", "0.8em");
    
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
    .data(chartData)
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

// Call loading indicators on DOM load
document.addEventListener('DOMContentLoaded', function() {
  createLoadingIndicators();
}); 