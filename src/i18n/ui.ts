export const locales = ['en', 'pt-br'] as const;
export type Locale = (typeof locales)[number];

export const htmlLang: Record<Locale, 'en' | 'pt-BR'> = {
  en: 'en',
  'pt-br': 'pt-BR',
};

export interface HomeStrings {
  title: string;
  metaDescription: string;
  headlineStart: string;
  headlineEnd: string;
  scrollCue: string;
  mainNavLabel: string;
  iosAppLink: string;
  screens: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: [HomeScreenItem, HomeScreenItem, HomeScreenItem];
    markdownLabel: string;
    markdownFilename: string;
  };
  philosophy: {
    eyebrow: string;
    heading: string;
    proofs: [HomeProof, HomeProof, HomeProof];
    sourceLink: string;
  };
  appStore: {
    eyebrow: string;
    preHeading: string;
    preBody: string;
    liveHeading: string;
    liveBody: string;
    badgeLabel: string;
  };
  footer: {
    privacy: string;
    source: string;
    context: string;
  };
}

export interface HomeScreenItem {
  title: string;
  body: string;
  alt?: string;
}

export interface HomeProof {
  title: string;
  body: string;
}

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
    home: HomeStrings;
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
    home: {
      title: 'Vital Courier',
      metaDescription:
        'Vital Courier exports your Apple Health data to a folder you choose. Free and open source, and it sends your health data nowhere.',
      headlineStart: 'Your data.',
      headlineEnd: 'Where you want it.',
      scrollCue: 'Scroll',
      mainNavLabel: 'Main',
      iosAppLink: 'iOS app',
      screens: {
        eyebrow: 'Your data, in motion',
        heading: 'From Health to a folder you control.',
        intro:
          'Choose a folder once. Vital Courier keeps daily Markdown notes and monthly JSON up to date when new health data arrives, when you open the app, and during background refresh. You can also use Export now in Shortcuts or Rebuild all in Settings.',
        items: [
          {
            title: 'Choose the data.',
            body: 'Allow the health types you want Vital Courier to export.',
            alt: "Vital Courier's Health access screen, shown before iOS asks which data types to share.",
          },
          {
            title: 'Choose the destination.',
            body: 'Pick a folder in iCloud Drive, an Obsidian vault, or anywhere available in Files. Vital Courier creates its own folder inside it.',
            alt: "The Files folder picker open over Vital Courier's destination step.",
          },
          {
            title: 'Keep something readable.',
            body: 'One Markdown note per day stays useful in a vault or text editor. Monthly JSON keeps the raw samples.',
          },
        ],
        markdownLabel: 'Example daily note exported by Vital Courier',
        markdownFilename: '2026-10-14.md',
      },
      philosophy: {
        eyebrow: 'Why it exists',
        heading: 'You already did the work. The data is yours.',
        proofs: [
          {
            title: 'Free, without a catch.',
            body: 'You are the one feeding Apple Health. Paying to get that data back out makes no sense. Vital Courier is free, with an optional tip if you want to support it.',
          },
          {
            title: 'Private by design.',
            body: 'There is no account and no Vital Courier server. The app writes straight to the folder you pick and keeps its own state on your iPhone.',
          },
          {
            title: 'Open source is the receipt.',
            body: 'You do not have to take that promise on faith. Read the code and check what the app sends - and what it does not.',
          },
        ],
        sourceLink: 'Read the source on GitHub',
      },
      appStore: {
        eyebrow: 'iOS app',
        preHeading: 'Coming soon to the App Store.',
        preBody:
          'Vital Courier is in review. The app will be free when it is available.',
        liveHeading: 'Take your data with you.',
        liveBody: 'Free on the App Store for iPhone.',
        badgeLabel: 'Download Vital Courier on the App Store',
      },
      footer: {
        privacy: 'Privacy Policy',
        source: 'Source code',
        context: 'Vital Courier sends your health data nowhere.',
      },
    },
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
    home: {
      title: 'Vital Courier',
      metaDescription:
        'O Vital Courier exporta seus dados do app Saúde para uma pasta que você escolhe. Grátis e de código aberto, e não envia seus dados de saúde a lugar nenhum.',
      headlineStart: 'Seus dados.',
      headlineEnd: 'Onde você quiser.',
      scrollCue: 'Role para continuar',
      mainNavLabel: 'Principal',
      iosAppLink: 'App para iOS',
      screens: {
        eyebrow: 'Seus dados em movimento',
        heading: 'Do app Saúde para uma pasta sob seu controle.',
        intro:
          'Escolha uma pasta uma vez. O Vital Courier mantém notas diárias em Markdown e arquivos JSON mensais atualizados quando chegam novos dados, quando você abre o app e durante a atualização em segundo plano. Você também pode usar Exportar agora nos Atalhos ou Reconstruir tudo nos Ajustes.',
        items: [
          {
            title: 'Escolha os dados.',
            body: 'Permita os tipos de saúde que você quer que o Vital Courier exporte.',
            alt: 'Tela de acesso ao Saúde do Vital Courier, mostrada antes de o iOS perguntar quais tipos de dados compartilhar.',
          },
          {
            title: 'Escolha o destino.',
            body: 'Selecione uma pasta no iCloud Drive, em um cofre do Obsidian ou em qualquer local disponível no app Arquivos. O Vital Courier cria uma pasta própria dentro dela.',
            alt: 'O seletor de pastas do app Arquivos aberto sobre a etapa de destino do Vital Courier.',
          },
          {
            title: 'Guarde algo legível.',
            body: 'Uma nota Markdown por dia continua útil em um cofre ou editor de texto. O JSON mensal guarda as amostras brutas.',
          },
        ],
        markdownLabel: 'Exemplo de nota diária exportada pelo Vital Courier',
        markdownFilename: '2026-10-14.md',
      },
      philosophy: {
        eyebrow: 'Por que ele existe',
        heading: 'Você já fez o trabalho. Os dados são seus.',
        proofs: [
          {
            title: 'Grátis, sem pegadinha.',
            body: 'É você quem alimenta o app Saúde. Não faz sentido pagar para tirar esses dados de lá. O Vital Courier é grátis, com uma contribuição opcional se você quiser apoiá-lo.',
          },
          {
            title: 'Privado por princípio.',
            body: 'Não existe conta nem servidor do Vital Courier. O app grava direto na pasta escolhida e mantém o próprio estado no seu iPhone.',
          },
          {
            title: 'O código aberto é a prova.',
            body: 'Você não precisa confiar apenas na promessa. Leia o código e confira o que o app envia - e o que não envia.',
          },
        ],
        sourceLink: 'Ver o código-fonte no GitHub',
      },
      appStore: {
        eyebrow: 'App para iOS',
        preHeading: 'Em breve na App Store.',
        preBody:
          'O Vital Courier está em análise. O app será grátis quando estiver disponível.',
        liveHeading: 'Leve seus dados com você.',
        liveBody: 'Grátis na App Store para iPhone.',
        badgeLabel: 'Baixar o Vital Courier na App Store',
      },
      footer: {
        privacy: 'Política de Privacidade',
        source: 'Código-fonte',
        context:
          'O Vital Courier não envia seus dados de saúde a lugar nenhum.',
      },
    },
  },
};

export const appRepoUrl = 'https://github.com/musashinm/vital-courier-app';
export const appStoreUrl: string | null = null;

export const repoUrl = 'https://github.com/musashinm/vital-courier-site';

export function historyUrl(locale: Locale): string {
  return `${repoUrl}/commits/main/src/content/privacy/${locale}.md`;
}
