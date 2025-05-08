// Milky Way Visualizations

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Create loading indicators for each visualization
    createLoadingIndicators();
    
    // Load the JSON data files in parallel
    Promise.all([
        d3.json('../static/data/processed/discovery_timeline.json'),
        d3.json('../static/data/processed/detection_methods.json'),
        d3.json('../static/data/processed/planet_types.json'),
        d3.json('../static/data/processed/distance_orbital.json'),
        d3.json('../static/data/processed/habitability.json'),
        d3.json('../static/data/processed/size_comparison.json'),
        d3.json('../static/data/processed/metadata.json')
    ])
    .then(function([
        discoveryData,
        detectionData,
        planetTypesData,
        distanceOrbitalData,
        habitabilityData,
        sizeComparisonData,
        metadata
    ]) {
        console.log('Data loaded successfully. Metadata:', metadata);
        
        // Create the visualizations with their specific data
        createDiscoveryTimeline(discoveryData);
        createDetectionMethods(detectionData);
        createPlanetTypes(planetTypesData);
        createDistanceOrbitalChart(distanceOrbitalData);
        createHabitabilityChart(habitabilityData);
        createSizeComparisonChart(sizeComparisonData);
    })
    .catch(function(error) {
        console.error('Error loading the data: ', error);
        showLoadingError();
    });
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

// Discovery Timeline Chart
function createDiscoveryTimeline(data) {
    const container = d3.select('#discovery-timeline-chart');
    container.html(''); // Clear loading spinner
    
    // Dimensions
    const margin = {top: 30, right: 30, bottom: 50, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.cumulative_count)])
        .range([height, 0])
        .nice();
    
    // Axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'))
        .ticks(Math.min(data.length, 10));
    
    const yAxis = d3.axisLeft(yScale);
    
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .attr('class', 'x-axis')
        .call(xAxis)
        .selectAll('text')
        .style('fill', '#e0e0f0');
        
    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#e0e0f0');
    
    // Line generator
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.cumulative_count))
        .curve(d3.curveMonotoneX);
    
    // Add the line
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#00ffe0')
        .attr('stroke-width', 2.5)
        .attr('d', line);
    
    // Add circles for data points
    svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.cumulative_count))
        .attr('r', 4)
        .attr('fill', '#00ffe0')
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('r', 6)
                .attr('fill', '#ffffff');
            
            // Create tooltip
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>Year:</strong> ${d.year}<br><strong>New discoveries:</strong> ${d.count}<br><strong>Total:</strong> ${d.cumulative_count}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('r', 4)
                .attr('fill', '#00ffe0');
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add tooltip div
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '8px')
        .style('font', '12px sans-serif')
        .style('background', 'rgba(20, 20, 50, 0.9)')
        .style('border', '1px solid #00ffe0')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('color', '#e0e0f0');
    
    // Axis labels
    svg.append('text')
        .attr('transform', `translate(${width/2}, ${height + margin.bottom - 10})`)
        .style('text-anchor', 'middle')
        .style('fill', '#e0e0f0')
        .text('Year');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#e0e0f0')
        .text('Cumulative Discoveries');
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#00ffe0')
        .text('Exoplanet Discoveries Over Time');
}

