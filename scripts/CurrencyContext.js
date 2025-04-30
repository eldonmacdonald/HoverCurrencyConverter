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

            if(this.currencyElementContainsFullPrice(currencyResult)) {
                let priceElem = this.priceElementBuilder
                                .buildFromElementContainingFullPrice
                                (currencyResult);
                
                this.priceElements.push(priceElem);
                return;
            }

            let fullAmountSiblings = this.getCurrencyElementFullAmountSiblings(currencyResult);

            if(fullAmountSiblings.length > 0) {
                let priceElem = this.priceElementBuilder
                                .buildFromElementContainingFullAmount
                                (currencyResult, fullAmountSiblings[0]);

                this.priceElements.push(priceElem);
                return;
            }

            let integerSiblings = this.getCurrencyElementIntegerSiblings(currencyResult);
            let decimalSiblings = this.getCurrencyElementDecimalSiblings(currencyResult);

            if(integerSiblings.length > 0 && decimalSiblings.length > 0) {
                let priceElem = this.priceElementBuilder
                                .buildFromDollarAndCentElements
                                (currencyResult, integerSiblings[0], decimalSiblings[0]);

                this.priceElements.push(priceElem);
                return;
            }

            if(integerSiblings.length == 1 && decimalSiblings.length <= 0) {
                let priceElem = this.priceElementBuilder
                                .buildFromElementContainingFullAmount
                                (currencyResult, integerSiblings[0]);
                
                this.priceElements.push(priceElem);
                return;
            }
            
            if(integerSiblings.length > 1 && decimalSiblings.length <= 0) {
                let priceElem = this.priceElementBuilder
                                .buildFromDollarAndCentElements
                                (currencyResult, integerSiblings[0], integerSiblings[1]);

                this.priceElements.push(priceElem);
                return;
            }
        });
    }

    currencyElementContainsFullPrice(elem) {
        let regex = new RegExp("\\" + this.currencySymbol + "\\s*[\\d,]+(\\.[\\d]+)?");
        let elemText = elem.textContent.trim();
        return regex.test(elemText);
    }

    getCurrencyElementFullAmountSiblings(elem) {
        let regex = /^\s*[\d]+\.[\d]+\s*$/
        let fullAmountSiblings = getSiblingsThatMatchRegex(elem, regex);
        return fullAmountSiblings;
    }

    getCurrencyElementDecimalSiblings(elem) {
        let regex = /^\s*\.[\d]+\s*$/
        let decimalSiblings = getSiblingsThatMatchRegex(elem, regex);
        return decimalSiblings;
    }

    getCurrencyElementIntegerSiblings(elem) {
        let regex = /^\s*[\d,]+\s*$/
        let integerSiblings = getSiblingsThatMatchRegex(elem, regex);
        return integerSiblings;
    }

    clearPriceElements() {
        this.priceElements.forEach((priceElement) => {
            priceElement.destroy();
        });
        this.priceElements = [];
    }
}