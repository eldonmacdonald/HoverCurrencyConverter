class CurrencyContext {
    constructor(currencySymbol, currency, convertToCurrency, exchangeRates, localeFormat) {
        this.priceElements = [];
        this.currencySymbol = currencySymbol;

        this.currencySymbolFinder = new CurrencySymbolFinder(currencySymbol, currency);
        this.currencyConverter = new CurrencyConverter(currency, convertToCurrency, exchangeRates, localeFormat);
        this.priceElementBuilder = new PriceElementBuilder(this.currencyConverter);

        this.priceRegex = /[\d,]+(\.[\d]+)?/;
    }

    updateCurrencyPriceElemements() {

        this.clearPriceElements();

        this.currencySymbolFinder.currencyResults.getValue().forEach(
            (currencyResult) => {

            if(!isElementVisible(currencyResult)) {
                return;
            }

            if(this.isPriceContainedInSingleElement(currencyResult)) {
                this.buildPriceElementFromSingleElement(currencyResult)
            } else {
                this.buildPriceElementThroughParent(currencyResult);
            }
        });
    }

    isPriceContainedInSingleElement(elem) {
        return this.priceRegex.test(elem.textContent.trim());
    }

    buildPriceElementFromSingleElement(elem) {
        const elemText = elem.textContent.trim();
        const priceMatch = elemText.match(/[\d,]+(\.\d{2})?/);
        const cleanPrice = priceMatch[0].replace(/,/g, '');
        const price = parseFloat(cleanPrice);

        const convertedPrice = this.currencyConverter.getConvertedString(price);
        
        const boundingRect = elem.getBoundingClientRect();
        const priceElem = new PriceElement(
            boundingRect.top,
            boundingRect.left,
            boundingRect.width,
            boundingRect.height,
            convertedPrice
        );

        this.priceElements.push(priceElem);
    }

    buildPriceElementThroughParent(elem) {
        const parentBoundingRect = elem.parentNode.getBoundingClientRect();

        let price;
        try {
            price = this.getPriceFromParentText(elem);
        } catch (e) {
            console.warn(e.message);
        }

        const convertedPrice = this.currencyConverter.getConvertedString(price);

        let priceElem = new PriceElement(
            parentBoundingRect.top,
            parentBoundingRect.left,
            parentBoundingRect.width,
            parentBoundingRect.height,
            convertedPrice
        );

        this.priceElements.push(priceElem);
    }

    getPriceFromParentText(elem) {
        const parentInnerText = elem.parentNode.textContent;
        const indexInParent = this.findIndexOfElementTextInParentInnerText(elem);

        const substringFromIndex = parentInnerText.substring(indexInParent);
        const priceMatches = substringFromIndex.match(this.priceRegex);

        if(!priceMatches || priceMatches.length <= 0) {
            throw new Error(`Tried to find the price associated with the following parent text,` + 
                `but found no price regex matches: ${parentInnerText.trim()}`);
        }

        const cleanPrice = priceMatches[0].replace(/,/g, '');

        return parseFloat(cleanPrice);
    }

    findIndexOfElementTextInParentInnerText(elem) {
        let index = 0;
        elem.parentNode.childNodes.forEach(sibling => {
            if(sibling === elem) {
                return index;
            }

            index += sibling.textContent.length;
        })
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