/**
 * This class identifies and tracks DOM elements containing a specific currency symbol 
 * in their visible text. It updates its results automatically when the DOM changes, 
 * if the `startLookingForSymbolElems` method is called.
 * 
 * Found elements are stored in the `symbolElemResults` property, which is an Observable 
 * holding an array of matching elements.
 * 
 * Usage:
 * 1. Create an instance with the desired currency symbol.
 * 2. Call `startLookingForSymbolElems` to begin monitoring the DOM for changes.
 * 
 * @author Eldon MacDonald
 */
class CurrencySymbolFinder {

    // Time (in ms) to wait after a DOM mutation before scanning for changes
    static gracePeriodForMutations = 100;

    // List of tags likely to contain visible text
    static tagsThatContainVisualText = [
        "tt", "i", "b", "big", "small", "em", "strong", "dfn", "code", "samp",
        "kbd", "var", "cite", "abbr", "acronym", "sup", "span", "bdo", "address",
        "div", "a", "object", "p", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "q",
        "ins", "del", "dt", "dd", "li", "label", "option", "textarea", "fieldset",
        "legend", "button", "caption", "td", "th", "title", "blockquote"
    ];

    /**
     * @param {string} currencySymbol - The symbol to search for in visible DOM elements.
     */
    constructor(currencySymbol) {
        this.currencySymbol = currencySymbol;
        this.currencyXpath = `//*[child::text()[contains(., '${currencySymbol}')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`;
        this.symbolElemResults = new Observable(new Array());
    }

    /**
     * Starts monitoring the DOM for changes and updates the list of elements 
     * containing the currency symbol.
     */
    startLookingForSymbolElems() {

        // Create timer for mutation grace period
        this.timer = null;

        // Observe mutations to the page and update accordingly
        let observer = new MutationObserver(() => {
            this.findSymbolElemsAfterMutation();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Do a first pass of the page when the object is asked to begin looking
        this.findSymbolElemsAfterMutation();
    }

    /**
     * Resets the mutation grace period timer and schedules a scan for elements 
     * containing the currency symbol.
     */
    findSymbolElemsAfterMutation() {
        if(this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.updateSymbolElemResults();
        }, CurrencySymbolFinder.gracePeriodForMutations);
    }

    /**
     * Searches the DOM for elements containing the currency symbol and updates 
     * the `symbolElemResults` property with the filtered results.
     */
    updateSymbolElemResults() {

        // Need to create a temporary variable to store elements so that
        // functions observing symbolElemResults only fire after all
        // symbol element results have been found and appended
        let tmpSymbolElemResults = [];

        let currencyNodeResults = document.evaluate(this.currencyXpath, 
            document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        for (let i = 0; i < currencyNodeResults.snapshotLength; i++) {
            let dollarResult = currencyNodeResults.snapshotItem(i);
            tmpSymbolElemResults.push(dollarResult);
        }

        this.symbolElemResults.setValue(
            CurrencySymbolFinder.filterSymbolElemResults(tmpSymbolElemResults)
        );
    }

    /**
     * Filters out invisible or irrelevant elements from the given array of DOM elements.
     * 
     * @param {Array<Element>} symbolElemResults - Array of elements to filter.
     * @returns {Array<Element>} Filtered array of visible and relevant elements.
     */
    static filterSymbolElemResults(symbolElemResults) {
        return symbolElemResults.filter( (currencyResult) => {

            if(!(currencyResult instanceof Element)) {
                throw new TypeError("at least one element in the " + 
                    "symbolElemResults argument was not an HTML DOM element");
            }

            let symbolLikelyPartOfScript = /[{}]/.test(currencyResult.innerText);
            let symbolInVisualTextTag = this.tagsThatContainVisualText.includes
                (currencyResult.tagName.toLowerCase());

            return !symbolLikelyPartOfScript && symbolInVisualTextTag;
        })
    }
}