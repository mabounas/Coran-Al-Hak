// BCP-47 tags handed to the speech recognizer, one per app language.
const SPEECH_LOCALES: Record<string, string> = {
  ar: 'ar-SA',
  fr: 'fr-FR',
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  ur: 'ur-PK',
  tr: 'tr-TR',
  id: 'id-ID',
  bn: 'bn-BD',
  ms: 'ms-MY',
  bs: 'bs-BA',
  zh: 'zh-CN',
};

export function getSpeechLocale(language: string): string {
  return SPEECH_LOCALES[language] ?? 'en-US';
}
