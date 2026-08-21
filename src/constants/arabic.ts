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
