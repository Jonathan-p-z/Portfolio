import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  // Never show /fr/ or /en/ prefix in URLs — locale stored in NEXT_LOCALE cookie
  localePrefix: 'never',
});
