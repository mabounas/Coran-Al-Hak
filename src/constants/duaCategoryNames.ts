import type { DuaCategory } from '../types/dua';

// Best-effort Arabic names for common dua category ids. The API only returns
// English names, so unknown ids fall back to the English name even in Arabic.
const ARABIC_NAMES: Record<string, string> = {
  wudu: 'الوضوء والطهارة',
  morning: 'أذكار الصباح',
  evening: 'أذكار المساء',
  sleep: 'قبل النوم',
  waking_up: 'عند الاستيقاظ',
  eating: 'الطعام والشراب',
  travel: 'السفر',
  home: 'دخول وخروج المنزل',
  mosque: 'المسجد',
  prayer: 'الصلاة',
  distress: 'الكرب والهم',
  forgiveness: 'الاستغفار والتوبة',
  protection: 'الحماية والحفظ',
  rain: 'المطر',
  illness: 'المرض والشفاء',
  funeral: 'الجنازة',
  marriage: 'الزواج',
  children: 'الأولاد',
  knowledge: 'طلب العلم',
  guidance: 'الهداية',
  anxiety: 'القلق والهم',
  gratitude: 'الشكر',
  friday: 'يوم الجمعة',
  ramadan: 'رمضان',
  hajj: 'الحج والعمرة',
};

export function getCategoryDisplayName(category: DuaCategory, language: string): string {
  if (language === 'ar') {
    return ARABIC_NAMES[category.id] ?? category.name;
  }
  return category.name;
}
