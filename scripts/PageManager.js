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
    
        let closest = null;
        hoveringElems.forEach((instance) => {
            if(!closest) {
                closest = instance;
            }
            
            const closestRect = closest.getBoundingClientRect();
            const currentDistance = Math.sqrt(
                Math.pow(this.mousePosX - closestRect.left, 2) +
                Math.pow(this.mousePosY - closestRect.top, 2)
            );
            
            const instanceRect = instance.getBoundingClientRect();
            const newDistance = Math.sqrt(
                Math.pow(this.mousePosX - instanceRect.left, 2) +
                Math.pow(this.mousePosY - instanceRect.top, 2)
            );
    
            if (newDistance < currentDistance) {
                closest = instance;
            }
        });
    
        if (closest) {
            if(closest.isVisible()) {
                this.priceFrame.displayPriceElementInfoOnPriceDiv(closest);
                if(!this.priceFrame.isPriceDivVisible()) {
                    this.priceFrame.showPriceDiv();
                }
            }
        }
    }
}