async function initExtension() {
    new PageManager(
        await CurrencyConverter.getExchangeRates("INR"), 
        "INR", "en-IN");
}

initExtension();