// Detection Methods Chart
function createDetectionMethods(data) {
    const container = d3.select('#detection-methods-chart');
    container.html(''); // Clear loading spinner
    
    // Dimensions
    const margin = {top: 30, right: 130, bottom: 30, left: 30};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width/2 + margin.left},${height/2 + margin.top})`);
    
    // Color scale
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.method))
        .range(d3.schemeSet2);
    
    // Pie layout
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    // Arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.4)
        .outerRadius(radius * 0.8);
    
    // Outer arc for labels
    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
    
    // Add the pie slices
    const slices = svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.method))
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 1)
        .style('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .style('opacity', 1)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>${d.data.method}</strong><br>${d.data.count} exoplanets<br>${d.data.percentage}%`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .style('opacity', 0.8)
                .attr('stroke-width', 1);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '8px')
        .style('font', '12px sans-serif')
        .style('background', 'rgba(20, 20, 50, 0.9)')
        .style('border', '1px solid #00ffe0')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('color', '#e0e0f0');
    
    // Add the polylines between chart and labels
    svg.selectAll('polyline')
        .data(pie(data))
        .enter()
        .append('polyline')
        .attr('points', function(d) {
            const pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos];
        })
        .style('fill', 'none')
        .style('stroke', '#e0e0f0')
        .style('opacity', 0.5)
        .style('stroke-width', 1);
    
    // Add the labels
    svg.selectAll('text.label')
        .data(pie(data))
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('dy', '.35em')
        .html(function(d) {
            // Only show the labels for methods with significant percentages
            return d.data.percentage >= 1 ? `${d.data.method} (${d.data.percentage}%)` : '';
        })
        .attr('transform', function(d) {
            const pos = outerArc.centroid(d);
            pos[0] = radius * 1 * (midAngle(d) < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .style('text-anchor', function(d) {
            return midAngle(d) < Math.PI ? 'start' : 'end';
        })
        .style('font-size', '10px')
        .style('fill', '#e0e0f0');
    
    // Title
    svg.append('text')
        .attr('x', 0)
        .attr('y', -radius - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#00ffe0')
        .text('Exoplanet Detection Methods');
}

// Helper function for pie charts
function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

// Planet Types Chart
function createPlanetTypes(data) {
    const container = d3.select('#planet-types-chart');
    container.html(''); // Clear loading spinner
    
    // Dimensions
    const margin = {top: 30, right: 30, bottom: 50, left: 50};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
        .domain(data.map(d => d.type))
        .range([0, width])
        .padding(0.3);
    
    // Y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height, 0])
        .nice();
    
    // Color scale based on planet type
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.type))
        .range(['#4deeea', '#f000ff', '#74ee15', '#ffe700', '#ff6b6b']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#e0e0f0')
        .style('text-anchor', 'middle');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', '#e0e0f0');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.type))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .attr('fill', d => color(d.type))
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 1)
        .style('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .style('opacity', 1)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>${d.type}</strong><br>${d.count} exoplanets<br>${d.percentage}%`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .style('opacity', 0.8)
                .attr('stroke-width', 1);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add counts above bars
    svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.type) + x.bandwidth() / 2)
        .attr('y', d => y(d.count) - 5)
        .attr('text-anchor', 'middle')
        .style('fill', '#e0e0f0')
        .style('font-size', '10px')
        .text(d => d.count);
    
    // Add tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '8px')
        .style('font', '12px sans-serif')
        .style('background', 'rgba(20, 20, 50, 0.9)')
        .style('border', '1px solid #00ffe0')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('color', '#e0e0f0');
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#00ffe0')
        .text('Exoplanet Types');
}

