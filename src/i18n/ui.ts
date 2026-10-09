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
    languageLabels: Record<Locale, string>;
    languageTitles: Record<Locale, string>;
    languageNavLabel: string;
    skipLink: string;
    footerGithubLabel: string;
    lastUpdated: string;
    seeEveryChange: string;
    dateLocale: string;
  }
> = {
  en: {
    siteName: 'Vital Courier',
    languageLabels: { en: 'EN', 'pt-br': 'PT-BR' },
    languageTitles: { en: 'English', 'pt-br': 'Português do Brasil' },
    languageNavLabel: 'Language',
    skipLink: 'Skip to content',
    footerGithubLabel: 'Vital Courier on GitHub',
    lastUpdated: 'Last updated',
    seeEveryChange: 'See every change on GitHub',
    dateLocale: 'en-US',
  },
  'pt-br': {
    siteName: 'Vital Courier',
    languageLabels: { en: 'EN', 'pt-br': 'PT-BR' },
    languageTitles: { en: 'English', 'pt-br': 'Português do Brasil' },
    languageNavLabel: 'Idioma',
    skipLink: 'Pular para o conteúdo',
    footerGithubLabel: 'Vital Courier no GitHub',
    lastUpdated: 'Última atualização',
    seeEveryChange: 'Ver todas as mudanças no GitHub',
    dateLocale: 'pt-BR',
  },
};

export const repoUrl = 'https://github.com/musashinm/vital-courier-site';

export function historyUrl(locale: Locale): string {
  return `${repoUrl}/commits/main/src/content/privacy/${locale}.md`;
}
