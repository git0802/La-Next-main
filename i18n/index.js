var en = require("./translation.en.json");
var de = require("./translation.de.json");
var fr = require("./translation.fr.json");

const i18n = {
  translations: {
    en: en,
    de: de,
    fr: fr,
  },
  defaultLang: "en",
  useBrowserDefault: true,
};

module.exports = i18n;
