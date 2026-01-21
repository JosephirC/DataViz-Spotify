// Dimensions et Marges
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const container = document.getElementById('scatter-container');
const widthScatter = container ? container.clientWidth - margin.left - margin.right : 600;
const heightScatter = 500 - margin.top - margin.bottom;

// Palette de couleurs
const colorPalette = {
    "Mellow & Acoustic": "#a56de2",
    "Happy Pop / Dance": "#1DB954",
    "Hip-Hop / Urban": "#00d2d3",
    "Instrumental / Atmos": "#ff0f0f",
    "High Energy / Fast": "#ff9f43"
};

// Descriptions pour les tooltips de la légende
const clusterDescriptions = {
    "Mellow & Acoustic": "Faible Energy, Forte Acousticness",
    "Happy Pop / Dance": "Forte Danceability, Forte Valence",
    "Hip-Hop / Urban": "Speechiness très élevée",
    "Instrumental / Atmos": "Instrumentalness élevée",
    "High Energy / Fast": "Tempo rapide (>140 BPM) et Energy élevée"
};

// Les axes du radar
const audioFeatures = ["danceability", "energy", "valence", "acousticness", "speechiness"];
// Features pour la Heatmap
const heatmapFeatures = [
    "danceability", "energy", "valence", "acousticness", "speechiness",
    "instrumentalness", "liveness", "loudness", "tempo"
];

