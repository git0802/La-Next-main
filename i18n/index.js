var en = require("./translations.en.json");
var de = require("./translations.de.json");
var fr = require("./translations.fr.json");

const i18n = {
  translations: {
    en: en.i18n,
    de: de.i18n,
    fr: fr.i18n,
  },
  defaultLang: "en",
  useBrowserDefault: true,
};

module.exports = i18n;
