
// Need exclude sites from having extension enabled here because
// puppeteer is a garbage piece of software that does not respect
// exclude_matches in the manifest of extensions
let disabledUrlRegexs = [
    /\/tests\//
]

async function initExtension() {
    let convertToCurrency = await chrome.storage.local.get("hoverconverter_selectedCurrency");
    convertToCurrency = convertToCurrency.hoverconverter_selectedCurrency;

    let convertFromCurrency = await chrome.storage.local.get("hoverconverter_convertFrom");
    convertFromCurrency = convertFromCurrency.hoverconverter_convertFrom;

    if(!convertToCurrency) {
        convertToCurrency = "USD";
    }

    if(!convertFromCurrency) {
        convertFromCurrency = "AUTODETECT";
    }

    let locale = "en-US";
    if(convertToCurrency == "INR") {
        locale = "en-IN";
    }


    let pageManager = new PageManager(
        await CurrencyConverter.getExchangeRates(convertToCurrency), 
        convertToCurrency, locale, convertFromCurrency);
    pageManager.activatePageManager();
}

if(disabledUrlRegexs.every(
    regex => !window.location.href.match(regex)
)) {
    initExtension();
} else {

    // Add an element to the DOM for confirmation that the
    // extension has not been loaded
    let disabledConfirmationNode = document.createElement("p");
    disabledConfirmationNode.innerHTML = "Disabled extension";
    document.head.appendChild(disabledConfirmationNode);
}

