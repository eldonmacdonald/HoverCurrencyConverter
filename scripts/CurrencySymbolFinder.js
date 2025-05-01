class CurrencySymbolFinder {

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
            return !/[{}()]/.test(currencyResult.textContent.trim())
        })
    }
}