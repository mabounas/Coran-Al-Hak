export interface LanguageOption {
  code: string;
  englishLabel: string;
  nativeLabel: string;
  rtl: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'ar', englishLabel: 'Arabic', nativeLabel: 'العربية', rtl: true },
  { code: 'fr', englishLabel: 'French', nativeLabel: 'Français', rtl: false },
  { code: 'en', englishLabel: 'English', nativeLabel: 'English', rtl: false },
  { code: 'de', englishLabel: 'German', nativeLabel: 'Deutsch', rtl: false },
  { code: 'es', englishLabel: 'Spanish', nativeLabel: 'Español', rtl: false },
  { code: 'ur', englishLabel: 'Urdu', nativeLabel: 'اردو', rtl: true },
  { code: 'tr', englishLabel: 'Turkish', nativeLabel: 'Türkçe', rtl: false },
  { code: 'id', englishLabel: 'Indonesian', nativeLabel: 'Bahasa Indonesia', rtl: false },
  { code: 'bn', englishLabel: 'Bengali', nativeLabel: 'বাংলা', rtl: false },
  { code: 'ms', englishLabel: 'Malay', nativeLabel: 'Bahasa Melayu', rtl: false },
  { code: 'bs', englishLabel: 'Bosnian', nativeLabel: 'Bosanski', rtl: false },
  { code: 'zh', englishLabel: 'Chinese', nativeLabel: '中文', rtl: false },
];

export const DEFAULT_LANGUAGE_CODE = 'ar';

export function isRtlLanguage(code: string): boolean {
  return LANGUAGES.find((lang) => lang.code === code)?.rtl ?? false;
}
