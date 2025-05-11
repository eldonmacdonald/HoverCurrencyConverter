
// Need exclude sites from having extension enabled here because
// puppeteer is a garbage piece of software that does not respect
// exclude_matches in the manifest of extensions
let disabledUrlRegexs = [
    /\/tests\//
]

async function initExtension() {
    let pageManager = new PageManager(
        await CurrencyConverter.getExchangeRates("INR"), 
        "INR", "en-IN");
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

