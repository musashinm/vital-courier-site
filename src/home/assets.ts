import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Locale } from '../i18n/ui';
import exampleEn from '../content/home/example-en.md?raw';
import examplePtBr from '../content/home/example-pt-br.md?raw';

export interface HomeAssets {
  dataTypesSrc: string;
  destinationSrc: string;
  markdown: string;
}

const markdownByLocale: Record<Locale, string> = {
  en: exampleEn,
  'pt-br': examplePtBr,
};

export function assertAssetExists(
  path: string,
  exists: (path: string) => boolean,
): void {
  if (!exists(path)) throw new Error(`Missing home asset: ${path}`);
}

export function homeAssets(
  locale: Locale,
  exists: (path: string) => boolean = existsSync,
): HomeAssets {
  const dataTypesSrc = `/home/data-types-${locale}.png`;
  const destinationSrc = `/home/destination-${locale}.png`;
  for (const src of [dataTypesSrc, destinationSrc]) {
    try {
      assertAssetExists(join('public', src), exists);
    } catch {
      throw new Error(`Missing home asset for ${locale}: ${src}`);
    }
  }
  return { dataTypesSrc, destinationSrc, markdown: markdownByLocale[locale] };
}
