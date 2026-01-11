const width = 900;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoNaturalEarth1()
    .center([10, 50])     // Europe
    .scale(180)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// verification du bon chargement du GeoJSON
// d3.json("../data/custom.geo.json")
//     .then(d => console.log("GeoJSON OK", d.features.length))
//     .catch(e => console.error("Erreur GeoJSON", e));

d3.json("../data/custom.geo.json").then(geo => {

    svg.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#e0e0e0")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5);
});