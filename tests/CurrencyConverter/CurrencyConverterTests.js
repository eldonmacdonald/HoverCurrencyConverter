let t_rates_inr = {
    "USD": 0.01,
    "GBP": 0.008,
    "INR": 1,
}

let t_rates_gbp = {
    "USD": 1.3,
    "GBP": 1.0,
    "INR": 130,
}

async function getExchangeRates_GetRatesForINRTest() {
    return CurrencyConverter.getExchangeRates("INR");
}

async function getExchangeRates_ErrorOnInvalidCurrencyTest() {
    return CurrencyConverter.getExchangeRates("INVALID");
}

function getConvertedString_ConvertUSDToINRInINLocaleTest() {
    let currencyConverter = new CurrencyConverter("USD", "INR", 
        t_rates_inr, "en-IN");
    return currencyConverter.getConvertedString(1000);
}

function getConvertedString_ConvertINRToGBPInUKLocaleTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP",
        t_rates_gbp, "en-UK");
    return currencyConverter.getConvertedString(130);
}

function constructor_ErrorOnCurrencyArgumentNotInExchangeRatesTest() {
    let currencyConverter = new CurrencyConverter("CAD", "GBP", 
        t_rates_gbp, "en-US");
    return currencyConverter;
}

function constructor_ErrorOnCurrencyToConvertArgumentNotInExchangeRatesTest() {
    let currencyConverter = new CurrencyConverter("INR", "CAD", 
        t_rates_gbp, "en-US");
    return currencyConverter;
}

function constructor_ErrorOnInvalidLocaleTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", 
        t_rates_gbp, "ZORB");
    return currencyConverter;
}