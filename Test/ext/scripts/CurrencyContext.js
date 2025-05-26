class CurrencyContext {
    constructor(currencySymbol, currency, convertToCurrency, exchangeRates, localeFormat) {
        this.priceElements = [];
        this.currencySymbol = currencySymbol;

        this.currencySymbolFinder = new CurrencySymbolFinder(new RegExp("\\" + currencySymbol), currencySymbol);
        this.currencyConverter = new CurrencyConverter(currency, convertToCurrency, exchangeRates, localeFormat);
        this.priceElementBuilder = new PriceElementBuilder(this.currencyConverter);

        this.currencySymbolFinder.symbolElemResults
            .onChange((changedCurrencySymbolArray) => {

            let newPriceElements = this.priceElementBuilder
                .buildPriceElementsFromCurrencySymbolElementArray(changedCurrencySymbolArray);
            this.priceElements = newPriceElements;
            
        });
    }

    activateCurrencyContext() {
        this.currencySymbolFinder.startLookingForSymbolElems();
    }

    clearPriceElements() {
        this.priceElements.forEach((priceElement) => {
            priceElement.destroy();
        });
        this.priceElements = [];
    }
}