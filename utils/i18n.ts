import { I18nManager } from 'react-native';

type LocaleResources = Record<string, Record<string, string>>;

class SimpleI18n {
  private resources: LocaleResources;
  private currentLocale: string;

  constructor(resources: LocaleResources, defaultLocale: string) {
    this.resources = resources;
    this.currentLocale = defaultLocale;
  }

  setLocale(locale: string) {
    if (this.resources[locale]) {
      this.currentLocale = locale;
    }
  }

  t(key: string, fallback?: string): string {
    const dict = this.resources[this.currentLocale] || {};
    return dict[key] ?? fallback ?? key;
  }

  get locale() {
    return this.currentLocale;
  }
}

// 초기 리소스를 로컬 JSON에서 불러와 등록
// 주의: Metro 번들러는 JSON import를 지원
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ko = require('../locales/ko.json');
const resources: LocaleResources = {
  ko,
};

export const i18n = new SimpleI18n(resources, 'ko');
export const t = (key: string, fallback?: string) => i18n.t(key, fallback);

// RTL 지원 여부 동기화 (추가 확장 포인트)
export const isRTL = I18nManager.isRTL;
