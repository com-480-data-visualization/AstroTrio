// Milky Way Visualizations
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { hexbin as d3_hexbin } from "https://cdn.jsdelivr.net/npm/d3-hexbin@0.2/+esm";

const ratioHeightToWidth = 0.6; // Scale factor for height of hexagons

// --- Load CSV data ---


d3.csv("../static/data/nasa_exoplanets.csv").then(data => {
  console.log("Exoplanet data loaded:", data.length, "records");

  
  const colorScale = d3.scaleOrdinal()
  .domain([
    "Gas Giant", "Super Earth", "Neptune-like",
    "Terrestrial", "Jupiter-like"
  ])
  .range(["#b730ff", "#3e0b9e", "#e77cd7", "#ff8e8e", "#ffb07c"]);

  // Create all six visualizations with the same data
  createMaxDistancePerYearGraph(data, "#max-distance-per-year-chart", colorScale);
 
  createPlanetTypesGraph(data, "#planet-types-chart", colorScale);

  // createDetectionMethodsGraph(data, "#detection-methods-chart");
  const updater = createLogDensityPlotCore({
    data,
    selector : "#massPlot",
    valueKey : "mass_multiplier",
    wrtKey   : "mass_wrt",
    wrtValue : "Earth",            // default
    color : colorScale
  });
  d3.select("#massRef").on("change", function () {
    const ref = this.value;       // "Earth" or "Jupiter"
    updater(ref);                 // triggers smooth update
  });
  const updater2 = createLogDensityPlotCore({
    data,
    selector : "#radiusPlot",
    valueKey : "radius_multiplier",
    wrtKey   : "radius_wrt",
    wrtValue : "Earth",            // default
    color : colorScale
  });
  d3.select("#radiusRef").on("change", function () {
    const ref = this.value;       // "Earth" or "Jupiter"
    updater2(ref);                 // triggers smooth update
  });
  
  /*
  createScatterPlot({
    data: data, 
    xKey: "orbital_radius", 
    yKey: "distance", 
    xLabel: "Orbital Radius (AU)", 
    yLabel: "Distance (Light Years)", 
    selector: "#distance-orbital-chart", 
    color: "#ffb347",
    tooltipKeys: ["name", "orbital_radius", "distance"]
  });*/
  createStellarHexbinPlot({
    data,
    selector: "#stellar-density-chart"
  });
  // boxplot
  createBoxPlot({
    data,
    numericKey: "orbital_radius",
    categoryKey: "planet_type",
    selector: "#orbital-radius-boxplot",
    color: colorScale
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
    '#orbital-radius-boxplot'
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


// Create Planet Types graph
function createPlanetTypesGraph(data, selector, colorScale) {
  // Process the data to count planets by type
  const typeCounts = {};

  data.forEach(d => {
    // Ensure the field exists and isn't "Unknown"
    if (d.planet_type && d.planet_type !== "Unknown") {
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
    // xLabel: "Planet Type", 
    yLabel: "Number of Exoplanets",
    selector: selector,
    color: colorScale // Use the passed colorScale
  });
}

// --- Helper: Scatter Plot ---
function createScatterPlot({data, xKey, yKey, xLabel, yLabel, selector, color, tooltipKeys}) {
  const width = 800, height = 300, margin = {top: 40, right: 30, bottom: 100, left: 60};
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
    .domain([d3.min(validData, d => +d[xKey]), d3.max(validData, d => +d[xKey])])
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(validData, d => +d[yKey]) * 1.1])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
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
function createBarChart({data, xKey, yKey, yLabel, selector, color}) {
  const container = document.querySelector(selector);
  const width = container.clientWidth;
  const height = width * (ratioHeightToWidth+0.07);
  
  const margin = {top: 40, right: 30, bottom: 65, left: 60};
  
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
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("x", -8)
    .attr("y", 10)
    .style("text-anchor", "end")
    .style("font-size", "1em");
    
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Axis labels
  /*svg.append("text")
    .attr("x", width/2)
    .attr("y", height - 40)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .attr("font-size", "1.1em")
    .text(xLabel);*/
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
    .attr("fill", d => color(d[xKey]))
    .attr("opacity", 1)
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

/* ------------------------------------------------------------------ *
 *  createBoxPlot                                                     *
 *  Draws a log-scaled box-and-whisker plot of numericKey by           *
 *  categoryKey (e.g. orbital_period by planet_type).                  *
 * ------------------------------------------------------------------ */
function createBoxPlot({
  data,              // raw rows (array of objects)
  numericKey,        // e.g. "orbital_period"
  categoryKey,       // e.g. "planet_type"
  selector,          // CSS selector or DOM node
  color, 
  outlierRadius = 1
}) {
  const biggerContainer = document.querySelector(selector);
  const width = biggerContainer.clientWidth; // Use container width
  const height  = width * (ratioHeightToWidth+0.05);
  const margin  = { top: 40, right: 30, bottom: 65, left: 80 };
  /* ---------- 1. Filter & summarise -------------------------------- */

  // Keep only rows with finite, positive numeric values
  const cleaned = data.filter(
    d => d[categoryKey] !== "Unknown" &&
         d[categoryKey] !== undefined  &&
         d[numericKey]   !== undefined &&
         d[numericKey]   > 0           &&
         isFinite(+d[numericKey])
  );

  // Group by category
  const grouped = d3.group(cleaned, d => d[categoryKey]);

  // Compute stats for every category
  const stats = Array.from(grouped, ([type, rows]) => {
    const values = rows.map(r => +r[numericKey]).sort(d3.ascending);
    const q1     = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.50);
    const q3     = d3.quantile(values, 0.75);
    const iqr    = q3 - q1;
    const fenceLo = q1 - 1.5 * iqr;
    const fenceHi = q3 + 1.5 * iqr;
    const inliers  = values.filter(v => v >= fenceLo && v <= fenceHi);
    const outliers = values.filter(v => v <  fenceLo || v >  fenceHi);

    return {
      type,
      q1,
      median,
      q3,
      min: d3.min(inliers),
      max: d3.max(inliers),
      outliers
    };
  });

  /* ---------- 2. Scales & axes ------------------------------------- */

  const innerW = width  - margin.left - margin.right;
  const innerH = height - margin.top  - margin.bottom;

  const x = d3.scaleBand()
              .domain(stats.map(d => d.type))
              .range([0, innerW])
              .paddingInner(0.4);

  const y = d3.scaleLog()
              .domain([
                d3.min(stats, d => d.min) * 0.8,
                d3.max(stats, d => d.max) * 1.2
              ])
              .range([innerH, 0])
              .nice();

  const svg = d3.select(selector)
                .html("") // clear
                .append("svg")
                .attr("width", width)
                .attr("height", height);

  const g = svg.append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  // Axes
  /*g.append("g")
   .attr("class", "y-axis")
   .call(d3.axisLeft(y).ticks(6, "~"))
   .append("text")
   .attr("x", -margin.left + 6)
   .attr("y", -10)
   .attr("fill", "currentColor")
   .attr("text-anchor", "start")
   .text(toTitle(numericKey));*/
   // Y Axis (with ticks)
  g.append("g")
  .attr("class", "y-axis")
  .call(d3.axisLeft(y).ticks(6, "~"));

  // Y Axis label (separate <text> element)
  g.append("text")
  .attr("class", "y-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -innerH / 2)
  .attr("y", -margin.left + 15)
  .attr("text-anchor", "middle")
  .attr("fill", "#00ffe0")
  .style("font-family", "'Orbitron', sans-serif")
  .style("font-size", "1em")
  .text("Log " + toTitle(numericKey) + " (AU)");


  g.append("g")
   .attr("class", "x-axis")
   .attr("transform", `translate(0,${innerH})`)
   .call(d3.axisBottom(x))
   .selectAll("text")
   .attr("dy", "1em")
   .attr("dx", "-0.5em")
   .attr("text-anchor", "end")
   .attr("transform", "rotate(-40)");

  /* ---------- 3. Draw each box-plot -------------------------------- */

  const boxGroup = g.selectAll(".box")
      .data(stats)
      .enter()
      .append("g")
      .attr("class", "box")
      .attr("transform", d => `translate(${x(d.type) + x.bandwidth() / 2},0)`);

  // Whiskers
  boxGroup.append("line")
      .attr("class", "whisker")
      .attr("y1", d => y(d.min))
      .attr("y2", d => y(d.max))
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1.5);

  // Boxes
  const boxWidth = x.bandwidth() * 0.5;
  boxGroup.append("rect")
      .attr("class", "box-body")
      .attr("x", -boxWidth / 2)
      .attr("width", boxWidth)
      .attr("y", d => y(d.q3))
      .attr("height", d => y(d.q1) - y(d.q3))
      .attr("fill", color)
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1);

  // Median line
  boxGroup.append("line")
      .attr("class", "median")
      .attr("x1", -boxWidth / 2)
      .attr("x2",  boxWidth / 2)
      .attr("y1", d => y(d.median))
      .attr("y2", d => y(d.median))
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2);

  // Outliers
  boxGroup.append("g")
      .attr("class", "outliers")
      .selectAll("circle")
      .data(d => d.outliers)
      .enter()
      .append("circle")
      .attr("r", outlierRadius)
      .attr("cx", () => (Math.random() - 0.5) * boxWidth * 0.8) // jitter
      .attr("cy", d => y(d))
      .attr("fill","#00ffe0")//, "white")
      .attr("opacity", 0.8);




  /* ---------- 4. Title (optional) ---------------------------------- */

  /*
  // Return the SVG selection so callers can chain transitions if desired  svg.append("text")
  svg.append("text")
  .attr("class", "plotTitle")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .text(title);*/


  return svg;
}

function createLogDensityPlotCore({
  data, selector, valueKey, wrtKey, wrtValue, color,
  bandwidth = 0.25,
}) {

  const biggerContainer = document.querySelector(selector);
  const width = biggerContainer.clientWidth; 
  const height = width * (ratioHeightToWidth+0.05);
  const margin = {top: 40, right: 30, bottom: 100, left: 70};
  // ── Shared variables across updates ────────────────────────────

  const svg = d3.select(selector)
      .append("svg")
        .attr("width", width)
        .attr("height", height);

  const gX = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`);
  const gY = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`);

  const area = d3.area().curve(d3.curveBasis);

  svg.append("text")               // x-label
      .attr("class", "xLabel")
      .attr("x", (width + margin.left - margin.right) / 2)
      .attr("y", height - margin.bottom + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaffee")
      .attr("font-size", "1.1em")
      //.text(valueKey);
      // make the x-label remove the '_' and capitalize the first letter of each word
      .text(toTitle(valueKey));
    

  svg.append("text")               // y-label
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.bottom - margin.top) / 2)
      .attr("y", margin.left - 50)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaffee")
      .attr("font-size", "1.1em")
      .text("Density");

  const title = svg.append("text") // will update each toggle
      .attr("class", "plotTitle")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "1.4em")
      .attr("fill", "#fff");

  const legendG = svg.append("g")
      .attr("font-size", 14)
      .attr("font-family", "sans-serif");

  // ── Kernel helpers (unchanged) ─────────────────────────────────
  const kde = kernel => (values, X) =>
    X.map(x => [x, d3.mean(values, v => kernel(x - v))]);

  const ker = k => v => Math.abs(v /= k) <= 1 ? 0.75*(1-v*v)/k : 0;
  const epan = ker(bandwidth);

  // ── Main update routine (called first time & on each toggle) ──
  function update(currentRef) {

    // --- 1 · Filter & prep data ---------------------------------
    const sample = data
      .filter(d =>
        d[wrtKey] === currentRef &&
        d[valueKey] && +d[valueKey] > 0 &&
        d.planet_type && d.planet_type !== "Unknown"
      )
      .map(d => ({vlog: Math.log10(+d[valueKey]), type: d.planet_type}));

    const groups = d3.rollup(sample, v => v.map(d => d.vlog), d => d.type);
    const types  = Array.from(groups.keys());

    //color.domain(types);           // keep legend colours stable

    const logMin = d3.min(sample, d => d.vlog) - 0.5;
    const logMax = d3.max(sample, d => d.vlog) + 0.5;
    const logGrid = d3.range(logMin, logMax, (logMax - logMin) / 256);

    const x = d3.scaleLog()
      .domain([10**logMin, 10**logMax])
      .range([margin.left, width - margin.right]);

    const densities = Array.from(groups, ([t, v]) => ({
      type: t,
      density: kde(epan)(v, logGrid)
    }));

    const yMax = d3.max(densities, s => d3.max(s.density, d => d[1]));
    const y = d3.scaleLinear()
      .domain([0, yMax*1.05])
      .range([height - margin.bottom , margin.top]);

    area
      .x(d => x(10 ** d[0]))
      .y0(y(0))
      .y1(d => y(d[1]));

    // --- 2 · Draw / update axes ---------------------------------
    gX.transition().duration(600)
       .call(d3.axisBottom(x)
       .tickValues([0.1, 1, 10, 100])
       .tickFormat(d3.format("~g")));
    gX.selectAll("path")
      .attr("stroke", "#00ffe0");

    gX.selectAll("line")
      .attr("stroke", "#00ffe0");
      
    gY.transition().duration(600)
       .call(d3.axisLeft(y));

    // --- 3 · Update paths (data-join) ----------------------------
    svg.selectAll("path.area")
      .data(densities, d => d.type)
      .join(
        enter => enter.append("path")
                       .attr("class", "area")
                       .attr("fill", d => color(d.type))
                       .attr("fill-opacity", 0.8)
                       .attr("stroke", "#000")
                       .attr("stroke-width", 1)
                       .attr("stroke-linejoin", "round")
                       .attr("d", d => area(d.density)),
        update => update.transition().duration(600)
                        .attr("d", d => area(d.density)),
        exit   => exit.transition().duration(600).style("opacity",0).remove()
      );

    /*
    // --- 4 · Legend (rebind if types changed) --------------------
    const leg = legendG.selectAll("g")
        .data(types, d => d)
        .join(
          enter => {
            const g = enter.append("g")
                .attr("transform", (d,i) =>
                  `translate(${width - margin.right - 150},${margin.top + i*24})`);
            g.append("rect").attr("width",18).attr("height",18)
              .attr("stroke","#000").attr("fill-opacity",0.5);
            g.append("text").attr("x",24).attr("y",9).attr("dy","0.32em");
            return g;
          }
        );

    leg.select("rect").attr("fill", d => color(d));
    leg.select("text").text(d => d);*/
    // --- 4 · Legend (styled below plot) ----------------------------
    legendG.selectAll("*").remove(); // clear

    const legendSpacing = 140;
    const legendY = height - margin.bottom + 75;

    types.forEach((type, i) => {
      const g = legendG.append("g")
        .attr("transform", `translate(${margin.left -50 + i * legendSpacing}, ${legendY})`);

      g.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", color(type))
        .attr("stroke", "#000");

      g.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .attr("fill", "white")
        .style("font-family", "Orbitron")
        .style("font-size", "12px")
        .text(type);
    });


    // --- 5 · Title ----------------------------------------------
    title.text(`${toTitle(valueKey)} wrt ${currentRef}`);
  }

  // ①  Render first time
  update(wrtValue);

  // ②  Return updater for external toggles
  return update;
}

