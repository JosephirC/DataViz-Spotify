// Dimensions et Marges
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const container = document.getElementById('scatter-container');
const widthScatter = container.clientWidth - margin.left - margin.right;
const heightScatter = 500 - margin.top - margin.bottom;

// Palette de couleurs
const colorPalette = {
    "Mellow & Acoustic": "#a56de2",    // Violet
    "Happy Pop / Dance": "#1DB954",    // Vert Spotify
    "Hip-Hop / Urban": "#00d2d3",      // Cyan
    "Instrumental / Atmos": "#5f27cd", // Indigo
    "High Energy / Fast": "#ff9f43"    // Orange
};

// --- NOUVEAU : Descriptions pour les tooltips de la légende ---
const clusterDescriptions = {
    "Mellow & Acoustic": "Faible Energy, Forte Acousticness (Musique calme)",
    "Happy Pop / Dance": "Forte Danceability, Forte Valence (Musique joyeuse)",
    "Hip-Hop / Urban": "Speechiness très élevée (Beaucoup de paroles)",
    "Instrumental / Atmos": "Instrumentalness élevée (Peu ou pas de voix)",
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

    // Création du Tooltip (Unique pour Scatter et Légende)
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.9)") // Un peu plus sombre pour la lisibilité
        .style("color", "#fff")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000)
        .style("box-shadow", "0 2px 10px rgba(0,0,0,0.5)");

    // Calcul des moyennes par cluster pour le Radar
    const clusterAverages = {};
    const clusters = [...new Set(data.map(d => d.cluster_name))];

    clusters.forEach(cluster => {
        clusterAverages[cluster] = {};
        audioFeatures.forEach(feature => {
            clusterAverages[cluster][feature] = d3.mean(data.filter(d => d.cluster_name === cluster), d => d[feature]);
        });
    });

    // --- 1. SCATTER PLOT ---
    const svgScatter = d3.select("#scatter-container")
        .append("svg")
        .attr("width", widthScatter + margin.left + margin.right)
        .attr("height", heightScatter + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.pca_x)).range([0, widthScatter]);
    const y = d3.scaleLinear().domain(d3.extent(data, d => d.pca_y)).range([heightScatter, 0]);

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
            d3.select(this).transition().duration(100).attr("r", 8).style("opacity", 1).style("stroke", "#fff");

            // Tooltip Scatter
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`<strong>${d.name}</strong><br>${d.artists}<br><small style="color:${colorPalette[d.cluster_name]}">${d.cluster_name}</small>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            updateRadarChart(d.cluster_name);
        })
        .on("mouseout", function () {
            d3.select(this).transition().duration(200).attr("r", 3).style("opacity", 0.6).style("stroke", "none");
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Zoom
    const zoom = d3.zoom().scaleExtent([0.5, 5])
        .on("zoom", (event) => svgScatter.selectAll("circle").attr("transform", event.transform));
    d3.select("#scatter-container svg").call(zoom);


    // --- 2. RADAR CHART ---
    const widthRadar = 300, heightRadar = 300;
    const radius = Math.min(widthRadar, heightRadar) / 2 - 20;

    const svgRadar = d3.select("#radar-container")
        .append("svg")
        .attr("width", widthRadar).attr("height", heightRadar)
        .append("g")
        .attr("transform", `translate(${widthRadar / 2},${heightRadar / 2})`);

    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);
    const angleSlice = Math.PI * 2 / audioFeatures.length;

    // Grille Radar
    [0.2, 0.4, 0.6, 0.8, 1].forEach(level => {
        svgRadar.append("circle").attr("r", rScale(level))
            .style("fill", "none").style("stroke", "#444").style("stroke-dasharray", "3,3");
    });

    // Axes Radar
    const axes = svgRadar.selectAll(".axis").data(audioFeatures).enter().append("g");
    axes.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "#666");

    axes.append("text")
        .attr("x", (d, i) => rScale(1.25) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => rScale(1.25) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d).style("fill", "#ccc").style("font-size", "10px").attr("text-anchor", "middle");

    // Forme Radar
    const radarLine = d3.lineRadial().curve(d3.curveLinearClosed)
        .radius(d => rScale(d.value)).angle((d, i) => i * angleSlice);

    const path = svgRadar.append("path")
        .style("fill-opacity", 0.5).style("stroke-width", 2);

    function updateRadarChart(clusterName) {
        const dataValues = audioFeatures.map(f => ({ axis: f, value: clusterAverages[clusterName][f] }));
        d3.select("#radar-legend").html(`Cluster : <strong style="color:${colorPalette[clusterName]}">${clusterName}</strong>`);

        path.datum(dataValues).transition().duration(300)
            .attr("d", radarLine)
            .style("fill", colorPalette[clusterName])
            .style("stroke", colorPalette[clusterName]);
    }

    // --- 3. LEGENDE AVEC TOOLTIP ---
    const legend = d3.select("#legend-container");

    Object.keys(colorPalette).forEach(key => {
        const item = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("cursor", "pointer")
            .style("margin-bottom", "8px")
            .style("padding", "4px")
            .style("border-radius", "4px")
            .style("transition", "background 0.2s")

            // Interaction : Hover sur la légende
            .on("mouseover", function (event) {
                // 1. Mise à jour du style de l'item légende
                d3.select(this).style("background", "rgba(255,255,255,0.1)");

                // 2. Mise à jour du graphique Radar
                updateRadarChart(key);

                // 3. Affichage du Tooltip avec la description
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

        // Carré de couleur
        item.append("div")
            .style("width", "12px")
            .style("height", "12px")
            .style("background", colorPalette[key])
            .style("margin-right", "8px")
            .style("border-radius", "2px"); // Légèrement carré pour différencier des points scatter

        // Texte
        item.append("span")
            .text(key)
            .style("color", "#fff")
            .style("font-size", "0.9em");
    });

    // Init
    updateRadarChart(clusters[0]);
});