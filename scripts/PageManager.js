class PageManager {

    static supportedCurrencySymbols = ["$", "€", "£"];

    constructor(exchangeRates, convertToCurrency, localeFormat) {
        this.exchangeRates = exchangeRates;
        this.convertToCurrency = convertToCurrency;
        this.localeFormat = localeFormat;

        this.currencyContexts = [];

        this.delegateCurrencySymbolHandlers(this.findCurrencySymbolsOnPage(PageManager.supportedCurrencySymbols));

        document.addEventListener("mousemove", this.manageMouseMove.bind(this), false);

        this.interval = setInterval(this.executePriceElementLogic.bind(this), 500);
    }

    static createXPathStringForSymbol(symbol) {
        return `//*[child::text()[contains(., '${symbol}')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
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

    executePriceElementLogic() {
        
        this.currencyContexts.forEach((currencyContext) => {
            currencyContext.updateCurrencyPriceElemements();
        });

        this.checkHovering(); // Check for hovering on existing elements
    }

    checkHovering() {

        let hoveringElems = [];

        this.currencyContexts.forEach((currencyContext) => {
            currencyContext.priceElements.forEach((priceElement) => {
                if(priceElement.hoverRect) {
                    const rect = priceElement.hoverRect;
                    if (this.mousePosX >= rect.left && this.mousePosX <= rect.left + rect.width &&
                        this.mousePosY >= rect.top && this.mousePosY <= rect.top + rect.height) {
                        hoveringElems.push(priceElement);
                    } else {
                        if(priceElement.hovering) {
                            priceElement.unsetHover();
                        }
                    }
                }
            });
        });
    
        let closest = null;
        hoveringElems.forEach((instance) => {
            if(!closest) {
                closest = instance;
            }
    
            const currentDistance = Math.sqrt(
                Math.pow(this.mousePosX - closest.hoverRect.left, 2) +
                Math.pow(this.mousePosY - closest.hoverRect.top, 2)
            );
    
            const newDistance = Math.sqrt(
                Math.pow(this.mousePosX - instance.hoverRect.left, 2) +
                Math.pow(this.mousePosY - instance.hoverRect.top, 2)
            );
    
            if (newDistance < currentDistance) {
                closest = instance;
            }
        });
    
        if (closest) {
            closest.setHover();
        }
    
        // Remove hover effect from elements that are not the closest   
        hoveringElems.forEach((instance) => {
            if (instance !== closest && instance.hovering) {
                instance.unsetHover();
            }
        });
    }
}