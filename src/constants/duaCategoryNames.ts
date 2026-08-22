import type { DuaCategory } from '../types/dua';

// Arabic names for the dua category ids the API actually returns; it only
// names them in English. Unknown ids fall back to that English name.
const ARABIC_NAMES: Record<string, string> = {
  morning: 'أذكار الصباح',
  evening: 'أذكار المساء',
  wudu: 'الوضوء والطهارة',
  prayer: 'الصلاة',
  after_prayer: 'بعد الصلاة',
  sleep: 'قبل النوم',
  food: 'الطعام والشراب',
  travel: 'السفر',
  home: 'دخول وخروج المنزل',
  masjid: 'المسجد',
  distress: 'الكرب والهم',
  forgiveness: 'الاستغفار والتوبة',
  illness: 'المرض والشفاء',
  weather: 'الطقس',
  knowledge: 'طلب العلم',
  parents: 'الوالدان',
  guidance: 'الهداية',
  gratitude: 'الشكر',
  protection: 'الحماية والحفظ',
  dhikr: 'الذكر',
  marriage: 'الزواج',
  hajj: 'الحج والعمرة',
  grief: 'دعاء للأموات',
  children: 'الأولاد',
  business: 'العمل والرزق',
  night_prayer: 'صلاة الليل',
  quran_recitation: 'تلاوة القرآن',
};

export function getCategoryDisplayName(category: DuaCategory, language: string): string {
  if (language === 'ar') {
    return ARABIC_NAMES[category.id] ?? category.name;
  }
  return category.name;
}
