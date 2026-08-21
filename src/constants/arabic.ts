const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

// U+06DD END OF AYAH: renders the verse number inside the traditional medallion
// when the font provides the glyph (Amiri Quran does).
const END_OF_AYAH = '۝';

export function toArabicNumerals(value: number): string {
  return String(value)
    .split('')
    .map((char) => ARABIC_INDIC_DIGITS[Number(char)] ?? char)
    .join('');
}

export function ayahMarker(ayah: number): string {
  return `${END_OF_AYAH}${toArabicNumerals(ayah)}`;
}

// Harakat, quranic annotation signs, superscript alef and tatweel: everything a
// reader types (or dictates) without, while the mushaf text carries them all.
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/**
 * Folds an Arabic string down to its bare letters so that a word typed without
 * tashkeel still matches the vocalised text of the mushaf.
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(ARABIC_MARKS, '')
    .replace(/[آأإٱٲٳ]/g, 'ا') // alef variants
    .replace(/ة/g, 'ه') // ta marbuta -> ha
    .replace(/ى/g, 'ي') // alef maqsura -> ya
    .replace(/ؤ/g, 'و') // waw with hamza -> waw
    .replace(/ئ/g, 'ي') // ya with hamza -> ya
    .replace(/[^ء-يa-z0-9\s]/gi, '')
    .toLowerCase()
    .trim();
}

const ARABIC_LETTER = /[؀-ۿ]/;

export function containsArabic(text: string): boolean {
  return ARABIC_LETTER.test(text);
}
