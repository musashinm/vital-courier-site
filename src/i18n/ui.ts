export const locales = ['en', 'pt-br'] as const;
export type Locale = (typeof locales)[number];

export const htmlLang: Record<Locale, 'en' | 'pt-BR'> = {
  en: 'en',
  'pt-br': 'pt-BR',
};

export const ui: Record<
  Locale,
  {
    siteName: string;
    switchLabel: string;
    lastUpdated: string;
    seeEveryChange: string;
    dateLocale: string;
  }
> = {
  en: {
    siteName: 'Vital Courier',
    switchLabel: 'Português',
    lastUpdated: 'Last updated',
    seeEveryChange: 'See every change on GitHub',
    dateLocale: 'en-US',
  },
  'pt-br': {
    siteName: 'Vital Courier',
    switchLabel: 'English',
    lastUpdated: 'Última atualização',
    seeEveryChange: 'Ver todas as mudanças no GitHub',
    dateLocale: 'pt-BR',
  },
};

export const repoUrl = 'https://github.com/musashinm/vital-courier-site';

export function historyUrl(locale: Locale): string {
  return `${repoUrl}/commits/main/src/content/privacy/${locale}.md`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt-br' : 'en';
}
