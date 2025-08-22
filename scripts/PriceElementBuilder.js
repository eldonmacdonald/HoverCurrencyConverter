/**
 * This class identifies and builds `PriceElement` objects from DOM elements 
 * containing currency symbols and associated prices. It uses a `CurrencyConverter` 
 * instance to convert the extracted prices into the desired currency format.
 * 
 * Usage:
 * 1. Create an instance with a `CurrencyConverter`.
 * 2. Call `buildPriceElementsFromCurrencySymbolElementArray` with an array of 
 *    elements containing currency symbols to generate `PriceElement` objects.
 * 
 * Github Copilot was used for some code snippets, comments and debugging in this
 * class.
 * 
 * @author Eldon MacDonald
 */
class PriceElementBuilder {

    /**
     * @param {CurrencyConverter} converter - Instance of CurrencyConverter to handle price conversion.
     */
    constructor(converter) {
        if(!(converter instanceof CurrencyConverter)) {
            throw new TypeError("converter argument must be of class" +
                " CurrencyConverter");
        }

        this.converter = converter;

        // Regex to match numeric price patterns (e.g., "123.45", "1,234")
        this.priceRegex = /[\d,]+(\.[\d]+)?/;
    }

    /**
     * Builds an array of `PriceElement` objects from an array of DOM elements 
     * containing currency symbols.
     * 
     * @param {Array<Element>} currencySymbolElementArray - Array of elements containing currency symbols.
     * @returns {Array<PriceElement>} Array of `PriceElement` objects.
     */
    buildPriceElementsFromCurrencySymbolElementArray(currencySymbolElementArray) {
        let priceElems = [];

        currencySymbolElementArray.forEach(currencySymbolElem => {

            if(!(currencySymbolElem instanceof Element)) {
                throw new TypeError("all elements in currencySymbolElementArray " +
                    "argument must be of class Element");
            }

            if(this.isPriceContainedInSingleElement(currencySymbolElem)) {
                let priceElem = this.buildPriceElementFromSingleElement(currencySymbolElem);
                if(priceElem) {
                    priceElems.push(priceElem);
                }
            } else {
                let priceElem = this.buildPriceElementThroughParent(currencySymbolElem);
                if(priceElem) {
                    priceElems.push(priceElem);
                }
            }
        });

        return priceElems;
    }

    /**
     * Checks if the price is contained within a single DOM element.
     * 
     * @param {Element} elem - DOM element to check.
     * @returns {boolean} True if the price is contained in the element, false otherwise.
     */
    isPriceContainedInSingleElement(elem) {
        return this.priceRegex.test(elem.textContent);
    }

    /**
     * Builds a `PriceElement` from a single DOM element containing the price.
     * 
     * @param {Element} elem - DOM element containing the price.
     * @returns {PriceElement|null} A `PriceElement` object or null if no price is found.
     */
    buildPriceElementFromSingleElement(elem) {
        let price;
        try {
            price = this.getPriceFromElementText(elem);
        } catch (e) {
            console.warn(e.message);
            return null;
        }

        let convertedPrice = this.converter.getConvertedString(price);

        let priceElem = new PriceElement(
            convertedPrice,
            elem
        );

        return priceElem;
    }

    /**
     * Extracts the price from the text content of a DOM element.
     * 
     * @param {Element} elem - DOM element containing the price.
     * @returns {number} Extracted price as a float.
     * @throws {Error} If no price is found in the element text.
     */
    getPriceFromElementText(elem) {

        const elemText = elem.textContent.trim();
        const cleanElemText = elemText.replace(/\s+/g, '');
        const priceMatch = cleanElemText.match(this.priceRegex);

        if(!priceMatch || priceMatch.length <= 0) {
            throw new Error("Tried to find the price associated with the " +
                "following element text, but found no" +
                " price regex matches: " +
                elemText);
        }

        const cleanPrice = priceMatch[0].replace(/,/g, '');

        return parseFloat(cleanPrice);
    }

