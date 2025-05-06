async function initExtension() {
    let pageManager = new PageManager(
        await CurrencyConverter.getExchangeRates("INR"), 
        "INR", "en-IN");
    pageManager.activatePageManager();
}

initExtension();

