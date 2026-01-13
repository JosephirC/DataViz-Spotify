// Dimensions et Marges
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const container = document.getElementById('scatter-container');
const widthScatter = container.clientWidth - margin.left - margin.right;
const heightScatter = 500 - margin.top - margin.bottom;

// Palette de couleurs
const colorPalette = {
    "Mellow & Acoustic": "#a56de2",
    "Happy Pop / Dance": "#1DB954",
    "Hip-Hop / Urban": "#00d2d3",
    "Instrumental / Atmos": "#5f27cd",
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

// Chargement des données
d3.csv("../../data/top_50_clustered.csv").then(data => {

    // --- 0. PREPARATION GENERALE ---
    data.forEach(d => {
        d.pca_x = +d.pca_x;
        d.pca_y = +d.pca_y;
        audioFeatures.forEach(f => d[f] = +d[f]);
    });

    // Création du Tooltip
    const tooltip = d3
        .select("body")
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

    // Calcul des moyennes par cluster
    const clusterAverages = {};
    const clusters = [...new Set(data.map(d => d.cluster_name))];

    clusters.forEach(cluster => {
        clusterAverages[cluster] = {};
        audioFeatures.forEach(feature => {
            clusterAverages[cluster][feature] = d3.mean(data.filter(d => d.cluster_name === cluster), d => d[feature]);
        });
    });

    // --- 1. SCATTER PLOT ---
    const svgScatter = d3
        .select("#scatter-container")
        .append("svg")
        .attr("width", widthScatter + margin.left + margin.right)
        .attr("height", heightScatter + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.pca_x))
        .range([0, widthScatter]);

    const y = d3
        .scaleLinear()
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

            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`<strong>${d.name}</strong><br>${d.artists}<br><small style="color:${colorPalette[d.cluster_name]}">${d.cluster_name}</small>`)
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

            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Zoom
    const zoom = d3
        .zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => svgScatter.selectAll("circle").attr("transform", event.transform));

    d3.select("#scatter-container svg").call(zoom);

    // --- 2. RADAR CHART ---
    const widthRadar = 300, heightRadar = 300;

    const radius = Math.min(widthRadar, heightRadar) / 2 - 60;

    const svgRadar = d3.select("#radar-container")
        .append("svg")
        .attr("width", widthRadar).attr("height", heightRadar)
        .append("g")
        .attr("transform", `translate(${widthRadar / 2},${heightRadar / 2})`);

    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);
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
        .attr("x2", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "#666");

    axes.append("text")
        .attr("x", (d, i) => rScale(1.35) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => rScale(1.35) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d)
        .style("fill", "#ccc")
        .style("font-size", "11px")
        .attr("text-anchor", "middle");

    // Forme Radar
    const radarLine = d3
        .lineRadial()
        .curve(d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);

    const path = svgRadar.append("path")
        .style("fill-opacity", 0.5)
        .style("stroke-width", 2);

    function updateRadarChart(clusterName) {
        const dataValues = audioFeatures.map(f =>
        ({
            axis: f, value: clusterAverages[clusterName][f]
        }));

        d3
            .select("#radar-legend")
            .html(`Cluster : <strong style="color:${colorPalette[clusterName]}">${clusterName}</strong>`);

        path.datum(dataValues)
            .transition()
            .duration(300)
            .attr("d", radarLine)
            .style("fill", colorPalette[clusterName])
            .style("stroke", colorPalette[clusterName]);
    }

    // --- 3. LEGENDE ---
    const legend = d3.select("#legend-container");

    Object.keys(colorPalette).forEach(key => {
        const item = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("cursor", "default")
            .style("margin-bottom", "8px")
            .style("padding", "4px")
            .style("border-radius", "4px")
            .style("transition", "background 0.2s")

            // Interaction
            .on("mouseover", function (event) {
                d3.select(this).style("background", "rgba(255,255,255,0.1)");
                updateRadarChart(key);
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`
                    <strong style="color:${colorPalette[key]}">${key}</strong><br>
                    <span style="font-size:0.9em; color:#ddd">${clusterDescriptions[key]}</span>
                `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).style("background", "transparent");
                tooltip.transition().duration(500).style("opacity", 0);
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

    // Initialisation du Radar Chart avec le premier cluster
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

    // Préparation des données : grouper par année et par cluster
    const yearsMap = new Map();

    data.forEach(d => {
        const year = d.album_release_date ? parseInt(d.album_release_date.toString().split('-')[0]) : null;

        // On filtre pour se concentrer sur les données récentes (2020-2025)
        if (year && year >= 2020 && year <= 2025) {
            if (!yearsMap.has(year)) {
                yearsMap.set(year, { year: year });
                // Initier tous les clusters à 0 pour cette année
                Object.keys(colorPalette).forEach(c => yearsMap.get(year)[c] = 0);
            }
            yearsMap.get(year)[d.cluster_name]++;
        }
    });

    // Conversion en tableau trié
    const formattedData = Array.from(yearsMap.values()).sort((a, b) => a.year - b.year);
    const keys = Object.keys(colorPalette);

    // 2. Stack les données
    const stack = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys);

    const stackedData = stack(formattedData);

    // 3. Échelles
    const xStream = d3.scaleLinear()
        .domain(d3.extent(formattedData, d => d.year))
        .range([0, widthStream]);

    const yStream = d3.scaleLinear()
        .domain([
            d3.min(stackedData, layer => d3.min(layer, d => d[0])),
            d3.max(stackedData, layer => d3.max(layer, d => d[1]))
        ])
        .range([heightStream, 0]);

    // 4. Création des aires
    const area = d3.area()
        .curve(d3.curveBasis) // Courbe fluide
        .x(d => xStream(d.data.year))
        .y0(d => yStream(d[0]))
        .y1(d => yStream(d[1]));

    // 5. Ajout d'un tooltip spécifique pour le streamgraph
    const tooltipStream = d3.select("body").append("div")
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

        // INTERACTION
        .on("mouseover", function (event, d) {
            svgStream.selectAll(".myArea").style("opacity", 0.2);
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "#fff")
                .style("stroke-width", 1);

            updateRadarChart(d.key);

            // Tooltip
            const grpName = d.key;
            tooltipStream.style("opacity", 1);
            tooltipStream.html(`Cluster : <strong>${grpName}</strong>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mousemove", function (event, d) {
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
        .select(".domain").remove();

    svgStream.selectAll(".tick text")
        .attr("font-size", "14px")
        .attr("fill", "#ccc")
        .attr("dy", "20px");

});