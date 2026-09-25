const { body } = require("express-validator");
const validator = require("validator");
const { isValidPhoneNumber, parsePhoneNumber } = require('libphonenumber-js') 

// mappa nome paese (italiano/inglese) -> codice ISO 3166-1 alpha-2
const COUNTRY_NAME_TO_CODE = {
  // EU
  "italia": "IT", "italy": "IT",
  "francia": "FR", "france": "FR",
  "germania": "DE", "germany": "DE",
  "spagna": "ES", "spain": "ES",
  "paesi bassi": "NL", "olanda": "NL", "netherlands": "NL",
  "belgio": "BE", "belgium": "BE",
  "austria": "AT",
  "portogallo": "PT", "portugal": "PT",
  "grecia": "GR", "greece": "GR",
  "irlanda": "IE", "ireland": "IE",
  "polonia": "PL", "poland": "PL",
  "repubblica ceca": "CZ", "cechia": "CZ", "czech republic": "CZ", "czechia": "CZ",
  "slovacchia": "SK", "slovakia": "SK",
  "slovenia": "SI",
  "ungheria": "HU", "hungary": "HU",
  "romania": "RO",
  "bulgaria": "BG",
  "croazia": "HR", "croatia": "HR",
  "danimarca": "DK", "denmark": "DK",
  "finlandia": "FI", "finland": "FI",
  "svezia": "SE", "sweden": "SE",
  "estonia": "EE",
  "lettonia": "LV", "latvia": "LV",
  "lituania": "LT", "lithuania": "LT",
  "cipro": "CY", "cyprus": "CY",
  "malta": "MT",
  "lussemburgo": "LU", "luxembourg": "LU",
  // non-EU europei
  "regno unito": "GB", "gran bretagna": "GB", "united kingdom": "GB", "uk": "GB",
  "svizzera": "CH", "switzerland": "CH",
  "norvegia": "NO", "norway": "NO",
  "islanda": "IS", "iceland": "IS",
  "liechtenstein": "LI",
};

const VALID_ISO_CODES = new Set(Object.values(COUNTRY_NAME_TO_CODE));

// normalizza una stringa: lowercase, rimuove accenti, comprime spazi
function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// risolve "Italia", "italy" o "IT" -> "IT"
function resolveCountryCode(input) {
  if (!input) return null;
  const normalized = normalizeText(input);
  const asCode = normalized.toUpperCase();
  if (VALID_ISO_CODES.has(asCode)) return asCode;
  return COUNTRY_NAME_TO_CODE[normalized] || null;
}

// chiama zippopotam.us per verificare esistenza CAP e ottenere le citta'
async function fetchPostalInfo(countryCode, zipcode) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const url = `https://api.zippopotam.us/${countryCode.toLowerCase()}/${encodeURIComponent(zipcode)}`;
    const response = await fetch(url, { signal: controller.signal });
    if (response.status === 404) return { status: "not_found" };
    if (!response.ok) return { status: "api_error" };
    const data = await response.json();
    return { status: "ok", data };
  } catch (e) {
    return { status: "network_error" };
  } finally {
    clearTimeout(timeout);
  }
}

const storeOrderValidation = [
  body("user_full_name")
    .trim()
    .notEmpty().withMessage("Nome obbligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("Nome deve avere tra 2 e 100 caratteri")
    .matches(/^[A-Za-zÀ-ÿ'\s-]+$/).withMessage("Nome contiene caratteri non validi"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email obbligatoria")
    .isEmail().withMessage("Email non valida")
    .isLength({ max: 254 }).withMessage("Email troppo lunga")
    .normalizeEmail(),

  body("address")
    .trim()
    .notEmpty().withMessage("Indirizzo obbligatorio")
    .isLength({ min: 5, max: 200 }).withMessage("Indirizzo deve avere tra 5 e 200 caratteri")
    .matches(/^[A-Za-zÀ-ÿ0-9.,'°\/\s-]+$/).withMessage("Indirizzo contiene caratteri non validi"),

  body("city")
    .trim()
    .notEmpty().withMessage("Città obbligatoria")
    .isLength({ min: 2, max: 100 }).withMessage("Città deve avere tra 2 e 100 caratteri")
    .matches(/^[A-Za-zÀ-ÿ'\s-]+$/).withMessage("Nome città non valido"),

  // country: accetta "Italia", "italy", "IT" -> normalizza a "IT"
  body("country")
    .trim()
    .notEmpty().withMessage("Paese obbligatorio")
    .custom((value) => {
      if (!resolveCountryCode(value)) {
        throw new Error("Paese non riconosciuto (solo paesi europei supportati)");
      }
      return true;
    })
    .customSanitizer((value) => resolveCountryCode(value)),

  // zipcode: formato + esistenza reale + corrispondenza citta'
  body("zipcode")
    .trim()
    .customSanitizer((value) => value.replace(/-/g, ""))
    .notEmpty().withMessage("CAP obbligatorio")
    .custom(async (value, { req }) => {
      const country = resolveCountryCode(req.body.country);
      if (!country) {
        throw new Error("Impossibile validare il CAP: paese non valido");
      }

      // 1) controllo formato locale (es. IT = 5 cifre)
      if (!validator.isPostalCode(value, country)) {
        throw new Error(`CAP "${value}" non rispetta il formato di ${country}`);
      }

      // 2) controllo esistenza reale via API
      const result = await fetchPostalInfo(country, value);

      if (result.status === "not_found") {
        throw new Error(`Il CAP "${value}" non esiste in ${country}`);
      }

      // se l'API non risponde, ci accontentiamo del controllo di formato
      if (result.status !== "ok") {
        return true;
      }

      // 3) controllo che la citta' inserita corrisponda al CAP
      const inputCity = normalizeText(req.body.city);
      const places = result.data.places || [];

      if (inputCity && places.length > 0) {
        const cityMatches = places.some((p) => {
          const apiCity = normalizeText(p["place name"]);
          return apiCity === inputCity || apiCity.includes(inputCity) || inputCity.includes(apiCity);
        });

        if (!cityMatches) {
          const suggestions = places
            .map((p) => p["place name"])
            .slice(0, 3)
            .join(", ");
          throw new Error(
            `Il CAP "${value}" non corrisponde alla città "${req.body.city}". Città attese: ${suggestions}`
          );
        }
      }

      return true;
    }),

  // phone_number: validato in base al country (fallback generico)
  body("phone_number")
  .optional({ checkFalsy: true })
  .trim()
  .custom((value, { req }) => {
    const country = resolveCountryCode(req.body.country); // es. "IT"

    // prova prima con il paese specificato, poi come numero internazionale
    const validForCountry = country && isValidPhoneNumber(value, country);
    const validInternational = isValidPhoneNumber(value); // richiede prefisso +xx

    if (!validForCountry && !validInternational) {
      throw new Error("Numero di telefono non valido per il paese selezionato");
    }

    return true;
  }),

  body("products")
    .isArray({ min: 1 }).withMessage("Carrello vuoto"),

  body("products.*.id")
    .isInt({ min: 1 }).withMessage("ID prodotto non valido"),

  body("products.*.quantity")
    .isInt({ min: 1, max: 999 }).withMessage("Quantità deve essere tra 1 e 999"),

  body("coupon_code")
    .optional({ checkFalsy: true })
    .trim()
    .isString().withMessage("Coupon non valido")
    .isLength({ min: 2, max: 50 }).withMessage("Coupon deve avere tra 2 e 50 caratteri")
    .matches(/^[A-Za-z0-9_-]+$/).withMessage("Coupon contiene caratteri non validi"),
];

module.exports = { storeOrderValidation };
