class CurrencyContext {
    constructor(currencySymbol, currency, convertToCurrency, exchangeRates, localeFormat) {
        this.priceElements = [];
        this.currencySymbol = currencySymbol;

        this.currencySymbolFinder = new CurrencySymbolFinder(currencySymbol);
        this.currencyConverter = new CurrencyConverter(currency, convertToCurrency, exchangeRates, localeFormat);
        this.priceElementBuilder = new PriceElementBuilder(this.currencyConverter);

        this.currencySymbolFinder.symbolElemResults
            .onChange((changedCurrencySymbolArray) => {

            //Could implement this for better performance

            /* let oldCurrencySymbolArray = this.currencySymbolFinder.symbolElemResults.getValue();

            let newCurrencySymbolsInChangedArray = changedCurrencySymbolArray
                .filter(elem => !oldCurrencySymbolArray.includes(elem));

            let priceElementsForNewCurrencySymbolElems = this.priceElementBuilder
                .buildPriceElementsFromCurrencySymbolElementArray(newCurrencySymbolsInChangedArray);

            this.priceElements.concat(priceElementsForNewCurrencySymbolElems); */

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