// Helpers (same as before)
function toTitle(str){ return str.replace(/_/g," ").replace(/\b\w/g,m=>m.toUpperCase()); }
function kernelDensityEstimator(k,X){ return V=>X.map(x=>[x,d3.mean(V,v=>k(x-v))]); }
function kernelEpanechnikov(k){ return v=>Math.abs(v/=k)<=1?0.75*(1-v*v)/k:0; }

/*
function createMaxDistancePerYearGraph(data, selector) {
  // Filter out invalid data first
  const validData = data.filter(d => 
    d.distance !== null && 
    d.distance !== undefined && 
    !isNaN(+d.distance) && 
    d.discovery_year !== null && 
    d.discovery_year !== undefined && 
    !isNaN(+d.discovery_year)
  );

  // Group by discovery year and find max distance for each year
  const yearDistanceMap = {};
  validData.forEach(d => {
    const year = +d.discovery_year;
    const distance = +d.distance;
    
    if (!yearDistanceMap[year] || distance > yearDistanceMap[year].distance) {
      yearDistanceMap[year] = {
        ...d,
        distance: distance,
        discovery_year: year
      };
    }
  });

  // Convert back to array
  const maxDistanceData = Object.values(yearDistanceMap);

  createScatterPlot({
    data: maxDistanceData,
    xKey: "discovery_year",
    yKey: "distance",
    xLabel: "Discovery Year",
    yLabel: "Max Distance (Light Years)",
    selector: selector,
    color: "#4deeea",
    tooltipKeys: ["name", "discovery_year", "distance"]
  });
}*/

