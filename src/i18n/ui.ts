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
    opensInNewTab: string;
    lastUpdated: string;
    seeEveryChange: string;
    onThisPage: string;
    backToContents: string;
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
    opensInNewTab: '(opens in a new tab)',
    lastUpdated: 'Last updated',
    seeEveryChange: 'See every change on GitHub',
    onThisPage: 'On this page',
    backToContents: 'Back to contents',
    dateLocale: 'en-US',
  },
  'pt-br': {
    siteName: 'Vital Courier',
    languageLabels: { en: 'EN', 'pt-br': 'PT-BR' },
    languageTitles: { en: 'English', 'pt-br': 'Português do Brasil' },
    languageNavLabel: 'Idioma',
    skipLink: 'Pular para o conteúdo',
    footerGithubLabel: 'Vital Courier no GitHub',
    opensInNewTab: '(abre em uma nova aba)',
    lastUpdated: 'Última atualização',
    seeEveryChange: 'Ver todas as mudanças no GitHub',
    onThisPage: 'Nesta página',
    backToContents: 'Voltar ao conteúdo',
    dateLocale: 'pt-BR',
  },
};

export const repoUrl = 'https://github.com/musashinm/vital-courier-site';

export function historyUrl(locale: Locale): string {
  return `${repoUrl}/commits/main/src/content/privacy/${locale}.md`;
}
