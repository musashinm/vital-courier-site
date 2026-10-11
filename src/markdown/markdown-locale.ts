import { locales, type Locale } from '../i18n/ui';

export interface FileWithPath {
  path?: string;
}

export function localeFromMarkdownPath(
  filePath: string | undefined,
  pluginName: string,
): Locale {
  const fileName = filePath?.split(/[\\/]/).pop() ?? '';
  const locale = locales.find((candidate) => fileName === `${candidate}.md`);
  if (!locale) {
    throw new Error(
      `${pluginName}: cannot tell the locale of "${filePath ?? '(no path)'}". ` +
        `Name the Markdown file after one of: ${locales.join(', ')} (for example "${locales[0]}.md").`,
    );
  }
  return locale;
}