// Distance vs. Orbital Radius Chart
function createDistanceOrbitalChart(data) {
    const container = d3.select('#distance-orbital-chart');
    container.html(''); // Clear loading spinner
    
    // Dimensions
    const margin = {top: 30, right: 50, bottom: 50, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLog()
        .domain([0.01, d3.max(data, d => d.orbital_radius) * 1.1])
        .range([0, width])
        .nice();
    
    const yScale = d3.scaleLog()
        .domain([1, d3.max(data, d => d.distance) * 1.1])
        .range([height, 0])
        .nice();
    
    // Color scale based on planet_type
    const color = d3.scaleOrdinal()
        .domain(['Super Earth', 'Gas Giant', 'Neptune-like', 'Terrestrial', 'Unknown'])
        .range(['#4deeea', '#f000ff', '#74ee15', '#ffe700', '#cccccc']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5, '.1f'))
        .selectAll('text')
        .style('fill', '#e0e0f0');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5, '.1f'))
        .selectAll('text')
        .style('fill', '#e0e0f0');
    
    // Add axis labels
    svg.append('text')
        .attr('transform', `translate(${width/2}, ${height + margin.bottom - 10})`)
        .style('text-anchor', 'middle')
        .style('fill', '#e0e0f0')
        .text('Orbital Radius (AU)');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#e0e0f0')
        .text('Distance from Earth (Light Years)');
    
    // Add scatter points
    svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(Math.max(0.01, d.orbital_radius)))
        .attr('cy', d => yScale(Math.max(1, d.distance)))
        .attr('r', 3)
        .attr('fill', d => color(d.planet_type))
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 0.5)
        .style('opacity', 0.7)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('r', 5)
                .style('opacity', 1)
                .attr('stroke-width', 1.5);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>${d.name}</strong><br>Type: ${d.planet_type}<br>Distance: ${d.distance.toFixed(1)} ly<br>Orbital Radius: ${d.orbital_radius.toFixed(2)} AU`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('r', 3)
                .style('opacity', 0.7)
                .attr('stroke-width', 0.5);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '8px')
        .style('font', '12px sans-serif')
        .style('background', 'rgba(20, 20, 50, 0.9)')
        .style('border', '1px solid #00ffe0')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('color', '#e0e0f0');
    
    // Add reference lines for Earth's orbit and Sol
    svg.append('line')
        .attr('x1', xScale(1))
        .attr('y1', 0)
        .attr('x2', xScale(1))
        .attr('y2', height)
        .attr('stroke', '#ffffff')
        .attr('stroke-dasharray', '3,3')
        .attr('stroke-width', 1)
        .style('opacity', 0.5);
    
    svg.append('text')
        .attr('x', xScale(1) + 5)
        .attr('y', 15)
        .style('fill', '#ffffff')
        .style('font-size', '10px')
        .text('Earth (1 AU)');
    
    // Add legend
    const legend = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'start')
        .selectAll('g')
        .data(['Super Earth', 'Gas Giant', 'Neptune-like', 'Terrestrial', 'Unknown'])
        .enter().append('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);
    
    legend.append('rect')
        .attr('x', width - 19)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => color(d))
        .attr('stroke', '#0d1117')
        .style('opacity', 0.7);
    
    legend.append('text')
        .attr('x', width - 24)
        .attr('y', 7.5)
        .attr('dy', '0.32em')
        .style('text-anchor', 'end')
        .style('fill', '#e0e0f0')
        .text(d => d);
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#00ffe0')
        .text('Distance vs. Orbital Radius');
}

// Habitability Potential Chart
function createHabitabilityChart(data) {
    const container = d3.select('#habitability-chart');
    container.html(''); // Clear loading spinner
    
    // Sort the data by habitability score in descending order
    data.sort((a, b) => b.habitability_score - a.habitability_score);
    
    // Dimensions
    const margin = {top: 30, right: 30, bottom: 50, left: 150};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Take top 20 exoplanets for display
    const topData = data.slice(0, 20);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    
    const yScale = d3.scaleBand()
        .domain(topData.map(d => d.name))
        .range([0, height])
        .padding(0.1);
    
    // Color scale based on planet type
    const color = d3.scaleOrdinal()
        .domain(['Super Earth', 'Gas Giant', 'Neptune-like', 'Terrestrial', 'Unknown'])
        .range(['#4deeea', '#f000ff', '#74ee15', '#ffe700', '#cccccc']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .selectAll('text')
        .style('fill', '#e0e0f0');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('fill', '#e0e0f0')
        .style('font-size', '10px');
    
    // Add bars
    svg.selectAll('.bar')
        .data(topData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => yScale(d.name))
        .attr('width', d => xScale(d.habitability_score))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => color(d.planet_type))
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 1)
        .style('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .style('opacity', 1)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>${d.name}</strong><br>Type: ${d.planet_type}<br>Habitability Score: ${d.habitability_score}<br>Distance: ${d.distance.toFixed(1)} ly<br>Orbital Radius: ${d.orbital_radius.toFixed(2)} AU`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .style('opacity', 0.8)
                .attr('stroke-width', 1);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add labels for scores
    svg.selectAll('.score')
        .data(topData)
        .enter()
        .append('text')
        .attr('class', 'score')
        .attr('x', d => xScale(d.habitability_score) + 5)
        .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .style('fill', '#e0e0f0')
        .style('font-size', '10px')
        .text(d => d.habitability_score);
    
    // Add tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '8px')
        .style('font', '12px sans-serif')
        .style('background', 'rgba(20, 20, 50, 0.9)')
        .style('border', '1px solid #00ffe0')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('color', '#e0e0f0');
    
    // Add axis labels
    svg.append('text')
        .attr('transform', `translate(${width/2}, ${height + margin.bottom - 10})`)
        .style('text-anchor', 'middle')
        .style('fill', '#e0e0f0')
        .text('Habitability Score');
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#00ffe0')
        .text('Potentially Habitable Exoplanets');
    
    // Add note about scoring
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#e0e0f0')
        .text('Based on planet type, orbital radius, and distance from Earth');
}

