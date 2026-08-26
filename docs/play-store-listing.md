# Google Play Console — fiche à remplir

Compte : **Coran Ummah**, compte personnel, ID `8062393749435918213`.
Package : `com.mabounas.coranalhak`.

## À faire avant toute publication

1. **Valider l'identité** — pièce officielle, non retouchée. Quelques jours.
2. **Confirmer l'accès à un appareil Android** — se connecter une fois à
   l'application mobile Play Console depuis un vrai téléphone Android.
3. **Valider le numéro de téléphone** — par SMS, immédiat.
4. **Test fermé obligatoire** : compte personnel ⇒ **12 testeurs pendant 14
   jours consécutifs** avant d'ouvrir la production.

## Fiche du store

| Champ | Valeur |
|---|---|
| Nom de l'application (30 car.) | `Quran Al Ummah` |
| Catégorie | Livres et références |
| Type | Application, gratuite, sans achat intégré |
| E-mail de contact | mohammed.abounasser@gmail.com |
| Site web | https://coran-al-ummah.vercel.app |
| Politique de confidentialité | https://coran-al-ummah.vercel.app/privacy-policy.html |

**Description courte** (80 caractères max — 79 utilisés) :
```
Lire, écouter et comprendre le Coran : mushaf, tafsir, hadiths, Qibla, prières
```

**Description complète** (4000 caractères max) :
```
Quran Al Ummah réunit la lecture, l'écoute et la compréhension du Coran dans une seule application, sans compte, sans publicité et sans collecte de données.

LIRE
Le texte uthmani présenté comme dans le mushaf : lignes justifiées, médaillons de fin de verset, cadre enluminé, et les vraies pages du mushaf de Médine avec leur découpage en quinze lignes. La lecture suit la langue de votre profil, et un appui sur un verset révèle l'arabe accompagné de sa traduction.

ÉCOUTER
La récitation complète de chaque sourate par treize récitateurs, dont Mishary Rashid Alafasy, Abdul Basit Abdul Samad, Maher Al Muaiqly et Yasser Al-Dosari. La lecture se poursuit en arrière-plan pendant que vous utilisez le reste de l'application.

COMPRENDRE
Le tafsir verset par verset, les grands recueils de hadiths — Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Nasa'i, Malik et les recueils des quarante — ainsi que les douaas classées par situation.

CHERCHER
Un mot dans tout le Coran, tapé au clavier ou dicté à la voix. La recherche arabe ignore les voyelles : un mot écrit sans tashkeel retrouve toutes ses formes dans le texte.

AU QUOTIDIEN
La direction de la Qibla, les horaires de prière du mois pour votre position, la date hégirienne, les 99 noms d'Allah avec leur signification, et vos sourates mises de côté.

DOUZE LANGUES
Arabe, français, anglais, allemand, espagnol, ourdou, turc, indonésien, bengali, malais, bosniaque et chinois, avec prise en charge complète de l'écriture de droite à gauche.
```

## Visuels

| Élément | Fichier | Format |
|---|---|---|
| Icône | `C:\ITLS\captures\playstore\icone-512.png` | 512 × 512 |
| Bannière | `C:\ITLS\captures\playstore\banniere-1024x500.png` | 1024 × 500 |
| Captures téléphone | `C:\ITLS\captures\appstore\*.png` | 2 minimum, 8 acceptées |

Google accepte les captures iPhone telles quelles : il exige seulement un
rapport entre 16:9 et 9:16 et un côté d'au moins 320 px.

## Sécurité des données (équivalent du questionnaire Apple)

| Question | Réponse |
|---|---|
| L'app collecte-t-elle des données ? | **Oui** |
| Type | **Position → Position approximative et précise** |
| Finalité | **Fonctionnalité de l'application** |
| Données partagées avec des tiers ? | **Oui** — coordonnées envoyées à ummahapi.com pour calculer la Qibla et les horaires |
| Données chiffrées en transit ? | **Oui** (HTTPS) |
| L'utilisateur peut-il demander la suppression ? | Sans objet : rien n'est stocké |
| Collecte obligatoire ? | **Non** — une liste de villes remplace la position |
| Microphone / audio | **Non collecté** : traité par la reconnaissance vocale du système, rien n'est conservé ni transmis |

## Classification du contenu

Questionnaire IARC, catégorie « Référence, actualités ou éducation ».
Répondre **Non** à toutes les questions : violence, sexualité, langage grossier,
drogues, jeux d'argent, achats, partage de position avec d'autres utilisateurs,
contenu généré par les utilisateurs.

## Public cible et déclarations

- **Tranche d'âge** : 13 ans et plus (évite les obligations de la politique
  « Familles » ; l'app n'est pas conçue pour les enfants).
- **Contient des publicités** : **Non**.
- **Application d'actualité** : Non. **Application financière** : Non.
- **COVID-19** : Non.

## Envoi du build

L'AAB se téléverse à la main dans Play Console (Production ou Test fermé), ou
avec `eas submit -p android` une fois créé un compte de service Google et son
fichier JSON. Pour la première mise en ligne, le téléversement manuel est plus
simple.
