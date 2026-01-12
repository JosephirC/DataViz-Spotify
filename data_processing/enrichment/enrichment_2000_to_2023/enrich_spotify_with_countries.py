#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour enrichir le CSV Spotify avec les pays des artistes
Utilise l'API MusicBrainz pour récupérer le pays d'origine de chaque artiste
"""

import requests
import time
import csv
from datetime import datetime
import sys

# Configuration
INPUT_FILE = 'Best Songs on Spotify from 2000-2023.csv'
OUTPUT_FILE = 'spotify_enriched_with_countries.csv'
REPORT_FILE = 'enrichment_report.txt'

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
        
        Returns:
            tuple: (country_code, matched_artist_name) ou (None, artist_name)
        """
        try:
            # Nettoyer le nom de l'artiste
            clean_name = artist_name.strip()
            
            # Construire l'URL de recherche
            url = f"https://musicbrainz.org/ws/2/artist/?query=artist:{clean_name}&fmt=json"
            
            # Headers requis par MusicBrainz
            headers = {
                'User-Agent': 'SpotifyVisualization/1.0 (educational project)',
                'Accept': 'application/json'
            }
            
            # Faire la requête
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Vérifier s'il y a des résultats
                if data.get('artists') and len(data['artists']) > 0:
                    artist = data['artists'][0]  # Premier résultat (meilleur match)
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
            
            elif response.status_code == 503:
                print(f"⚠️  Service temporairement indisponible, pause de 5 secondes...")
                time.sleep(5)
                return self.get_artist_country(artist_name)  # Retry
            
            return None, clean_name
        
        except requests.exceptions.Timeout:
            print(f"⏱️  Timeout pour {artist_name}")
            self.error_artists.append(artist_name)
            return None, artist_name
        
        except Exception as e:
            print(f"❌ Erreur pour {artist_name}: {str(e)[:50]}...")
            self.error_artists.append(artist_name)
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
                reader = csv.DictReader(infile, delimiter=';')
                fieldnames = reader.fieldnames + ['country']
                
                rows = list(reader)
                total_rows = len(rows)
                self.stats['total'] = total_rows
                
                print(f"✅ {total_rows} chansons à traiter\n")
                print("🔍 Début de l'enrichissement...")
                print("-"*80)
                
                # Ouvrir le fichier de sortie
                with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as outfile:
                    writer = csv.DictWriter(outfile, fieldnames=fieldnames, delimiter=';')
                    writer.writeheader()
                    
                    # Traiter chaque ligne
                    for i, row in enumerate(rows, 1):
                        artist = row['artist']
                        
                        # Récupérer le pays
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
                        print(f"[{i:4}/{total_rows}] {progress:5.1f}% | {artist:<30} → {status}")
                        
                        # Écrire dans le fichier de sortie
                        writer.writerow(row)
                        
                        # Respecter le rate limit
                        if i < total_rows:  # Pas de pause après le dernier
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
