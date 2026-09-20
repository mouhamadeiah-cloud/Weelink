import locationsRaw from './syriaLocations.json';

export interface VillageSubdistrict {
  subdistrict: string;
  type: string;
  villages: string[];
}

export interface District {
  district: string;
  subdistricts: VillageSubdistrict[];
}

export interface City {
  city: string;
  type: string;
  neighborhoods: string[];
}

export interface Governorate {
  governorate: string;
  type: 'urban' | 'rural' | 'mixed';
  cities: City[];
  districts: District[];
}

export const SYRIA_LOCATIONS: Governorate[] = locationsRaw as Governorate[];

/**
 * Normalizes Arabic text for sorting and matching:
 * Ignores leading 'ال' or 'الـ' and unifies Alef forms.
 */
export function normalizeForSearchAndSort(text: string): string {
  if (!text) return '';
  let clean = text.trim().toLowerCase();
  
  // Remove diacritics / tashkeel
  clean = clean.replace(/[\u064B-\u065F\u0670]/g, '');
  
  // Strip leading "ال" if word has more than 2 chars
  if (clean.startsWith('ال') && clean.length > 2) {
    clean = clean.slice(2);
  }
  
  // Unify Alef forms
  clean = clean.replace(/^[أإآ]/g, 'ا');
  clean = clean.replace(/ة$/g, 'ه');
  return clean;
}

/**
 * Alphabetical sorting with 'ال' definition prefix ignored
 */
export function arabicSort(a: string, b: string): number {
  const normA = normalizeForSearchAndSort(a);
  const normB = normalizeForSearchAndSort(b);
  return normA.localeCompare(normB, 'ar');
}

/**
 * Filters a list by input query, matching items starting with the entered character(s)
 */
export function filterItemsByPrefix(items: string[], query: string): string[] {
  if (!query || !query.trim()) {
    return [...items].sort(arabicSort);
  }

  const q = query.trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '');
  const qNorm = normalizeForSearchAndSort(q);

  const exactStarts: string[] = [];
  const normalizedStarts: string[] = [];
  const contains: string[] = [];

  for (const item of items) {
    const itemClean = item.trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '');
    const itemNorm = normalizeForSearchAndSort(item);

    if (itemClean.startsWith(q)) {
      exactStarts.push(item);
    } else if (itemNorm.startsWith(qNorm)) {
      normalizedStarts.push(item);
    } else if (itemClean.includes(q) || itemNorm.includes(qNorm)) {
      contains.push(item);
    }
  }

  exactStarts.sort(arabicSort);
  normalizedStarts.sort(arabicSort);
  contains.sort(arabicSort);

  return [...new Set([...exactStarts, ...normalizedStarts, ...contains])];
}

/**
 * Returns all governorates sorted alphabetically
 */
export function getGovernorates(): Governorate[] {
  return [...SYRIA_LOCATIONS].sort((a, b) => arabicSort(a.governorate, b.governorate));
}

/**
 * Returns cities for a governorate sorted
 */
export function getCitiesForGovernorate(govName: string): City[] {
  const gov = SYRIA_LOCATIONS.find((g) => g.governorate === govName);
  if (!gov || !gov.cities) return [];
  return [...gov.cities].sort((a, b) => arabicSort(a.city, b.city));
}

/**
 * Returns neighborhoods for a city sorted
 */
export function getNeighborhoodsForCity(govName: string, cityName: string): string[] {
  const gov = SYRIA_LOCATIONS.find((g) => g.governorate === govName);
  if (!gov || !gov.cities) return [];
  const cityObj = gov.cities.find((c) => c.city === cityName);
  if (!cityObj || !cityObj.neighborhoods) return [];
  return [...cityObj.neighborhoods].sort(arabicSort);
}

/**
 * Returns districts for rural mode
 */
export function getDistrictsForGovernorate(govName: string): District[] {
  const gov = SYRIA_LOCATIONS.find((g) => g.governorate === govName);
  if (!gov || !gov.districts) return [];
  return [...gov.districts].sort((a, b) => arabicSort(a.district, b.district));
}

/**
 * Returns subdistricts for a district
 */
export function getSubdistrictsForDistrict(govName: string, districtName: string): VillageSubdistrict[] {
  const districts = getDistrictsForGovernorate(govName);
  const dist = districts.find((d) => d.district === districtName);
  if (!dist || !dist.subdistricts) return [];
  return [...dist.subdistricts].sort((a, b) => arabicSort(a.subdistrict, b.subdistrict));
}

/**
 * Returns villages for a subdistrict
 */
export function getVillagesForSubdistrict(
  govName: string,
  districtName: string,
  subdistrictName: string
): string[] {
  const subdistricts = getSubdistrictsForDistrict(govName, districtName);
  const sub = subdistricts.find((s) => s.subdistrict === subdistrictName);
  if (!sub || !sub.villages) return [];
  return [...sub.villages].sort(arabicSort);
}