// Chargement des données
d3.csv("../../data/top_50_clustered.csv").then(data => {

    // --- PREPARATION GENERALE ---
    data.forEach(d => {
        d.pca_x = +d.pca_x;
        d.pca_y = +d.pca_y;
        audioFeatures.forEach(f => d[f] = +d[f]);
        heatmapFeatures.forEach(f => d[f] = +d[f]);
    });

    const clusters = [...new Set(data.map(d => d.cluster_name))].sort();

    // Calcul des moyennes par cluster
    const clusterAverages = {};
    clusters.forEach(cluster => {
        clusterAverages[cluster] = {};
        heatmapFeatures.forEach(feature => {
            const meanVal = d3.mean(data.filter(d => d.cluster_name === cluster), d => d[feature]);
            clusterAverages[cluster][feature] = meanVal;
            // allValues.push(meanVal);
        });
    });

    // Tooltip Global
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.9)")
        .style("color", "#fff")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000)
        .style("box-shadow", "0 2px 10px rgba(0,0,0,0.5)");

    // =========================================================
    // PARTIE 0 : HEATMAP (features en colonnes, clusters en lignes)
    // Couleurs : par feature (comparaison entre clusters pour une même feature)
    // =========================================================

    d3.select("#heatmap-container").html("");

    const marginHeat = { top: 90, right: 30, bottom: 90, left: 180 };
    const heightHeatTotal = 520;

    const heatContainer = document.getElementById("heatmap-container");
    const containerWidth = heatContainer ? heatContainer.getBoundingClientRect().width : 1200;

    const widthHeat = containerWidth - marginHeat.left - marginHeat.right;
    const heightHeat = heightHeatTotal - marginHeat.top - marginHeat.bottom;

    const svgHeat = d3.select("#heatmap-container")
        .append("svg")
        .attr("width", widthHeat + marginHeat.left + marginHeat.right)
        .attr("height", heightHeatTotal)
        .append("g")
        .attr("transform", `translate(${marginHeat.left},${marginHeat.top})`);

    // X = features (colonnes)
    const xHeat = d3.scaleBand()
        .range([0, widthHeat])
        .domain(heatmapFeatures)
        .padding(0.05);

    // Y = clusters (lignes)
    const yHeat = d3.scaleBand()
        .range([0, heightHeat])
        .domain(clusters)
        .padding(0.05);

    // Axe X (features)
    svgHeat.append("g")
        .call(d3.axisTop(xHeat).tickSize(0))
        .select(".domain").remove();

    svgHeat.selectAll(".tick text")
        .attr("transform", "translate(0,-10) rotate(-30)")
        .style("text-anchor", "start")
        .style("font-size", "13px")
        .style("fill", "#ccc");

    // Axe Y (clusters)
    svgHeat.append("g")
        .call(d3.axisLeft(yHeat).tickSize(0))
        .select(".domain").remove();

    svgHeat.selectAll("g.tick text")
        .style("font-size", "13px")
        .style("fill", "#ccc");

    // Extents par feature (min/max calculés sur les clusters)
    const featureExtent = {};
    heatmapFeatures.forEach(feature => {
        const values = clusters.map(cluster => clusterAverages[cluster][feature]);
        featureExtent[feature] = d3.extent(values);
    });

    function colorFor(feature, value) {
        const [minF, maxF] = featureExtent[feature];
        return d3.scaleSequential()
            .domain([minF, maxF])
            .interpolator(d3.interpolateReds)(value);
    }

    function textColorFromBg(bg) {
        const c = d3.color(bg);
        if (!c) return "#000";
        const lum = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
        return lum > 0.65 ? "#000" : "#fff";
    }

    // Cells : (cluster, feature)
    const cells = [];
    clusters.forEach(cluster => {
        heatmapFeatures.forEach(feature => {
            cells.push({
                cluster,
                feature,
                value: clusterAverages[cluster][feature]
            });
        });
    });

    // Un seul groupe pour les cellules
    const cellLayer = svgHeat.append("g").attr("class", "heatmap-cells");

    cellLayer.selectAll("rect")
        .data(cells)
        .enter()
        .append("rect")
        .attr("x", d => xHeat(d.feature))
        .attr("y", d => yHeat(d.cluster))
        .attr("width", xHeat.bandwidth())
        .attr("height", yHeat.bandwidth())
        .style("rx", 4)
        .style("ry", 4)
        .style("fill", d => colorFor(d.feature, d.value));

    cellLayer.selectAll("text")
        .data(cells)
        .enter()
        .append("text")
        .attr("x", d => xHeat(d.feature) + xHeat.bandwidth() / 2)
        .attr("y", d => yHeat(d.cluster) + yHeat.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => {
            if (d.feature === "tempo" || d.feature === "loudness") return d.value.toFixed(1);
            return d.value.toFixed(2);
        })
        .style("fill", d => textColorFromBg(colorFor(d.feature, d.value)));

    // Mini légende
    const legendG = svgHeat.append("g")
        .attr("transform", `translate(0, ${heightHeat + 50})`);

    const defs = svgHeat.append("defs");
    const grad = defs.append("linearGradient")
        .attr("id", "heat-red-gradient")
        .attr("x1", "0%").attr("x2", "100%")
        .attr("y1", "0%").attr("y2", "0%");

    grad.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#b30000");

    legendG.append("rect")
        .attr("width", 220)
        .attr("height", 12)
        .style("fill", "url(#heat-red-gradient)")
        .style("stroke", "rgba(255,255,255,0.25)")
        .style("stroke-width", 1)
        .attr("rx", 3);

    legendG.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .style("fill", "#ccc")
        .style("font-size", "12px");

    // =========================================================
    // PARTIE 1 : SCATTER PLOT
    // =========================================================

    const svgScatter = d3.select("#scatter-container")
        .append("svg")
        .attr("width", widthScatter + margin.left + margin.right)
        .attr("height", heightScatter + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.pca_x))
        .range([0, widthScatter]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.pca_y))
        .range([heightScatter, 0]);

    // Points
    svgScatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.pca_x))
        .attr("cy", d => y(d.pca_y))
        .attr("r", 3)
        .style("fill", d => colorPalette[d.cluster_name] || "#ccc")
        .style("opacity", 0.6)
        .on("mouseover", function (event, d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 8)
                .style("opacity", 1)
                .style("stroke", "#fff");

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            tooltip.html(`
                <strong>${d.name}</strong>
                <br>
                ${d.artists}
                <br>
                <small style="color:${colorPalette[d.cluster_name]}">${d.cluster_name}</small>
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            updateRadarChart(d.cluster_name);
        })
        .on("mouseout", function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 3)
                .style("opacity", 0.6)
                .style("stroke", "none");
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Zoom
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => svgScatter
            .selectAll("circle")
            .attr("transform", event.transform));

    d3.select("#scatter-container svg").call(zoom);

    // =========================================================
    // PARTIE 2 : RADAR CHART
    // =========================================================

    const widthRadar = 300, heightRadar = 300;
    const radius = Math.min(widthRadar, heightRadar) / 2 - 60;

    const svgRadar = d3.select("#radar-container")
        .append("svg")
        .attr("width", widthRadar)
        .attr("height", heightRadar)
        .append("g")
        .attr("transform", `translate(${widthRadar / 2},${heightRadar / 2})`);

    const rScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, radius]);

    const angleSlice = Math.PI * 2 / audioFeatures.length;

    // Grille Radar
    [0.2, 0.4, 0.6, 0.8, 1].forEach(level => {
        svgRadar.append("circle")
            .attr("r", rScale(level))
            .style("fill", "none")
            .style("stroke", "#444")
            .style("stroke-dasharray", "3,3");
    });

    // Axes Radar
    const axes = svgRadar.selectAll(".axis").data(audioFeatures).enter().append("g");
    axes.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", (_, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (_, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "#666");

    axes.append("text")
        .attr("x", (_, i) => rScale(1.35) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (_, i) => rScale(1.35) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d)
        .style("fill", "#ccc")
        .style("font-size", "11px")
        .attr("text-anchor", "middle");

    // Forme Radar
    const radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);

    const path = svgRadar.append("path")
        .style("fill-opacity", 0.5)
        .style("stroke-width", 2);

    function updateRadarChart(clusterName) {
        const dataValues = audioFeatures.map(f => ({ axis: f, value: clusterAverages[clusterName][f] }));
        d3.select("#radar-legend")
            .html(`
                Cluster : <strong style="color:${colorPalette[clusterName]}">${clusterName}</strong>
            `);

        path.datum(dataValues).transition().duration(300)
            .attr("d", radarLine)
            .style("fill", colorPalette[clusterName])
            .style("stroke", colorPalette[clusterName]);
    }

    // =========================================================
    // PARTIE 3 : LEGENDE
    // =========================================================

    const legend = d3.select("#legend-container");

    Object.keys(colorPalette).forEach(key => {
        const item = legend.append("div")
            .attr("class", "legend-item")
            .style("cursor", "default")
            .on("mouseover", function (event) {
                updateRadarChart(key);
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(`
                    <strong style="color:${colorPalette[key]}">${key}</strong><br>
                    <span style="font-size:0.9em; color:#ddd">${clusterDescriptions[key]}</span>
                `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        item.append("div")
            .style("width", "12px")
            .style("height", "12px")
            .style("background", colorPalette[key])
            .style("margin-right", "8px")
            .style("border-radius", "2px");

        item.append("span")
            .text(key)
            .style("color", "#fff")
            .style("font-size", "0.9em");
    });

    // Init
    updateRadarChart(clusters[0]);

    // =========================================================
    // PARTIE 4 : STREAMGRAPH (ÉVOLUTION TEMPORELLE)
    // =========================================================

    const containerStream = document.getElementById('stream-container');
    const widthStream = containerStream.clientWidth - margin.left - margin.right;
    const heightStream = 400 - margin.top - margin.bottom;

    const svgStream = d3.select("#stream-container")
        .append("svg")
        .attr("width", widthStream + margin.left + margin.right)
        .attr("height", heightStream + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Grouper par Année et par Cluster
    const yearsMap = new Map();

    data.forEach(d => {
        const year = d.album_release_date
            ? parseInt(d.album_release_date.toString().split('-')[0])
            : null;

        if (year && year >= 2018 && year <= 2024) {
            if (!yearsMap.has(year)) {
                yearsMap.set(year, { year: year });
                Object.keys(colorPalette).forEach(c => yearsMap.get(year)[c] = 0);
            }
            yearsMap.get(year)[d.cluster_name]++;
        }
    });

    const formattedData = Array.from(yearsMap.values()).sort((a, b) => a.year - b.year);
    const keys = Object.keys(colorPalette);

    // Stack
    const stack = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys);

    const stackedData = stack(formattedData);

    // Échelles
    const xStream = d3.scaleLinear()
        .domain(d3.extent(formattedData, d => d.year))
        .range([0, widthStream]);

    const yStream = d3.scaleLinear()
        .domain([
            d3.min(stackedData, layer => d3.min(layer, d => d[0])),
            d3.max(stackedData, layer => d3.max(layer, d => d[1]))
        ])
        .range([heightStream, 0]);

    // Aires
    const area = d3.area()
        .curve(d3.curveBasis)
        .x(d => xStream(d.data.year))
        .y0(d => yStream(d[0]))
        .y1(d => yStream(d[1]));

    // Tooltip stream
    const tooltipStream = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    svgStream.selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", d => colorPalette[d.key])
        .style("opacity", 0.8)
        .attr("d", area)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            svgStream.selectAll(".myArea").style("opacity", 0.2);
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "#fff")
                .style("stroke-width", 1);

            updateRadarChart(d.key);

            const grpName = d.key;
            tooltipStream.style("opacity", 1);
            tooltipStream.html(`
                Cluster : <strong>${grpName}</strong>
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mousemove", function (event, _) {
            tooltipStream
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseleave", function () {
            svgStream.selectAll(".myArea")
                .style("opacity", 0.8)
                .style("stroke", "none");
            tooltipStream.style("opacity", 0);
        });

    // Axe X (Années)
    svgStream.append("g")
        .attr("transform", `translate(0,${heightStream})`)
        .call(d3.axisBottom(xStream).tickFormat(d3.format("d")).ticks(5))
        .select(".domain")
        .remove();

    svgStream.selectAll(".tick text")
        .attr("font-size", "14px")
        .attr("fill", "#ccc")
        .attr("dy", "20px");

});