/*
function createMaxDistancePerYearGraph(data, selector, colorScale) {
  // --- 1. Preprocess Data by Mode (All and each planet type) ---
  const modes = new Set(["All"]);
  const distanceByMode = { All: {} };

  data.forEach(d => {
    const year = +d.discovery_year;
    const distance = +d.distance;
    const type = d.planet_type;

    if (!year || !distance || isNaN(year) || isNaN(distance)) return;

    // Initialize for All
    if (!distanceByMode.All[year] || distance > distanceByMode.All[year].distance) {
      distanceByMode.All[year] = { ...d, distance, discovery_year: year };
    }

    if (type && type !== "Unknown") {
      modes.add(type);
      if (!distanceByMode[type]) distanceByMode[type] = {};
      if (!distanceByMode[type][year] || distance > distanceByMode[type][year].distance) {
        distanceByMode[type][year] = { ...d, distance, discovery_year: year };
      }
    }
  });

  // Convert objects to arrays for each mode
  const modeData = {};
  for (const mode of modes) {
    modeData[mode] = Object.values(distanceByMode[mode]);
  }

  // --- 2. Create Dropdown Menu ---
  const container = d3.select(selector);
  container.html(""); // clear

  container.append("label")
    .attr("for", "distanceMode")
    .style("margin-right", "10px")
    .style("font-family", "Orbitron")
    .text("Planet Type:");

  const dropdown = container.append("select")
    .attr("id", "distanceMode")
    .style("margin-bottom", "20px")
    .style("padding", "4px")
    .style("background-color", "#0d1117")
    .style("color", "#00ffe0")
    .style("border", "1px solid #00ffe0")
    .style("border-radius", "4px")
    .style("font-family", "Orbitron")
    .selectAll("option")
    .data(Array.from(modes))
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Add chart container below the dropdown
  const chartId = selector + "-svg";
  container.append("div").attr("id", chartId.substring(1));

  // --- 3. Rendering Function ---
  function renderScatter(mode) {
    createScatterPlot({
      data: modeData[mode],
      xKey: "discovery_year",
      yKey: "distance",
      xLabel: "Discovery Year",
      yLabel: `Max Distance (${mode})`,
      selector: chartId,
      color: mode === "All" ? "#4deeea" : colorScale(mode),
      tooltipKeys: ["name", "discovery_year", "distance"]
    });
  }

  // Initial render
  renderScatter("All");

  // --- 4. Add Dropdown Change Listener ---
  d3.select("#distanceMode").on("change", function () {
    const selected = this.value;
    renderScatter(selected);
  });
}*/

