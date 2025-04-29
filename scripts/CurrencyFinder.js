export class CurrencyFinder {

    constructor(currencySymbol, currency) {
        this.currency = currency;
        this.currencySymbol = currencySymbol;
        this.currencyXpath = `//*[child::text()[contains(., '${currencySymbol}')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
        this.currencyResults = new Map();

        let currencyNodeResults = document.evaluate(this.currencyXpath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < currencyNodeResults.snapshotLength; i++) {
            let dollarResult = currencyNodeResults.snapshotItem(i);
            this.currencyResults.set(dollarResult, dollarResult); // Store the result in the map
        }
        
        this.timer = null;
        let observer = new MutationObserver((mutationsList) => {
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
            this.currencyResults.clear(); // Clear the map before re-evaluating

            let currencyNodeResults = document.evaluate(this.currencyXpath, document,
                null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < currencyNodeResults.snapshotLength; i++) {
                let dollarResult = currencyNodeResults.snapshotItem(i);
                this.currencyResults.set(dollarResult, dollarResult); // Store the result in the map
            }
        }, 750);
    }
}