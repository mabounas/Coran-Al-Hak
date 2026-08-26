# Réponse à Apple — Guideline 2.1, Information Needed

À coller dans **Centre de résolution → Répondre à l'équipe de vérification**,
puis, une fois acceptée, dans le champ **Notes** de la section *Informations
utiles à la vérification de l'app*, pour les soumissions suivantes.

Deux champs restent à compléter par toi : le **modèle d'iPhone** et la
**version d'iOS** utilisés (point 2), et l'**URL de la vidéo** (point 1).

---

Thank you for reviewing Quran Al Ummah.

The app is a free Quran reader and study tool. It has **no account, no login, no
registration, no in-app purchase, no subscription, no advertising, no
user-generated content and no tracking**. None of the flows listed in your first
point exist in the app, apart from two permission prompts (location and
microphone), which are both shown in the recording.

**1. Screen recording**

<<URL DE LA VIDÉO>>

The recording starts with the app launch and goes through the core features:
home screen, reading a surah in the mushaf layout, tapping a verse to reveal its
translation, listening to a recitation, searching for a word by keyboard and by
dictation (microphone prompt shown), the Qibla compass (location prompt shown),
the monthly prayer timetable, the tafsir and the hadith collections.

**2. Devices and operating systems tested**

- <<MODÈLE D'IPHONE>> running iOS <<VERSION>>
- The same build, 1.0.0 (12), was distributed through TestFlight and tested on a
  physical device before submission.

**3. Functions and target audience**

Quran Al Ummah is intended for Muslim readers of any language who want to read,
listen to and understand the Quran on their phone. It solves a problem common to
this audience: existing tools usually cover a single need — reading, or audio,
or commentary — and most are available in only one or two languages.

The app brings together in one place:
- the complete Quran in the Uthmani script, presented as in the printed mushaf,
  including the 604 pages of the Madina mushaf with their exact line layout;
- verse translations in 11 languages;
- recitation of every surah by 13 reciters, with background playback;
- verse-by-verse tafsir;
- the major hadith collections;
- supplications grouped by occasion;
- the Qibla direction, monthly prayer times, the Hijri date and the 99 names of
  Allah;
- word search across the whole Quran, typed or dictated, which ignores Arabic
  diacritics so that a word written without them still matches every form.

The interface is available in 12 languages, with full right-to-left support.

**4. How to access the features**

No credentials, sample files or setup are required; every screen is reachable
without signing in. From the home screen, each tile opens one feature directly.
The side menu gives access to prayer times, the 99 names, saved surahs and
settings.

Two features ask for a permission, and both offer a manual alternative if it is
declined:
- **Location** — used by the Qibla compass and the prayer timetable. Declining
  it leaves a city list to choose from.
- **Microphone** — used only for optional voice search, started by tapping the
  microphone button. Declining it leaves the keyboard.

**5. External services used**

- **ummahapi.com** — Quran text and metadata, verse translations, hadith
  collections, supplications, prayer times, Qibla direction, Hijri date.
- **api.quran-tafseer.com** — verse commentary, requested through our own server
  at coran-al-ummah.vercel.app because that service is HTTP only.
- **quranicaudio.com** and **everyayah.com** — recitation audio streams.
- **Apple's on-device speech recognition** — optional voice search.

There is no analytics SDK, no advertising SDK, no payment processor, no
authentication service and no AI service in the app.

**6. Regional differences**

None. The app offers the same features and the same content in every region.
The only values that differ between users are those derived from their own
position — the Qibla bearing and the prayer times — which are computed from the
coordinates they allow the app to use, or from the city they pick manually.

**7. Third-party material**

The Arabic text of the Quran is in the public domain; it is the only content
shipped inside the app.

Everything else is retrieved at runtime from public services that publish this
material free of charge for use in Quran applications: verse translations,
hadith collections and supplications from UmmahAPI (ummahapi.com), and the
commentary at-Tafsir al-Muyassar from api.quran-tafseer.com. Recitation audio is
streamed from quranicaudio.com and everyayah.com, which distribute these
recordings publicly. The app credits these sources on its About screen and does
not redistribute the material outside the app.

We do not hold exclusive licences to these works, and we make no such claim. If
Apple requires formal documentation for a specific translation or commentary, we
will gladly remove or replace the source concerned.
