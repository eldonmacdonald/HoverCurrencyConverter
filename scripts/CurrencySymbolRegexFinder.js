/**
 * This class extends `CurrencySymbolFinder` to locate DOM elements containing 
 * a currency symbol based on a regular expression. It identifies elements 
 * by matching text content against the provided regex and symbol.
 * 
 * Usage:
 * 1. Create an instance with a currency regex and symbol.
 * 2. Call `startLookingForSymbolElems` (inherited) to begin monitoring the DOM for changes.
 * 
 * Key Methods:
 * - `updateSymbolElemResults`: Updates the list of elements containing the currency symbol.
 * - `getElementThatContainsBodyTextIndex`: Finds the DOM element containing a specific text index.
 * 
 * @extends CurrencySymbolFinder
 * @author Eldon MacDonald
 */
class CurrencySymbolRegexFinder extends CurrencySymbolFinder {

    /**
     * Constructs a new instance of `CurrencySymbolRegexFinder`.
     * 
     * @param {RegExp} currencyRegex - Regular expression to match currency-related text.
     * @param {string} currencySymbol - The currency symbol to locate within matches.
     * 
     * @throws {Error} If the provided regex does not include the 'g' flag, it is added automatically.
     */
    constructor(currencyRegex, currencySymbol) {
        super(currencySymbol);
        // Ensure 'g' flag is present
        let flags = currencyRegex.flags.includes('g') ? currencyRegex.flags : currencyRegex.flags + 'g';
        this.currencyRegex = new RegExp(currencyRegex.source, flags);

        this.symbolRegex = new RegExp(currencySymbol, 'g');
    }

    /**
     * Updates the list of DOM elements containing the currency symbol by scanning 
     * the document body text using the provided regex and symbol.
     * 
     * @throws {Error} If the currency symbol is not found in the regex matches.
     */
    updateSymbolElemResults() {
        let documentBodyText = document.body.textContent;
        documentBodyText = documentBodyText.replace(/\s+/g, '');

        let matchSymbolIndices = [];
        let match;
        while ((match = this.currencyRegex.exec(documentBodyText)) !== null) {
            let symbolMatch = this.symbolRegex.exec(match[0]);
            if (symbolMatch) {
                let matchSymbolIndex = match.index + symbolMatch.index;
                matchSymbolIndices.push(matchSymbolIndex);
            } else {
                throw new Error("Could not find currency symbol in currency regex");
            }
        }

        let tmpSymbolElemResults = [];
        matchSymbolIndices.forEach(matchSymbolIndex => {
            let matchElem = this.getElementThatContainsBodyTextIndex(
                document.body,
                matchSymbolIndex
            );
            tmpSymbolElemResults.push(matchElem);
        });

        tmpSymbolElemResults = CurrencySymbolRegexFinder
            .filterSymbolElemResults(tmpSymbolElemResults);

        this.symbolElemResults.setValue(tmpSymbolElemResults);
    }

    /**
     * Recursively finds the DOM element containing the specified text index 
     * within the document body.
     * 
     * @param {Element} startingElem - The starting DOM element for the search.
     * @param {number} indexFromStartingElem - The text index to locate within the starting element.
     * @returns {Element} The DOM element containing the specified text index.
     * 
     * @throws {Error} If the index is greater than the body text length or unsupported node types are encountered.
     */
    getElementThatContainsBodyTextIndex(startingElem, indexFromStartingElem) {
        // Normalize the text content of the starting element by removing whitespace
        const startingElemEffectiveText = 
            startingElem.textContent.replace(/\s+/g, '');
        const startingElemEffectiveTextLength = 
            startingElemEffectiveText.length;

        // Base case: If the element has no child nodes
        if (!startingElem.hasChildNodes()) {
            // Check if the index falls within the current element's text
            if (indexFromStartingElem < startingElemEffectiveTextLength) {
                if (startingElem.nodeType === Node.TEXT_NODE) {
                    // If it's a text node, return its parent element
                    return startingElem.parentNode;
                } else if (startingElem.nodeType === Node.ELEMENT_NODE) {
                    // If it's an element node, return the element itself
                    return startingElem;
                } else {
                    // Unsupported node type encountered
                    throw new Error("Unsupported node type found");
                }
            } 
            // If the index exceeds the current element's text, move to the next sibling
            else if (startingElem.nextSibling) {
                return this.getElementThatContainsBodyTextIndex(
                    startingElem.nextSibling,
                    indexFromStartingElem - startingElemEffectiveTextLength
                );
            } 
            // If no next sibling exists, check the parent's next sibling
            else if (startingElem.parentNode.nextSibling) {
                return this.getElementThatContainsBodyTextIndex(
                    startingElem.parentNode.nextSibling,
                    indexFromStartingElem - startingElemEffectiveTextLength
                );
            } 
            // If no valid sibling or parent sibling exists, throw an error
            else {
                throw new Error("Index greater than body text length");
            }
        } 
        // Recursive case: If the element has child nodes
        else {
            if (startingElem.firstChild) {
                // Recursively search within the first child
                return this.getElementThatContainsBodyTextIndex(
                    startingElem.firstChild,
                    indexFromStartingElem
                );
            } else {
                // If no child node exists where expected, throw an error
                throw new Error("Did not find child node where there should be");
            }
        }
    }
}