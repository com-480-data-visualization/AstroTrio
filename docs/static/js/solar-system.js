// --- Sidebar for planet info ---
let planetData = {};
d3.csv("../static/data/planets_updated.csv").then(data => {
  data.forEach(d => {
    planetData[d.Planet.trim().toLowerCase()] = d;
  });
});

// Add click listeners to planets
document.addEventListener("DOMContentLoaded", function() {
  const planets = ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","pluto"];
  planets.forEach(planet => {
    const el = document.querySelector(`.${planet}`);
    if (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => showSidebar(planet));
      el.addEventListener("mouseenter", () => el.style.filter = "drop-shadow(0 0 10px #00ffe0)");
      el.addEventListener("mouseleave", () => el.style.filter = "");
    }
  });

  document.getElementById("closeSidebar").onclick = () => {
    document.getElementById("planetSidebar").classList.remove("active");
  };
  // Close sidebar on outside click
  document.addEventListener("click", function(e) {
    if (e.target.classList.contains("sidebar") || e.target.id === "closeSidebar") return;
    document.getElementById("planetSidebar").classList.remove("active");
  });
});

function showSidebar(planet) {
  const data = planetData[planet];
  if (!data) return;
  let html = `<h2>${data.Planet}</h2><ul>`;
  for (let key in data) {
    if (key !== "Planet" && data[key] && data[key] !== "Unknown" && data[key] !== "No" && data[key] !== "0") {
      html += `<li><b>${key.replace(/_/g, " ")}:</b> ${data[key]}</li>`;
    }
  }
  html += "</ul>";
  document.getElementById("sidebarContent").innerHTML = html;
  document.getElementById("planetSidebar").classList.add("active");
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
});

// --- Helper: Scatter Plot ---
function createScatterPlot({data, xKey, yKey, xLabel, yLabel, selector, color, tooltipKeys}) {
  const width = 350, height = 300, margin = {top: 40, right: 30, bottom: 60, left: 70};
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
    .style("background", "#222")
    .style("color", "#aaffee")
    .style("padding", "8px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "14px");

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(+d[xKey]))
    .attr("cy", d => y(+d[yKey]))
    .attr("r", 10)
    .attr("fill", color)
    .attr("opacity", 0.7)
    .attr("stroke", "#222")
    .on("mouseover", function(e, d) {
      d3.select(this).attr("fill", "#fff").attr("r", 14);
      tooltip.transition().duration(200).style("opacity", .95);
      tooltip.html(tooltipKeys.map(k => `<b>${k}:</b> ${d[k]}`).join("<br>"))
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", color).attr("r", 10);
      tooltip.transition().duration(300).style("opacity", 0);
    });
}

// --- Helper: Bar Chart ---
function createBarChart({data, xKey, yKey, xLabel, yLabel, selector, color}) {
  const width = 350, height = 300, margin = {top: 40, right: 30, bottom: 100, left: 60};
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
