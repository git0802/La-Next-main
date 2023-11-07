// const NextI18Next = require("next-i18next").default;
// const { initReactI18next } = require("react-i18next");

// module.exports = new NextI18Next({
//   use: [initReactI18next], // Pass the i18n instance to react-i18next.
//   i18n: {
//     defaultLocale: "en",
//     locales: ["en", "fr", "de"],
//   },
// });
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./i18n/translation.en.json";
import frTranslation from "./i18n/translation.fr.json";
import deTranslation from "./i18n/translation.de.json"

const resources = {
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  de: {
    translation: deTranslation
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
