console.log("Home chargé");

const width = 1600;
const height = 1200;

const test = d3.select("#map")
    .append("h2")
    .text("Carte SVG avec D3.js");

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoNaturalEarth1()
    .center([10, 50])
    .scale(320)
    .translate([width / 2, height / 2.5]);

const path = d3.geoPath().projection(projection);

// on oublie le select car on a ps le bon dataset
/** pas bon dataset donc on oublie
let selectedYear = 2023;

const yearSlider = document.getElementById('yearSlider');
const yearDisplay = document.getElementById('yearDisplay');

// Vérification
console.log("Slider trouvé:", yearSlider);
console.log("Display trouvé:", yearDisplay);

// Écouteur d'événement pour le curseur
yearSlider.addEventListener('input', function() {
    selectedYear = parseInt(this.value);
    yearDisplay.textContent = selectedYear;

    // Mettre à jour le remplissage violet
    const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    this.style.background = `linear-gradient(to right, #A238FF ${percent}%, #e0e0e0 ${percent}%)`;

    console.log("Année sélectionnée:", selectedYear);
    updateMap(selectedYear);
});

// Initialiser le remplissage au chargement
const initialPercent = ((yearSlider.value - yearSlider.min) / (yearSlider.max - yearSlider.min)) * 100;
yearSlider.style.background = `linear-gradient(to right, #A238FF ${initialPercent}%, #e0e0e0 ${initialPercent}%)`;

**/


d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(data => {
        console.log("TopoJSON chargé :", data);

        const countries = topojson.feature(data, data.objects.countries);

        // Sélectionner le tooltip
        const tooltip = d3.select("#tooltip");

        svg.selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#e0e0e0")
            .attr("stroke", "#999")
            .attr("stroke-width", 0.5)
            .attr("class", "country")
            // Événement au survol
            .on("mouseover", function(event, d) {
                // Changer la couleur du pays
                d3.select(this)
                    .attr("fill", "#A238FF");

                const countryName = getCountryNameById(d.id);

                // Afficher le tooltip avec le nom
                tooltip
                    .style("opacity", 1)
                    //.html(`<strong>${countryName}</strong><br>Année: ${selectedYear}`)
                    .html(`<strong>${countryName}</strong>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            // Événement quand on quitte
            .on("mouseout", function() {
                // Remettre la couleur d'origine
                d3.select(this)
                    .attr("fill", "#e0e0e0");

                // Cacher le tooltip
                tooltip.style("opacity", 0);
            });
    })
    .catch(error => {
        console.error("Erreur chargement TopoJSON :", error);
    });

/**
function updateMap(year) {
    console.log("Mise à jour de la carte pour l'année:", year);
}
 **/