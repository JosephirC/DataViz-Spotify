console.log("Home chargé");


//==================== chargement des données spotify ====================//
let spotifyData = null;

d3.csv("../../data/spotify_2025_06_11.csv")
    .then(data => {

        // Organiser les données par pays (code Alpha-2)
        spotifyData = d3.group(data, d => d.country);

        // Charger la carte après les données
        loadMap();
    })
    .catch(error => {
        console.error("❌ Erreur chargement CSV:", error);
    });


// ==================== Carte SVG avec D3.js ====================//
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

function loadMap() {
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
                // .attr("fill", "#e0e0e0") full blanc le background des pays*
                .attr("fill", function(d) {
                    // Récupérer le code Alpha-2 du pays
                    const alpha2 = getCountryAlpha2ById(d.id);

                    // Vérifier si le pays a des données Spotify
                    const data = spotifyData && spotifyData.has(alpha2);

                    // Violet léger si données, gris sinon
                    return data ? "#e3c6ff" : "#ffffff";
                })

                .attr("stroke", "#999")
                .attr("stroke-width", 0.5)
                .attr("class", "country")
                // Événement au survol
                .on("mouseover", function (event, d) {
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
                .on("mouseout", function(event, d) {
                    // Récupérer le code Alpha-2 du pays
                    const alpha2 = getCountryAlpha2ById(d.id);

                    // Vérifier si le pays a des données
                    const hasData = spotifyData && spotifyData.has(alpha2);

                    // Remettre la couleur d'origine (violet léger ou gris)
                    d3.select(this)
                        .attr("fill", hasData ? "#e3c6ff" : "#ffffff");

                    // Cacher le tooltip
                    tooltip.style("opacity", 0);
                })
                .on("click", function(event, d) {
                    const alpha2 = getCountryAlpha2ById(d.id);
                    const countryName = getCountryNameById(d.id);

                    // Vérifier si le pays a des données
                    if (spotifyData && spotifyData.has(alpha2)) {
                        showTop50(alpha2, countryName);
                    } else {
                        console.log("❌ Pas de données pour", countryName);
                    }
                });
        })
        .catch(error => {
            console.error("Erreur chargement TopoJSON :", error);
        });
}

/**
function updateMap(year) {
    console.log("Mise à jour de la carte pour l'année:", year);
}
 **/

// ==================== Affichage du Top 50 ====================//
function showTop50(alpha2, countryName) {

    // Récupérer les données du pays
    const songs = spotifyData.get(alpha2);

    if (!songs || songs.length === 0) {
        console.error("Pas de données pour", alpha2);
        return;
    }

    // Afficher le conteneur
    const container = document.getElementById('top50-container');
    container.style.display = 'block';

    // Mettre à jour le titre
    document.getElementById('country-name').textContent = countryName;

    // Trier les chansons par rang
    const sortedSongs = Array.from(songs).sort((a, b) => {
        return parseInt(a.daily_rank) - parseInt(b.daily_rank);
    });

    // Créer le tableau HTML
    let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
            <tr style="background: #A238FF; color: white;">
                <th style="padding: 12px; text-align: left;">Rang</th>
                <th style="padding: 12px; text-align: left;">Titre</th>
                <th style="padding: 12px; text-align: left;">Artiste</th>
                <th style="padding: 12px; text-align: center;">Lecteur 🎵</th>
                <th style="padding: 12px; text-align: center;">Popularité</th>
            </tr>
        </thead>
        <tbody>
`;

// Ajouter les lignes
    sortedSongs.forEach((song, index) => {
        const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        tableHTML += `
        <tr style="background: ${bgColor} ; color:  #A238FF;">
            <td style="padding: 10px; font-weight: bold; color: #A238FF;">#${song.daily_rank}</td>
            <td style="padding: 10px;">${song.name}</td>
            <td style="padding: 10px;">${song.artists}</td>
            <td style="padding: 10px; text-align: center;">
                <button 
                    class="play-button" 
                    data-spotify-id="${song.spotify_id}"
                    data-song-name="${song.name}"
                    data-artist="${song.artists}"
                    style="background: #a238ff; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 14px;"
                >
                    ▶️ Play
                </button>
            </td>
            <td style="padding: 10px; text-align: center;">${song.popularity}</td>
        </tr>
    `;
    });

    tableHTML += `
        </tbody>
    </table>
`;


    // Insérer le tableau
    document.getElementById('top50-table').innerHTML = tableHTML;

    // ✅ ATTACHER LES ÉVÉNEMENTS AUX BOUTONS PLAY
    attachPlayButtonEvents();

    // Scroller vers le tableau
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============== Player Spotify ==============//

function attachPlayButtonEvents() {
    const playButtons = document.querySelectorAll('.play-button');

    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const spotifyId = this.getAttribute('data-spotify-id');
            const songName = this.getAttribute('data-song-name');
            const artist = this.getAttribute('data-artist');

            loadSpotifyPlayer(spotifyId, songName, artist);
        });
    });

}


function loadSpotifyPlayer(spotifyId, songName, artist) {

    // Mettre à jour le statut
    const playerStatus = document.getElementById('player-status');
    playerStatus.innerHTML = `🎵 En cours : <strong>${songName}</strong> - ${artist}`;

    // Créer l'iframe Spotify
    const playerContainer = document.getElementById('spotify-player');
    playerContainer.innerHTML = `
        <iframe 
            src="https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator" 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            style="border-radius: 12px;"
        ></iframe>
    `;

    const playerSection = document.getElementById('spotify-player-container');
    playerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });


}

//================ close button ================//

function closeTop50() {
    document.getElementById('top50-container').style.display = 'none';
}


document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.getElementById('close-top50');
    if (closeButton) {
        closeButton.addEventListener('click', closeTop50);
    }
});