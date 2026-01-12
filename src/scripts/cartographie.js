console.log("Home chargé");

// ==================== Configuration des datasets ====================//

const DATASETS = {
    top50: {
        file: "../data/top_50_71Countries_from_2023_to_2025.csv",
        yearMin: 2023,
        yearMax: 2025,
        defaultYear: 2025,
        name: "Top 50 de 71 pays",
        type: "byCountry"  // Structure avec snapshot_date
    },
    bestsongs: {
        file: "../data/top_50mondialSongPerYear_from_2000_to_2023.csv",
        yearMin: 2000,
        yearMax: 2022,
        defaultYear: 2022,
        name: "Top 50 songs mondiaux par année",
        type: "worldwide"  // Structure avec year direct
    }
};

let currentDataset = 'top50';
let selectedYear = DATASETS[currentDataset].defaultYear;
let spotifyData = null;

// ==================== Carte SVG avec D3.js ====================//

const width = 1600;
const height = 1200;

const test = d3.select("#map")
    .append("h2")
    .text("Carte Planisphère D3.js");

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoNaturalEarth1()
    .center([10, 50])
    .scale(320)
    .translate([width / 2, height / 4.5]);

const path = d3.geoPath().projection(projection);

// ==================== Fonction pour charger un dataset ====================//

function loadDataset(datasetKey) {
    currentDataset = datasetKey;
    const config = DATASETS[datasetKey];

    // Mettre à jour le curseur
    updateYearSlider(config.yearMin, config.yearMax, config.defaultYear);

    // Charger les données
    d3.csv(config.file)
        .then(data => {
            
            // Organiser les données selon le type de dataset
            if (config.type === "byCountry") {
                spotifyData = organizeDataByCountryAndYear(data);
            } else if (config.type === "worldwide") {
                spotifyData = organizeWorldwideData(data);
            }

            // Charger/Mettre à jour la carte
            loadMap();
        })
        .catch(error => {
            console.error("❌ Erreur chargement CSV:", error);
        });
}

// ==================== Fonction pour organiser les données (Top 50 par pays) ====================//

function organizeDataByCountryAndYear(data) {
    const organized = {};

    data.forEach(row => {
        if (!row.country || !row.snapshot_date) return;

        const year = parseInt(row.snapshot_date.split('-')[0]);
        const country = row.country;

        if (!organized[year]) {
            organized[year] = {};
        }
        if (!organized[year][country]) {
            organized[year][country] = [];
        }

        organized[year][country].push(row);
    });

    return organized;
}

// ==================== Fonction pour organiser les données (Top mondial) ====================//

function organizeWorldwideData(data) {
    const organized = {};

    data.forEach(row => {
        if (!row.country || !row.year || row.country === 'UNKNOWN') return;

        const year = parseInt(parseFloat(row.year)); // Gérer 2000.0 → 2000
        const country = row.country;

        if (!organized[year]) {
            organized[year] = {};
        }
        if (!organized[year][country]) {
            organized[year][country] = [];
        }

        organized[year][country].push(row);
    });

    return organized;
}

// ==================== Fonction pour mettre à jour le curseur ====================//

