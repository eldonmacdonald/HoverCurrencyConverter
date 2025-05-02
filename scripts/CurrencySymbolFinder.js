class CurrencySymbolFinder {

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

    constructor(currencySymbol, currency) {
        this.currency = currency;
        this.currencySymbol = currencySymbol;
        this.currencyXpath = `//*[child::text()[contains(., '${currencySymbol}')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
        this.currencyResults = new Observable(new Array());

        let currencyNodeResults = document.evaluate(this.currencyXpath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < currencyNodeResults.snapshotLength; i++) {

            let dollarResult = currencyNodeResults.snapshotItem(i);

            let currencyResultsNewValue = Array.from(
                this.currencyResults.getValue()
            ).push(dollarResult);
            
            this.currencyResults.setValue(currencyResultsNewValue);
        }
        
        this.timer = null;
        let observer = new MutationObserver(() => {
            this.findCurrencyResultsInMutation();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    findCurrencyResultsInMutation() {
        if(this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            let tmpCurrencyResults = [];

            let currencyNodeResults = document.evaluate(this.currencyXpath, document,
                null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < currencyNodeResults.snapshotLength; i++) {
                let dollarResult = currencyNodeResults.snapshotItem(i);
                tmpCurrencyResults.push(dollarResult);
            }
            this.currencyResults.setValue(
                CurrencySymbolFinder.filterCurrencyResults(tmpCurrencyResults)
            );
        }, 750);
    }

    static filterCurrencyResults(currencyResults) {
        return currencyResults.filter( (currencyResult) => {
            return this.tagsThatContainVisualText.includes
                (currencyResult.tagName.toLowerCase());
        })
    }
}