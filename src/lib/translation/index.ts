import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import I18NextHttpBackend, { HttpBackendOptions } from "i18next-http-backend";
const backendOptions: HttpBackendOptions = {
    loadPath: 'http://localhost:5173/locales/{{lng}}/{{ns}}.json',
    request: (_options, url, _payload, callback) => {
        fetch(url)
            .then((res) =>
                res.json().then((r) => {
                    callback(null, {
                        data: JSON.stringify(r),
                        status: 200,
                    })
                })
            )
            .catch(() => {
                callback(null, {
                    status: 500,
                    data: '',
                })
            })
    },
}
export const createI18nInstance = (lng: string) => {
  console.log('Initializing i18n with language:', lng);
const i18n = i18next.createInstance();

i18n
  .use(I18NextHttpBackend)
  .use(LanguageDetector)
  .init({
    lng,
    supportedLngs: ["en", "vi"],
    fallbackLng: "en",
    defaultNS: "translation",
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
    backend: backendOptions,
  });
  return i18n;
};
export default createI18nInstance;