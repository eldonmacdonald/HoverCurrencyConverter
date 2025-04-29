class CurrencyContext {
    constructor(currencySymbol, currency, convertToCurrency, exchangeRates, localeFormat) {
        this.priceElements = [];
        this.currencySymbol = currencySymbol;

        this.currencySymbolFinder = new CurrencySymbolFinder(currencySymbol, currency);
        this.currencyConverter = new CurrencyConverter(currency, convertToCurrency, exchangeRates, localeFormat);
        this.priceElementBuilder = new PriceElementBuilder(this.currencyConverter);
    }

    updateCurrencyPriceElemements() {
        this.clearPriceElements();
        this.currencySymbolFinder.currencyResults.forEach((currencyResult) => {

            if(!isElementVisible(currencyResult)) {
                return;
            }

            let fullRegex = new RegExp("\\" + this.currencySymbol + "\\s*[\\d,]+(\\.\\d{2})?")
            if (fullRegex.test(currencyResult.textContent.trim())) {
                this.priceElements.push(this.priceElementBuilder.buildFromElementContainingFullPrice(currencyResult));
            } else {

                let centSiblings = getSiblingsThatMatchRegex(currencyResult, /(?<![\d])(\.\d{2})/);
                let dollarSiblings = getSiblingsThatMatchRegex(currencyResult, /[\d,]+\.?/);

                if (centSiblings.length > 0 && dollarSiblings.length > 0) {
                    this.priceElements.push(this.priceElementBuilder.buildFromDollarAndCentElements(currencyResult, dollarSiblings[0], centSiblings[0]));
                } else {

                    if(dollarSiblings.length >= 2) {
                        this.priceElements.push(this.priceElementBuilder.buildFromDollarAndCentElements(currencyResult, dollarSiblings[0], dollarSiblings[1]));
                    } else {
                        let fullAmountSiblings = getSiblingsThatMatchRegex(currencyResult, /[\d,]+(\.\d{2})?/);
                        if(fullAmountSiblings.length > 0) {
                            this.priceElements.push(this.priceElementBuilder.buildFromElementContainingFullAmount(currencyResult, fullAmountSiblings[0]));
                        }
                    }
                }
            }
        });
    }

    clearPriceElements() {
        this.priceElements.forEach((priceElement) => {
            priceElement.destroy();
        });
        this.priceElements = [];
    }
}