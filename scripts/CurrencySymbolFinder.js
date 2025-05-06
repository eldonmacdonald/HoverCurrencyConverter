class CurrencySymbolFinder {

    static gracePeriodForMutations = 100;

    static tagsThatContainVisualText = [
        "tt",
        "i",
        "b",
        "big",
        "small",
        "em",
        "strong",
        "dfn",
        "code",
        "samp",
        "kbd",
        "var",
        "cite",
        "abbr",
        "acronym",
        "sup",
        "span",
        "bdo",
        "address",
        "div",
        "a",
        "object",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "pre",
        "q",
        "ins",
        "del",
        "dt",
        "dd",
        "li",
        "label",
        "option",
        "textarea",
        "fieldset",
        "legend",
        "button",
        "caption",
        "td",
        "th",
        "title",
        "blockquote"
    ];

    constructor(currencySymbol) {
        this.currencySymbol = currencySymbol;
        this.currencyXpath = `//*[child::text()[contains(., '${currencySymbol}')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
        this.symbolElemResults = new Observable(new Array());
    }

    startLookingForSymbolElems() {
        this.timer = null;
        let observer = new MutationObserver(() => {
            this.findSymbolElemsAfterMutation();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Do a first pass of the page when the method is called
        this.findSymbolElemsAfterMutation();
    }

    findSymbolElemsAfterMutation() {
        if(this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.updateSymbolElemResults();
        }, CurrencySymbolFinder.gracePeriodForMutations);
    }

    updateSymbolElemResults() {
        let tmpSymbolElemResults = [];

        let currencyNodeResults = document.evaluate(this.currencyXpath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < currencyNodeResults.snapshotLength; i++) {
            let dollarResult = currencyNodeResults.snapshotItem(i);
            tmpSymbolElemResults.push(dollarResult);
        }
        this.symbolElemResults.setValue(
            CurrencySymbolFinder.filterSymbolElemResults(tmpSymbolElemResults)
        );
    }

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