// Enhancing the max distance per year graph with filtering by planet type
// Enhancing the max distance per year graph with filtering by planet type and transitions

function createMaxDistancePerYearGraph(data, selector, colorScale) {
  const modes = new Set(["All"]);
  const distanceByMode = { All: {} };

  data.forEach(d => {
    const year = +d.discovery_year;
    const distance = +d.distance;
    const type = d.planet_type;

    if (!year || !distance || isNaN(year) || isNaN(distance)) return;

    if (!distanceByMode.All[year] || distance > distanceByMode.All[year].distance) {
      distanceByMode.All[year] = { ...d, distance, discovery_year: year };
    }

    if (type && type !== "Unknown") {
      modes.add(type);
      if (!distanceByMode[type]) distanceByMode[type] = {};
      if (!distanceByMode[type][year] || distance > distanceByMode[type][year].distance) {
        distanceByMode[type][year] = { ...d, distance, discovery_year: year };
      }
    }
  });

  const modeData = {};
  for (const mode of modes) {
    modeData[mode] = Object.values(distanceByMode[mode]);
  }

  const container = d3.select(selector);
  container.html("");

  container.append("label")
    .attr("for", "distanceMode")
    .style("margin-right", "10px")
    .style("font-family", "Orbitron")
    .text("Planet Type:");

  container.append("select")
    .attr("id", "distanceMode")
    .style("margin-bottom", "20px")
    .style("padding", "4px")
    .style("background-color", "#0d1117")
    .style("color", "#00ffe0")
    .style("border", "1px solid #00ffe0")
    .style("border-radius", "4px")
    .style("font-family", "Orbitron")
    .selectAll("option")
    .data(Array.from(modes))
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  const chartId = selector + "-svg";
  container.append("div").attr("id", chartId.substring(1));

  //const container = document.querySelector(selector);
  const biggerContainer = document.querySelector(chartId);
  const width = biggerContainer.clientWidth;
  const height = width * ratioHeightToWidth;
  const margin = {top: 40, right: 30, bottom: 100, left: 60};
  const svg = d3.select(chartId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g");

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

  function renderScatter(mode) {
    const data = modeData[mode].filter(d =>
      d.discovery_year && d.distance && !isNaN(+d.discovery_year) && !isNaN(+d.distance)
    );

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d.discovery_year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.distance) * 1.1])
      .range([height - margin.bottom, margin.top]);

    svg.selectAll(".axis").remove();

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll(".axis-label").remove();

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width/2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaffee")
      .attr("font-size", "1.1em")
      .text("Discovery Year");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2+40)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaffee")
      .attr("font-size", "1.1em")
      .text(`Distance (light years)`);

    const circles = svg.selectAll("circle")
      .data(data, d => d.name);

    circles.exit()
      .transition()
      .duration(500)
      .attr("cy", height)
      .attr("r", 0)
      .remove();

    circles.transition()
      .duration(500)
      .attr("cx", d => x(+d.discovery_year))
      .attr("cy", d => y(+d.distance))
      .attr("r", 5)
      .attr("fill", mode === "All" ? "#4deeea" : colorScale(mode));

    circles.enter()
      .append("circle")
      .attr("cx", d => x(+d.discovery_year))
      .attr("cy", height- margin.bottom)
      .attr("r", 0)
      .attr("fill", mode === "All" ? "#4deeea" : colorScale(mode))
      .attr("opacity", 0.7)
      .on("mouseover", function(e, d) {
        d3.select(this).attr("fill", "#fff").attr("r", 7);
        tooltip.transition().duration(200).style("opacity", .95);
        tooltip.html(`<b>${d.name}</b><br>Year: ${d.discovery_year}<br>Distance: ${d.distance}`)
          .style("left", (e.pageX + 10) + "px")
          .style("top", (e.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", mode === "All" ? "#4deeea" : colorScale(mode)).attr("r", 5);
        tooltip.transition().duration(300).style("opacity", 0);
      })
      .transition()
      .duration(500)
      .attr("cy", d => y(+d.distance))
      .attr("r", 5);
  }

  renderScatter("All");

  d3.select("#distanceMode").on("change", function () {
    const selected = this.value;
    renderScatter(selected);
  });
}




