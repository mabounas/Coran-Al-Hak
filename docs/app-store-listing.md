# App Store Connect — fiche à remplir

Brouillon prêt à copier-coller. Le nom retenu ici est **Quran Al Ummah** (celui
qu'affiche l'application et qu'utilise le domaine) — à confirmer avant le build.

## Informations générales

| Champ | Valeur |
|---|---|
| Bundle ID | `com.mabounas.coranalhak` |
| SKU | `coranalummah-001` |
| Langue principale | Français (ou Anglais, au choix) |
| Catégorie principale | Reference |
| Catégorie secondaire | Education |
| Prix | Gratuit |
| URL de politique de confidentialité | https://coran-al-ummah.vercel.app/privacy-policy.html |
| URL d'assistance | https://coran-al-ummah.vercel.app |
| URL marketing (facultatif) | https://coran-al-ummah.vercel.app |
| Copyright | 2026 Mohamed Abounasser |

## Français

**Nom** (30 car. max) : `Quran Al Ummah`

**Sous-titre** (30 car. max) : `Lecture, écoute et tafsir`

**Texte promotionnel** (170 car. max) :
> Le Coran en 12 langues : lecture en page de mushaf, récitation par 13 lecteurs, tafsir, hadiths, douaas, Qibla, horaires de prière et 99 noms d'Allah.

**Description** :
> Quran Al Ummah réunit la lecture, l'écoute et la compréhension du Coran dans une seule application, sans compte, sans publicité et sans collecte de données.
>
> LIRE
> Le texte uthmani présenté comme dans le mushaf : lignes justifiées, médaillons de fin de verset, cadre enluminé, et les vraies pages du mushaf de Médine avec leur découpage en 15 lignes. La lecture suit la langue de votre profil : le texte s'affiche dans votre langue et un appui sur un verset révèle l'arabe et sa traduction.
>
> ÉCOUTER
> La récitation complète de chaque sourate par treize récitateurs, dont Mishary Rashid Alafasy, Abdul Basit Abdul Samad, Maher Al Muaiqly et Yasser Al-Dosari. La lecture continue en arrière-plan pendant que vous utilisez le reste de l'application.
>
> COMPRENDRE
> Le tafsir verset par verset (التفسير الميسر), les recueils de hadiths — Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Nasa'i, Malik et les recueils des quarante — ainsi que les douaas classées par situation.
>
> CHERCHER
> Un mot dans tout le Coran, tapé au clavier ou dicté à la voix. La recherche arabe ignore les voyelles : « فضل » retrouve « فَضْلُ », « فَضْلِهِۦ » et toutes les formes du mot.
>
> AU QUOTIDIEN
> La direction de la Qibla, les horaires de prière du mois pour votre position, la date hégirienne, les 99 noms d'Allah avec leur signification, et vos sourates mises de côté.
>
> DOUZE LANGUES
> Arabe, français, anglais, allemand, espagnol, ourdou, turc, indonésien, bengali, malais, bosniaque et chinois, avec prise en charge complète de l'écriture de droite à gauche.

**Mots-clés** (100 car. max, séparés par des virgules) :
> coran,quran,islam,tafsir,hadith,qibla,priere,douaa,sourate,mushaf,recitation,muslim

## English

**Name** : `Quran Al Ummah`

**Subtitle** : `Read, listen and understand`

**Promotional text** :
> The Quran in 12 languages: mushaf reading, 13 reciters, tafsir, hadith collections, duas, Qibla, prayer times and the 99 names of Allah.

**Description** :
> Quran Al Ummah brings reading, listening and understanding the Quran together in one app — no account, no ads, no data collection.
>
> READ
> The Uthmani text laid out as in the mushaf: justified lines, end-of-verse medallions, an illuminated frame, and the real Madina mushaf pages with their exact 15-line layout. The reading follows your profile language, and tapping a verse reveals the Arabic together with its translation.
>
> LISTEN
> Full surah recitation from thirteen reciters, including Mishary Rashid Alafasy, Abdul Basit Abdul Samad, Maher Al Muaiqly and Yasser Al-Dosari. Playback continues in the background while you use the rest of the app.
>
> UNDERSTAND
> Verse-by-verse tafsir, the major hadith collections — Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Nasa'i, Malik and the forty-hadith collections — and duas grouped by occasion.
>
> SEARCH
> Any word across the whole Quran, typed or dictated. Arabic search ignores diacritics, so "فضل" finds "فَضْلُ", "فَضْلِهِۦ" and every other form of the word.
>
> EVERY DAY
> The Qibla direction, the month's prayer times for your location, the Hijri date, the 99 names of Allah with their meaning, and the surahs you saved.
>
> TWELVE LANGUAGES
> Arabic, French, English, German, Spanish, Urdu, Turkish, Indonesian, Bengali, Malay, Bosnian and Chinese, with full right-to-left support.

**Keywords** :
> quran,koran,islam,tafsir,hadith,qibla,prayer,dua,surah,mushaf,recitation,muslim

## App Privacy — réponses à donner

Ne pas répondre « aucune donnée collectée » : l'application transmet des
coordonnées à une API tierce.

| Question | Réponse |
|---|---|
| Collectez-vous des données ? | Oui |
| Type | Localisation → **Localisation précise** |
| Usage | Fonctionnalité de l'app (Qibla et horaires de prière) |
| Liée à l'identité de l'utilisateur ? | Non |
| Utilisée pour du suivi publicitaire ? | Non |
| Autres types (contacts, identifiants, achats, historique…) | Non |

Le microphone n'est pas à déclarer comme donnée collectée : l'audio n'est ni
conservé ni transmis à nous, il est traité par la reconnaissance vocale du
système.

## Classification par âge

Toutes les questions à « Aucun / None ». La mention « références religieuses »
n'existe pas dans le questionnaire d'Apple ; l'app reste 4+.

## Notes pour la revue (App Review Information)

> The app needs the microphone only for optional voice search, and the location
> only for the Qibla direction and the monthly prayer timetable. Both are
> requested from an explicit button and both offer a manual fallback (a city
> list for the location, typing for the search). Background audio is used to
> keep the Quran recitation playing while the app is in the background.
> No account is required; every screen is reachable without signing in.

## Captures d'écran attendues

| Appareil | Taille | Obligatoire |
|---|---|---|
| iPhone 6,9" | 1290 × 2796 px | oui |
| iPad 13" | 2064 × 2752 px | seulement si `supportsTablet` reste à `true` |

Écrans à montrer, dans l'ordre suggéré : accueil, page de mushaf, lecture avec
traduction, écoute avec le lecteur, tafsir, recherche, horaires de prière.
