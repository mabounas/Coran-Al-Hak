import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import bn from './locales/bn.json';
import bs from './locales/bs.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import tr from './locales/tr.json';
import ur from './locales/ur.json';
import zh from './locales/zh.json';
import { DEFAULT_LANGUAGE_CODE } from '../constants/languages';

export const resources = {
  ar: { translation: ar },
  bn: { translation: bn },
  bs: { translation: bs },
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  id: { translation: id },
  ms: { translation: ms },
  tr: { translation: tr },
  ur: { translation: ur },
  zh: { translation: zh },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE_CODE,
    fallbackLng: DEFAULT_LANGUAGE_CODE,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
}

export default i18n;