function updateYearSlider(min, max, defaultValue) {
    const slider = document.getElementById('yearSlider');
    const display = document.getElementById('yearDisplay');
    const minLabel = document.getElementById('yearMin');
    const maxLabel = document.getElementById('yearMax');

    slider.min = min;
    slider.max = max;
    slider.value = defaultValue;

    display.textContent = defaultValue;
    minLabel.textContent = min;
    maxLabel.textContent = max;

    selectedYear = defaultValue;

    // Mettre à jour le remplissage violet
    const percent = ((defaultValue - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #A238FF ${percent}%, #e0e0e0 ${percent}%)`;
}

// ==================== Fonction pour obtenir les pays avec données pour une année ====================//

function getCountriesForYear(year) {
    if (!spotifyData || !spotifyData[year]) {
        return new Set();
    }
    return new Set(Object.keys(spotifyData[year]));
}

// ==================== Fonction pour obtenir le nombre de chansons par pays ====================//

function getSongCountForCountry(year, country) {
    if (!spotifyData || !spotifyData[year] || !spotifyData[year][country]) {
        return 0;
    }
    return spotifyData[year][country].length;
}

// ==================== Fonction pour obtenir la couleur selon le nombre de chansons ====================//

function getColorByIntensity(songCount) {
    const config = DATASETS[currentDataset];
    
    if (config.type === "byCountry") {
        // Dataset par pays : tous ont ~50 chansons, couleur uniforme
        return songCount > 0 ? "#e3c6ff" : "#ffffff";
    } else {
        // Dataset mondial : échelle de couleur ACCENTUÉE (9 niveaux)
        if (songCount === 0) return "#ffffff";      // Blanc
        if (songCount === 1) return "#f5edff";      // Très très pâle
        if (songCount === 2) return "#ead9ff";      // Très pâle
        if (songCount <= 4) return "#d9c2ff";       // Pâle
        if (songCount <= 8) return "#c299ff";       // Moyen clair
        if (songCount <= 15) return "#a970ff";      // Moyen
        if (songCount <= 25) return "#9147ff";      // Foncé
        if (songCount <= 40) return "#7a2ed9";      // Très foncé
        return "#6100cc";  // Ultra foncé (USA avec 50+ chansons)
    }
}

// ==================== Affichage de la carte ====================//

function loadMap() {
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(data => {

            const countries = topojson.feature(data, data.objects.countries);
            const tooltip = d3.select("#tooltip");

            // Supprimer les anciens paths si existants
            svg.selectAll("path").remove();

            // Dessiner les pays
            svg.selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", function(d) {
                    const alpha2 = getCountryAlpha2ById(d.id);
                    const songCount = getSongCountForCountry(selectedYear, alpha2);
                    return getColorByIntensity(songCount);
                })
                .attr("stroke", "#999")
                .attr("stroke-width", 0.5)
                .attr("class", "country")
                // Événement au survol
                .on("mouseover", function (event, d) {
                    const alpha2 = getCountryAlpha2ById(d.id);
                    const songCount = getSongCountForCountry(selectedYear, alpha2);
                    
                    d3.select(this).attr("fill", "#A238FF");

                    const countryName = getCountryNameById(d.id);
                    
                    const config = DATASETS[currentDataset];
                    let tooltipText = `<strong>${countryName}</strong><br>Année: ${selectedYear}<br>`;
                    
                    if (songCount > 0) {
                        if (config.type === "byCountry") {
                            tooltipText += `✅ Top 50 disponible (${songCount} chansons)`;
                        } else {
                            tooltipText += `✅ ${songCount} chanson${songCount > 1 ? 's' : ''} dans le top mondial`;
                        }
                    } else {
                        tooltipText += "❌ Pas de données";
                    }

                    tooltip
                        .style("opacity", 1)
                        .html(tooltipText)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                // Événement quand on quitte
                .on("mouseout", function(event, d) {
                    const alpha2 = getCountryAlpha2ById(d.id);
                    const songCount = getSongCountForCountry(selectedYear, alpha2);

                    d3.select(this).attr("fill", getColorByIntensity(songCount));
                    tooltip.style("opacity", 0);
                })
                // Événement au clic
                .on("click", function(event, d) {
                    const alpha2 = getCountryAlpha2ById(d.id);
                    const countryName = getCountryNameById(d.id);
                    const songCount = getSongCountForCountry(selectedYear, alpha2);

                    if (songCount > 0) {
                        showCountrySongs(alpha2, countryName, selectedYear);
                    }
                });
        })
        .catch(error => {
            console.error("❌ Erreur chargement TopoJSON:", error);
        });
}

// ==================== Fonction pour mettre à jour la carte ====================//

function updateMap(year) {
    selectedYear = year;

    if (!spotifyData) {
        return;
    }

    // Mettre à jour les couleurs des pays
    svg.selectAll("path")
        .attr("fill", function(d) {
            const alpha2 = getCountryAlpha2ById(d.id);
            const songCount = getSongCountForCountry(year, alpha2);
            return getColorByIntensity(songCount);
        });
    
    const countriesWithData = getCountriesForYear(year);
}

// ==================== Affichage des chansons d'un pays ====================//

function showCountrySongs(alpha2, countryName, year) {
    
    // Récupérer les données du pays pour l'année
    if (!spotifyData[year] || !spotifyData[year][alpha2]) {
        console.error(`Pas de données pour ${alpha2} en ${year}`);
        return;
    }

    const songs = spotifyData[year][alpha2];
    const config = DATASETS[currentDataset];

    // Afficher le conteneur
    const container = document.getElementById('top50-container');
    container.style.display = 'block';

    // Mettre à jour le titre selon le type de dataset
    let titleText = `${countryName} - ${year}`;
    if (config.type === "worldwide") {
        titleText += ` (${songs.length} chanson${songs.length > 1 ? 's' : ''} dans le top mondial)`;
    }
    document.getElementById('country-name').textContent = titleText;

    // Trier les chansons
    const sortedSongs = Array.from(songs).sort((a, b) => {
        // Si dataset byCountry : trier par daily_rank
        if (config.type === "byCountry") {
            return parseInt(a.daily_rank) - parseInt(b.daily_rank);
        }
        // Si dataset worldwide : trier par popularité décroissante
        return parseInt(b.popularity) - parseInt(a.popularity);
    });

    // Créer le tableau HTML
    let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background: #A238FF; color: white;">
                    ${config.type === "byCountry" ? '<th style="padding: 12px; text-align: left;">Rang</th>' : ''}
                    <th style="padding: 12px; text-align: left;">Titre</th>
                    <th style="padding: 12px; text-align: left;">Artiste</th>
                    ${config.type === "worldwide" ? '<th style="padding: 12px; text-align: center;">Genre</th>' : ''}
                    <th style="padding: 12px; text-align: center;">${config.type === "byCountry" ? 'Lecteur 🎵' : 'Spotify 🎵'}</th>
                    <th style="padding: 12px; text-align: center;">Popularité</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Ajouter les lignes
    sortedSongs.forEach((song, index) => {
        const bgColor = index % 2 === 0 ? '#f7f4ff' : '#ffffff';
        
        if (config.type === "byCountry") {
            // Tableau pour dataset par pays (avec lecteur Spotify)
            tableHTML += `
                <tr style="background: ${bgColor};">
                    <td style="padding: 10px; font-weight: bold; color: #A238FF;">#${song.daily_rank}</td>
                    <td style="padding: 10px; color: #2d3748;">${song.name}</td>
                    <td style="padding: 10px; color: #4a5568;">${song.artists}</td>
                    <td style="padding: 10px; text-align: center;">
                        <button 
                            class="play-button" 
                            data-spotify-id="${song.spotify_id}"
                            data-song-name="${song.name}"
                            data-artist="${song.artists}"
                            style="background: #A238FF; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 14px;"
                        >
                            ▶️ Play
                        </button>
                    </td>
                    <td style="padding: 10px; text-align: center; color: #2d3748;">${song.popularity}</td>
                </tr>
            `;
        } else {
            // Tableau pour dataset mondial (avec bouton recherche Spotify)
            const title = song.title || song.name || '';
            const artist = song.artist || song.artists || '';
            const searchQuery = encodeURIComponent(`${artist} ${title}`);
            const spotifySearchUrl = `https://open.spotify.com/search/${searchQuery}`;
            
            tableHTML += `
                <tr style="background: ${bgColor};">
                    <td style="padding: 10px; color: #2d3748; font-weight: 500;">${title || 'N/A'}</td>
                    <td style="padding: 10px; color: #4a5568;">${artist || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center; color: #666; font-size: 12px;">${song['top genre'] || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center;">
                        <a href="${spotifySearchUrl}" target="_blank" 
                           style="background: #1DB954; color: white; border: none; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 14px; display: inline-block; cursor: pointer;">
                            🔍 Chercher
                        </a>
                    </td>
                    <td style="padding: 10px; text-align: center; color: #2d3748; font-weight: bold;">${song.popularity || 'N/A'}</td>
                </tr>
            `;
        }
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    // Insérer le tableau
    document.getElementById('top50-table').innerHTML = tableHTML;

    // Attacher les événements aux boutons play (seulement pour dataset byCountry)
    if (config.type === "byCountry") {
        attachPlayButtonEvents();
    }

    // Scroller vers le tableau
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== Player Spotify ====================//

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

    // Scroller vers le lecteur
    const playerSection = document.getElementById('spotify-player-container');
    playerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================== Bouton Fermer ====================//

function closeTop50() {
    document.getElementById('top50-container').style.display = 'none';
}

// ==================== Initialisation ====================//

document.addEventListener('DOMContentLoaded', function() {

    // Attacher l'événement au bouton fermer
    const closeButton = document.getElementById('close-top50');
    if (closeButton) {
        closeButton.addEventListener('click', closeTop50);
    }

    // Écouter les changements de dataset
    const radioButtons = document.querySelectorAll('input[name="dataset"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                loadDataset(this.value);
            }
        });
    });

    // Gérer le curseur d'année
    const yearSlider = document.getElementById('yearSlider');
    const yearDisplay = document.getElementById('yearDisplay');

    if (yearSlider && yearDisplay) {
        yearSlider.addEventListener('input', function() {
            const year = parseInt(this.value);
            yearDisplay.textContent = year;

            // Mettre à jour le remplissage violet
            const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
            this.style.background = `linear-gradient(to right, #A238FF ${percent}%, #e0e0e0 ${percent}%)`;

            // Mettre à jour la carte
            updateMap(year);
        });
    }

    // Charger le dataset par défaut
    loadDataset(currentDataset);
});