    /**
     * Builds a `PriceElement` by analyzing the parent of the given DOM element.
     * 
     * @param {Element} elem - DOM element whose parent contains the price.
     * @returns {PriceElement|null} A `PriceElement` object or null if no price is found.
     */
    buildPriceElementThroughParent(elem) {
        let price;
        try {
            price = this.getPriceFromParentText(elem);
        } catch (e) {
            console.warn(e.message);
            return null;
        }

        let convertedPrice = this.converter.getConvertedString(price);

        let priceElem = new PriceElement(
            convertedPrice,
            elem.parentNode
        );

        return priceElem;
    }

    /**
     * Extracts the price from the text content of the parent of a DOM element.
     * 
     * @param {Element} elem - DOM element whose parent contains the price.
     * @returns {number} Extracted price as a float.
     * @throws {Error} If no price is found in the parent text.
     */
    getPriceFromParentText(elem) {
        const parentInnerText = elem.parentNode.textContent;
        const indexInParent = this.findIndexOfElementTextInParentTextContent(elem);

        const substringFromIndex = parentInnerText.substring(indexInParent);
        const cleanSubstringFromIndex = substringFromIndex.replace(/\s+/g, '');
        const priceMatches = cleanSubstringFromIndex.match(this.priceRegex);

        if(!priceMatches || priceMatches.length <= 0) {
            throw new Error("Tried to find the price associated with the " +
                "following parent text, but found no price regex matches: " +
                parentInnerText.trim());
        }

        const cleanPrice = priceMatches[0].replace(/,/g, '');

        return parseFloat(cleanPrice);
    }

    /**
     * Finds the index of the text content of a DOM element within its parent's text content.
     * 
     * @param {Element} elem - DOM element whose text index is to be found.
     * @returns {number} Index of the element's text in the parent's text content.
     * @throws {Error} If the element is not found in its parent's child nodes.
     */
    findIndexOfElementTextInParentTextContent(elem) {
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

    /**
     * Builds a RangedPriceElement from a string price and a DOM Range.
     * Cleans the price string, parses it, converts it, and determines the bounding element.
     * 
     * @param {string} stringPrice - The price as a string (may include non-numeric characters).
     * @param {Range} range - The DOM Range representing the price's location.
     * @returns {RangedPriceElement} The constructed RangedPriceElement.
     * @throws {Error} If the price cannot be parsed as a float.
     */
    buildRangedPriceElement(stringPrice, range) {
        //remove any characters that could not be part of the price
        const cleanPrice = stringPrice.replace(/[^\d\.]+/g, '');

        let priceFloat
        try{
            priceFloat = parseFloat(cleanPrice);
        } catch (e) {
            throw new Error(`could not find price number in string ` +
                `${stringPrice}`)
        }

        let convertedPrice = this.converter.getConvertedString(priceFloat);

        let boundingElem = range.commonAncestorContainer;
        while(boundingElem.nodeType != Node.ELEMENT_NODE) {
            boundingElem = boundingElem.parentNode;
        }
        
        return new RangedPriceElement(
            convertedPrice,
            boundingElem,
            range
        );
    }

    /**
     * Builds an ExtendedPriceElement from a string price and a DOM Range.
     * Cleans the price string, parses it, converts it, and determines the bounding element.
     * Includes both the original and converted price/currency information.
     * 
     * @param {string} stringPrice - The price as a string (may include non-numeric characters).
     * @param {Range} range - The DOM Range representing the price's location.
     * @returns {ExtendedPriceElement} The constructed ExtendedPriceElement.
     * @throws {Error} If the price cannot be parsed as a float.
     */
    buildExtendedPriceElement(stringPrice, range) {
        const cleanPrice = stringPrice.replace(/[^\d\.]+/g, '');

        let priceFloat
        try{
            priceFloat = parseFloat(cleanPrice);
        } catch (e) {
            throw new Error(`could not find price number in string ` +
                `${stringPrice}`)
        }

        let convertedPrice = this.converter.getConvertedString(priceFloat);

        let boundingElem = range.commonAncestorContainer;
        while(boundingElem.nodeType != Node.ELEMENT_NODE) {
            boundingElem = boundingElem.parentNode;
        }
        
        return new ExtendedPriceElement(
            convertedPrice,
            cleanPrice,
            this.converter.convertToCurrency,
            this.converter.currency,
            boundingElem,
            range
        );
    }
}