class CurrencyContext {
    constructor(currencySymbol, currency, convertToCurrency, exchangeRates, localeFormat) {
        this.priceElements = [];
        this.currencySymbol = currencySymbol;

        this.currencySymbolFinder = new CurrencySymbolFinder(currencySymbol, currency);
        this.currencyConverter = new CurrencyConverter(currency, convertToCurrency, exchangeRates, localeFormat);
        this.priceElementBuilder = new PriceElementBuilder(this.currencyConverter);

        this.currencySymbolFinder.currencyResults.onChange((changedCurrencySymbolArray) => {

            //Could implement this for better performance

            /* let oldCurrencySymbolArray = this.currencySymbolFinder.currencyResults.getValue();

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

    clearPriceElements() {
        this.priceElements.forEach((priceElement) => {
            priceElement.destroy();
        });
        this.priceElements = [];
    }
}