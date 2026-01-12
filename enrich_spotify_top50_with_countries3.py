"""
Script pour enrichir le CSV Spotify avec les pays des artistes
Utilise l'API MusicBrainz pour récupérer le pays d'origine de chaque artiste

Adapté au nouveau dataset "Top50" :
- séparateur CSV: ','
- colonne artistes: 'artists' (peut contenir plusieurs artistes: "Lady Gaga, Bruno Mars")
- colonne 'country' existe déjà (souvent vide) -> on la remplit si vide, sinon on la laisse

Amélioration demandée :
- si le 1er artiste ne donne rien, essayer le 2e, puis le 3e, etc. (fallback)
"""

import requests
import time
import csv
from datetime import datetime
import sys

# Configuration
INPUT_FILE = 'raw_data/processed/top_50_from_2023_to_2025.csv'
OUTPUT_FILE = 'raw_data/processed/spotify_enriched_with_countries.csv'
REPORT_FILE = 'raw_data/processed/enrichment_report_top50.txt'

# Rate limiting (MusicBrainz limite à 1 requête/seconde)
RATE_LIMIT_SECONDS = 1.1


class ArtistCountryEnricher:
    def __init__(self):
        self.stats = {
            'total': 0,
            'found': 0,
            'not_found': 0,
            'errors': 0
        }
        self.not_found_artists = []
        self.error_artists = []

    def get_artist_country(self, artist_name):
        """
        Récupère le pays d'un artiste via MusicBrainz API

        Nouveau dataset: artist_name peut contenir plusieurs artistes séparés par virgule.
        On essaie chaque artiste dans l'ordre jusqu'à trouver un pays.

        Returns:
            tuple: (country_code, matched_artist_name) ou (None, last_tried_artist_name)
        """
        try:
            # Nettoyer le champ "artists"
            raw = (artist_name or "").strip()
            if raw == "":
                return None, ""

            # Split multi-artistes (CSV: "Lady Gaga, Bruno Mars")
            # On garde l'ordre: 1er -> 2e -> 3e...
            candidates = [a.strip() for a in raw.split(',') if a.strip()]

            # Si jamais il n'y a pas de virgule / ou format bizarre
            if not candidates:
                candidates = [raw]

            # Headers requis par MusicBrainz
            headers = {
                'User-Agent': 'SpotifyVisualization/1.0 (educational project)',
                'Accept': 'application/json'
            }

            last_tried = candidates[-1]

            # Essayer chaque artiste jusqu'à trouver un pays
            for idx, clean_name in enumerate(candidates, 1):
                last_tried = clean_name

                # Construire l'URL de recherche
                url = f"https://musicbrainz.org/ws/2/artist/?query=artist:{clean_name}&fmt=json"

                # Faire la requête
                response = requests.get(url, headers=headers, timeout=10)

                if response.status_code == 200:
                    data = response.json()

                    # Vérifier s'il y a des résultats
                    if data.get('artists') and len(data['artists']) > 0:
                        # Premier résultat (meilleur match)
                        artist = data['artists'][0]
                        matched_name = artist.get('name', clean_name)

                        # Méthode 1: Champ 'country' direct
                        if 'country' in artist and artist['country']:
                            return artist['country'], matched_name

                        # Méthode 2: Via 'area' -> 'iso-3166-1-codes'
                        if 'area' in artist and artist['area']:
                            area = artist['area']
                            if 'iso-3166-1-codes' in area and area['iso-3166-1-codes']:
                                return area['iso-3166-1-codes'][0], matched_name

                        # Méthode 3: Via 'begin-area' (lieu de naissance)
                        if 'begin-area' in artist and artist['begin-area']:
                            begin_area = artist['begin-area']
                            if 'iso-3166-1-codes' in begin_area and begin_area['iso-3166-1-codes']:
                                return begin_area['iso-3166-1-codes'][0], matched_name

                    # Aucun pays trouvé pour ce candidat -> on passe au suivant

                elif response.status_code == 503:
                    print(
                        f"⚠️  Service temporairement indisponible, pause de 5 secondes...")
                    time.sleep(5)
                    # Re-essayer le même candidat en relançant la fonction complète
                    return self.get_artist_country(artist_name)

                else:
                    # Code HTTP inattendu : on considère ça comme une erreur pour ce candidat
                    # On tente quand même les autres candidats
                    self.stats['errors'] += 1
                    self.error_artists.append(clean_name)

                # Respecter le rate limit ENTRE candidats (sinon plusieurs requêtes dans une même ligne explosent la limite)
                if idx < len(candidates):
                    time.sleep(RATE_LIMIT_SECONDS)

            # Aucun candidat n'a donné un pays
            return None, last_tried

        except requests.exceptions.Timeout:
            print(f"⏱️  Timeout pour {artist_name}")
            self.error_artists.append(artist_name)
            self.stats['errors'] += 1
            return None, artist_name

        except Exception as e:
            print(f"❌ Erreur pour {artist_name}: {str(e)[:50]}...")
            self.error_artists.append(artist_name)
            self.stats['errors'] += 1
            return None, artist_name

    def enrich_csv(self):
        """
        Enrichit le CSV avec les pays des artistes
        """
        print("="*80)
        print("🎵 ENRICHISSEMENT SPOTIFY CSV AVEC PAYS DES ARTISTES")
        print("="*80)
        print(f"\n📂 Fichier d'entrée: {INPUT_FILE}")
        print(f"📂 Fichier de sortie: {OUTPUT_FILE}")
        print(f"📂 Rapport: {REPORT_FILE}\n")

        start_time = datetime.now()

        # Lire le CSV d'entrée
        try:
            with open(INPUT_FILE, 'r', encoding='utf-8-sig') as infile:
                # Nouveau dataset: séparateur virgule
                reader = csv.DictReader(infile, delimiter=',')

                # Le nouveau dataset a déjà 'country' -> ne pas dupliquer la colonne
                fieldnames = list(
                    reader.fieldnames) if reader.fieldnames else []
                if 'country' not in fieldnames:
                    fieldnames = fieldnames + ['country']

                rows = list(reader)
                total_rows = len(rows)
                self.stats['total'] = total_rows

                print(f"✅ {total_rows} chansons à traiter\n")
                print("🔍 Début de l'enrichissement...")
                print("-"*80)

                # Ouvrir le fichier de sortie
                with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as outfile:
                    writer = csv.DictWriter(
                        outfile, fieldnames=fieldnames, delimiter=',')
                    writer.writeheader()

                    # Traiter chaque ligne
                    for i, row in enumerate(rows, 1):
                        # Nouveau dataset: colonne 'artists' (pas 'artist')
                        artist = row.get('artists', '')

                        # Si le pays est déjà rempli, on le garde tel quel
                        existing_country = (row.get('country') or '').strip()
                        if existing_country != '':
                            status = f"↩️  Déjà présent ({existing_country})"
                            progress = (i / total_rows) * 100
                            print(
                                f"[{i:4}/{total_rows}] {progress:5.1f}% | {artist:<30} → {status}")
                            writer.writerow(row)
                            continue

                        # Récupérer le pays (fallback multi-artistes)
                        country, matched_name = self.get_artist_country(artist)

                        if country:
                            row['country'] = country
                            self.stats['found'] += 1
                            status = f"✅ {country}"
                        else:
                            row['country'] = 'UNKNOWN'
                            self.stats['not_found'] += 1
                            self.not_found_artists.append(artist)
                            status = "❌ Non trouvé"

                        # Afficher la progression
                        progress = (i / total_rows) * 100
                        print(
                            f"[{i:4}/{total_rows}] {progress:5.1f}% | {artist:<30} → {status}")

                        # Écrire dans le fichier de sortie
                        writer.writerow(row)

                        # Respecter le rate limit (pause entre lignes)
                        # Note: si la ligne avait plusieurs artistes, get_artist_country() a déjà fait des pauses entre candidats.
                        if i < total_rows:
                            time.sleep(RATE_LIMIT_SECONDS)

                print("-"*80)
                print("✅ Enrichissement terminé !")

        except FileNotFoundError:
            print(f"❌ Erreur: Le fichier '{INPUT_FILE}' n'existe pas !")
            print(f"   Placez le fichier CSV dans le même dossier que ce script.")
            sys.exit(1)

        except Exception as e:
            print(f"❌ Erreur critique: {e}")
            sys.exit(1)

        # Calculer le temps écoulé
        end_time = datetime.now()
        duration = end_time - start_time

        # Générer le rapport
        self.generate_report(start_time, end_time, duration)

        return self.stats

    def generate_report(self, start_time, end_time, duration):
        """
        Génère un rapport détaillé de l'enrichissement
        """
        total = self.stats['total']
        found = self.stats['found']
        not_found = self.stats['not_found']

        success_rate = (found / total * 100) if total > 0 else 0

        report = f"""
{'='*80}
📊 RAPPORT D'ENRICHISSEMENT SPOTIFY CSV
{'='*80}

⏰ TEMPS
  Début:    {start_time.strftime('%Y-%m-%d %H:%M:%S')}
  Fin:      {end_time.strftime('%Y-%m-%d %H:%M:%S')}
  Durée:    {duration}

📈 STATISTIQUES
  Total d'artistes:        {total}
  ✅ Pays trouvés:         {found} ({success_rate:.1f}%)
  ❌ Pays non trouvés:     {not_found} ({100-success_rate:.1f}%)
  ⚠️  Erreurs:              {self.stats['errors']}

📁 FICHIERS
  Entrée:   {INPUT_FILE}
  Sortie:   {OUTPUT_FILE}
  Rapport:  {REPORT_FILE}

{'='*80}
"""

        if self.not_found_artists:
            report += f"\n❌ ARTISTES SANS PAYS ({len(self.not_found_artists)}):\n"
            report += "-"*80 + "\n"
            for artist in self.not_found_artists[:50]:  # Limiter à 50
                report += f"  - {artist}\n"
            if len(self.not_found_artists) > 50:
                report += f"  ... et {len(self.not_found_artists) - 50} autres\n"

        if self.error_artists:
            report += f"\n⚠️  ARTISTES AVEC ERREURS ({len(self.error_artists)}):\n"
            report += "-"*80 + "\n"
            for artist in self.error_artists[:20]:
                report += f"  - {artist}\n"

        report += "\n" + "="*80 + "\n"

        # Afficher le rapport
        print(report)

        # Sauvegarder le rapport
        with open(REPORT_FILE, 'w', encoding='utf-8') as f:
            f.write(report)

        print(f"✅ Rapport sauvegardé dans '{REPORT_FILE}'")


def main():
    """
    Fonction principale
    """
    print("\n")
    enricher = ArtistCountryEnricher()

    try:
        stats = enricher.enrich_csv()

        print("\n" + "="*80)
        print("🎉 SUCCÈS !")
        print("="*80)
        print(f"\n✅ {stats['found']} artistes avec pays récupérés")
        print(f"❌ {stats['not_found']} artistes sans pays (marqués 'UNKNOWN')")
        print(f"\n📂 Fichier enrichi: {OUTPUT_FILE}")
        print(f"📂 Rapport détaillé: {REPORT_FILE}")
        print("\n💡 Vous pouvez maintenant utiliser le fichier enrichi dans votre visualisation !")
        print("="*80 + "\n")

    except KeyboardInterrupt:
        print("\n\n⚠️  Interruption par l'utilisateur (Ctrl+C)")
        print("Le fichier de sortie peut être incomplet.")
        sys.exit(1)


if __name__ == "__main__":
    main()
