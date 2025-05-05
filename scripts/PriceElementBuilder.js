class PriceElementBuilder {

    constructor(converter) {
        this.converter = converter;

        this.priceRegex = /[\d,]+(\.[\d]+)?/;
    }

    buildPriceElementsFromCurrencySymbolElementArray(currencySymbolElementArray) {
        let priceElems = [];

        currencySymbolElementArray.forEach(currencySymbolElem => {
            if(this.isPriceContainedInSingleElement(currencySymbolElem)) {
                let priceElem = this.buildPriceElementFromSingleElement(currencySymbolElem);
                priceElems.push(priceElem);
            } else {
                let priceElem = this.buildPriceElementThroughParent(currencySymbolElem);
                priceElems.push(priceElem);
            }
        });

        return priceElems;
    }

    isPriceContainedInSingleElement(elem) {
        return this.priceRegex.test(elem.textContent);
    }

    buildPriceElementFromSingleElement(elem) {
        const elemText = elem.textContent.trim();
        const priceMatch = elemText.match(this.priceRegex);
        const cleanPrice = priceMatch[0].replace(/,/g, '');
        const price = parseFloat(cleanPrice);

        let convertedPrice = this.converter.getConvertedString(price);

        let priceElem = new PriceElement(
            convertedPrice,
            elem
        );

        return priceElem;
    }

    buildPriceElementThroughParent(elem) {
        let price;
        try {
            price = this.getPriceFromParentText(elem);
        } catch (e) {
            console.warn(e.message);
        }

        let convertedPrice = this.converter.getConvertedString(price);

        let priceElem = new PriceElement(
            convertedPrice,
            elem.parentNode
        );

        return priceElem;
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
        const siblings = elem.parentNode.childNodes;
        for(let siblingIndex = 0; siblings.item(siblingIndex); siblingIndex++) {
            const curr = siblings.item(siblingIndex);
            if(curr === elem) {
                return index;
            }

            index += curr.textContent.length;
        }

        throw new Error("child not found in parent element");
    }
}