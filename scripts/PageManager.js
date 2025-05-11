class PageManager {

    static supportedCurrencySymbols = ["$", "€", "£"];

    constructor(exchangeRates, convertToCurrency, localeFormat) {
        this.exchangeRates = exchangeRates;
        this.convertToCurrency = convertToCurrency;
        this.localeFormat = localeFormat;

        this.currencyContexts = [];
    }

    async activatePageManager() {
        this.priceFrame = await PriceFrame.build(
            chrome.runtime.getURL("resources/frame.html"),
            "price-div"
        );

        this.delegateCurrencySymbolHandlers(
            this.findCurrencySymbolsOnPage(PageManager.supportedCurrencySymbols)
        );

        this.currencyContexts.forEach(currencyContext => {
            currencyContext.activateCurrencyContext();
        })

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
            let hoveringElemsContext = this.getElementsThatContainPoint(
                currencyContext.priceElements,
                this.mousePosX,
                this.mousePosY
            );
            hoveringElems = hoveringElems.concat(hoveringElemsContext);
        });

        if(hoveringElems.length <= 0) {
            this.priceFrame.hidePriceDiv();
            return;
        }
        
        hoveringElems.sort((a, b) => {
            this.comparePriceElemDifferenceInDistance(a, b,
                this.mousePosX, this.mousePosY);
        });

        this.showFirstPriceElementInArrayThatIsVisible(hoveringElems);
    }

    getElementsThatContainPoint(elems, pointX, pointY) {
        let elemsThatContainPoint = [];
        elems.forEach((priceElement) => {
            if (priceElement.isPointWithinElementBoundaries(pointX, 
                pointY)) {
                elemsThatContainPoint.push(priceElement);
            }
        });
        return elemsThatContainPoint;
    }

    comparePriceElemDifferenceInDistance(a, b, pointX, pointY) {

        const distanceA = a.getElementDistanceFromPoint(pointX, pointY);

        const distanceB = b.getElementDistanceFromPoint(pointX, pointY);

        return distanceA - distanceB;
    }

    showFirstPriceElementInArrayThatIsVisible(elems) {
        for(let elemIndex = 0; elemIndex < elems.length; elemIndex++) {
            let currElem = elems[elemIndex];
            if(currElem.isVisible()) {
                this.priceFrame.displayPriceElementInfoOnPriceDiv(currElem);
                this.priceFrame.movePriceDivToPoint(this.mousePosX, this.mousePosY);

                if(!this.priceFrame.isPriceDivVisible()) {
                    this.priceFrame.showPriceDiv();
                }
            }
        }
    }
}