// Size Comparison Chart
function createSizeComparisonChart(data) {
    const container = d3.select('#size-comparison-chart');
    container.html(''); // Clear loading spinner
    
    // Dimensions
    const margin = {top: 30, right: 30, bottom: 60, left: 40};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.radius)])
        .range([0, height / 3]);
    
    // Calculate the positions for the planets
    const planetsPerRow = Math.floor(Math.sqrt(data.length));
    const cellWidth = width / planetsPerRow;
    const cellHeight = height / Math.ceil(data.length / planetsPerRow);
    
    // Color scale based on planet type
    const color = d3.scaleOrdinal()
        .domain(['Earth', 'Jupiter', 'Super Earth', 'Gas Giant', 'Neptune-like', 'Terrestrial', 'Unknown', 'Reference'])
        .range(['#1e90ff', '#ff8c00', '#4deeea', '#f000ff', '#74ee15', '#ffe700', '#cccccc', '#ffffff']);
    
    // Create planet groups
    const planetGroups = svg.selectAll('.planet-group')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'planet-group')
        .attr('transform', (d, i) => {
            const row = Math.floor(i / planetsPerRow);
            const col = i % planetsPerRow;
            return `translate(${col * cellWidth + cellWidth/2}, ${row * cellHeight + cellHeight/2})`;
        });
    
    // Add the circles for planets
    planetGroups.append('circle')
        .attr('r', d => Math.max(2, radiusScale(d.radius)))
        .attr('fill', d => color(d.planet_type))
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 1)
        .style('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .style('opacity', 1)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`<strong>${d.name}</strong><br>Type: ${d.planet_type}<br>Radius: ${d.radius.toFixed(2)} Jupiter radii<br>${d.radius_earth.toFixed(2)} Earth radii`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .style('opacity', 0.8)
                .attr('stroke-width', 1);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add the planet names
    planetGroups.append('text')
        .attr('dy', d => radiusScale(d.radius) + 12)
        .style('text-anchor', 'middle')
        .style('fill', '#e0e0f0')
        .style('font-size', '8px')
        .text(d => d.name);
    
    // Add tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '8px')
        .style('font', '12px sans-serif')
        .style('background', 'rgba(20, 20, 50, 0.9)')
        .style('border', '1px solid #00ffe0')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('color', '#e0e0f0');
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width/2}, ${height + 20})`)
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'middle');
    
    // Add Earth reference
    legend.append('circle')
        .attr('cx', -70)
        .attr('r', radiusScale(0.0892)) // Earth radius in Jupiter radii
        .attr('fill', color('Earth'))
        .attr('stroke', '#0d1117');
    
    legend.append('text')
        .attr('x', -70)
        .attr('y', 15)
        .style('fill', '#e0e0f0')
        .text('Earth');
    
    // Add Jupiter reference
    legend.append('circle')
        .attr('cx', 0)
        .attr('r', radiusScale(1))
        .attr('fill', color('Jupiter'))
        .attr('stroke', '#0d1117');
    
    legend.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .style('fill', '#e0e0f0')
        .text('Jupiter');
    
    // Add Super Jupiter reference if available
    if (d3.max(data, d => d.radius) > 1.5) {
        legend.append('circle')
            .attr('cx', 70)
            .attr('r', radiusScale(2))
            .attr('fill', color('Gas Giant'))
            .attr('stroke', '#0d1117');
        
        legend.append('text')
            .attr('x', 70)
            .attr('y', 25)
            .style('fill', '#e0e0f0')
            .text('2x Jupiter');
    }
    
    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#00ffe0')
        .text('Notable Exoplanet Size Comparison');
} 