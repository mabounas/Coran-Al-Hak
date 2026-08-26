# Réponse à Apple — Guideline 2.5.4 (background audio)

Apple avait raison : `UIBackgroundModes: ["audio"]` était bien déclaré, mais
`expo-audio` n'activait jamais la session en arrière-plan
(`shouldPlayInBackground` vaut `false` par défaut), donc la récitation
s'arrêtait dès que l'app passait en arrière-plan. Corrigé dans
`src/context/AudioPlayerContext.tsx`, build **1.0.0 (13)**.

Vidéo à enregistrer avant d'envoyer la réponse : lancer une sourate depuis
« Écouter le Coran », attendre la lecture, **revenir à l'écran d'accueil de
l'iPhone** et laisser filmer 15 à 20 secondes pendant que le son continue.

---

Thank you for the additional review.

The app does have a persistent audio feature: the full recitation of a surah by
one of thirteen reciters, which the user starts from the "Listen to the Quran"
screen and is meant to keep playing while the device is locked or while another
app is in use.

You were right that build 12 did not deliver it. The background audio mode was
declared in the Info.plist, but the audio session was not configured to stay
active when the app left the foreground, so playback stopped. We have fixed the
audio session configuration, and background playback now works as intended.

Build **1.0.0 (13)** contains the fix, and the screen recording below was made
on a physical iPhone with that build: a surah is started, the Home Screen is
opened, and the recitation continues.

<<URL DE LA VIDÉO>>

To reproduce: open the app, tap "Listen to the Quran", pick any surah and a
reciter, press play, then return to the Home Screen or lock the device — the
recitation keeps playing.
