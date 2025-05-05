class PageManager {

    static supportedCurrencySymbols = ["$", "€", "£"];

    constructor(exchangeRates, convertToCurrency, localeFormat) {
        this.exchangeRates = exchangeRates;
        this.convertToCurrency = convertToCurrency;
        this.localeFormat = localeFormat;

        this.currencyContexts = [];

        this.priceFrame = new PriceFrame();

        this.delegateCurrencySymbolHandlers(
            this.findCurrencySymbolsOnPage(PageManager.supportedCurrencySymbols)
        );

        document.addEventListener("mousemove", 
            this.manageMouseMove.bind(this), 
            false
        );

        document.addEventListener('scroll',
            this.scrollEvent.bind(this)
        )
    }

    static createXPathStringForSymbol(symbol) {
        return `//*[child::text()[contains(., '${symbol}')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
    }

    scrollEvent() {
        this.priceFrame.hidePriceDiv();
    }

    findCurrencySymbolsOnPage(currencySymbolsToCheck) {
        return currencySymbolsToCheck.filter ((symbol) => {
            let path = PageManager.createXPathStringForSymbol(symbol);
            let nodeResults = document.evaluate(path, document,
                null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            if(nodeResults.snapshotLength > 0) {
                return true;
            }
            return false;
        });
    }

    delegateCurrencySymbolHandlers(currencySymbolsToCheck) {
        currencySymbolsToCheck.forEach((currencySymbol) => {
            switch(currencySymbol) {
                case "$": {
                    this.createDollarContexts();
                } break;
                case "€": {
                    this.createEuroContexts();
                } break;
                case "£": {
                    this.createPoundContexts();
                } break;
            }
        });
    }

    createDollarContexts() {
        this.currencyContexts.push(new CurrencyContext("$", "CAD", 
            this.convertToCurrency, this.exchangeRates, this.localeFormat));
    }

    createEuroContexts() {
        this.currencyContexts.push(new CurrencyContext("€", "EUR", 
            this.convertToCurrency, this.exchangeRates, this.localeFormat));
    }

    createPoundContexts() {
        this.currencyContexts.push(new CurrencyContext("£", "GBP", 
            this.convertToCurrency, this.exchangeRates, this.localeFormat));
    }

    manageMouseMove(event) {
        this.mousePosX = event.clientX;
        this.mousePosY = event.clientY;
        this.checkHovering();
    }

    checkHovering() {

        let hoveringElems = [];

        this.currencyContexts.forEach((currencyContext) => {
            currencyContext.priceElements.forEach((priceElement) => {
                const rect = priceElement.getBoundingClientRect();
                if (this.mousePosX >= rect.left && this.mousePosX <= rect.left + rect.width &&
                    this.mousePosY >= rect.top && this.mousePosY <= rect.top + rect.height) {
                    hoveringElems.push(priceElement);
                }
            });
        });

        if(hoveringElems.length <= 0) {
            this.priceFrame.hidePriceDiv();
            return;
        }
        
        hoveringElems.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();

            const distanceA = Math.sqrt(
                Math.pow(this.mousePosX - rectA.left, 2) +
                Math.pow(this.mousePosY - rectA.top, 2)
            );

            const distanceB = Math.sqrt(
                Math.pow(this.mousePosX - rectB.left, 2) +
                Math.pow(this.mousePosY - rectB.top, 2)
            );

            return distanceA - distanceB;
        });

        for(let hoveringElemIndex = 0; hoveringElemIndex < hoveringElems.length; hoveringElemIndex++) {
            let currElem = hoveringElems[hoveringElemIndex];
            if(currElem.isVisible()) {
                this.priceFrame.displayPriceElementInfoOnPriceDiv(currElem);
                if(!this.priceFrame.isPriceDivVisible()) {
                    this.priceFrame.showPriceDiv();
                }
            }
        }
    }
}