// D3 v7+
function createStellarHexbinPlot({
  data,
  selector = "#stellar-density-chart",
  radius = 10 // hex radius in px
}) {
  const biggerContainer = document.querySelector(selector);
  const width = biggerContainer.clientWidth;
  const height = width * (ratioHeightToWidth+0.05); // maintain aspect ratio
  const margin = {top: 40, right: 15, bottom: 50, left: 50};
  const svg = d3.select(selector)
    .html("") // clear previous content
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Clean and prepare data
  const points = data
    .filter(d =>
      d.distance && d.stellar_magnitude &&
      !isNaN(+d.distance) && !isNaN(+d.stellar_magnitude)
    )
    .map(d => ({
      x: +d.distance,
      y: -d.stellar_magnitude
    }));

  // Scales
  //const xExtent = d3.extent(points, d => d.x);
  //const yExtent = d3.extent(points, d => d.y);

  const x = d3.scaleLinear()
    .domain([d3.min(points, d => d.x)-10, d3.max(points, d => d.x)+10])
    .nice()
    .range([0, innerWidth]);
   
  const y = d3.scaleLinear()
    .domain([d3.min(points, d => d.y)-2, d3.max(points, d => d.y)*1.1])
    .nice()
    .range([innerHeight, 0]);

  // Axes
  chart.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  chart.append("g")
    .call(d3.axisLeft(y));

  // Hexbin instance
  const hexbin = d3_hexbin()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .radius(radius)
    .extent([[0, 0], [innerWidth, innerHeight]]);

  const bins = hexbin(points);

  const color = d3.scaleLinear()
  .domain([0, 1, d3.max(bins, d => d.length)])  // [low, mid, high]
  .range(["transparent", "#00baff", "#aaffee"]); // soft blue → neon cyan

  // Draw hexbins
  chart.append("g")
    .attr("clip-path", "url(#clip)")
    .selectAll("path")
    .data(bins)
    .join("path")
    .attr("d", hexbin.hexagon())
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("fill", d => color(d.length))
    .attr("stroke", "#222")
    .attr("stroke-width", 0.2);

  // Axis labels
  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height -5)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .text("Distance (light years)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -margin.top - innerHeight / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaffee")
    .text("- Stellar Magnitude");

  // ONLY x axis tick labels with 45 degree rotation
  /*chart.select("g.x-axis")
    .selectAll("tick text")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end")*/

  chart.select("g.x-axis")
  .selectAll("g.tick text")
  .attr("transform", "rotate(-45)")
  .attr("text-anchor", "end")
  .attr("x", -5)
  .attr("y", 10);


    /*
    // Define clip path inside svg
    svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", innerWidth)
    .attr("height", innerHeight);

    // Use the clip path on the hexbin group
    chart.append("g")
    .attr("clip-path", "url(#clip)")
    .selectAll("path")
    .data(bins)
    .join("path")
    .attr("d", hexbin.hexagon())
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("fill", d => color(d.length))
    .attr("stroke", "#222")
    .attr("stroke-width", 0.2);
    */
}


// Call loading indicators on DOM load
document.addEventListener('DOMContentLoaded', function() {
  createLoadingIndicators();
}); 