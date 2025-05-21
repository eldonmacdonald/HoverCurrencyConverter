class PageManager {

    static supportedCurrencySymbols = ["$", "€", "£"];

    constructor(exchangeRates, convertToCurrency, localeFormat) {
        this.exchangeRates = exchangeRates;
        this.convertToCurrency = convertToCurrency;
        this.localeFormat = localeFormat;

        this.currencyContexts = [];
    }

    async activatePageManager() {
        this.priceFrame = await ExtendedPriceFrame.build(
            chrome.runtime.getURL("resources/frame-extended.html"),
            "price-div",
            "conversion-confirmation",
            "original-price",
            "new-price-elem"
        );

        this.createCurrencyContexts();

        document.addEventListener("mousemove", 
            this.manageMouseMove.bind(this), 
            false
        );

        document.addEventListener('scroll',
            this.scrollEvent.bind(this)
        )

        // Observe mutations to the page and update accordingly
        let observer = new MutationObserver(() => {
            if(this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
               this.onPageMutation();
            }, 300);
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    onPageMutation() {
        this.currencyContexts.forEach(currencyContext => {
            currencyContext.updatePriceElements();
        })
    }

    scrollEvent() {
        this.priceFrame.hidePriceDiv();
    }

    createCurrencyContexts() {
        this.createDollarContexts();
    }

    createDollarContexts() {
        let converter = new CurrencyConverter(
            "CAD", 
            "INR", 
            this.exchangeRates,
            "en-IN"
        );

        this.currencyContexts.push(new RegexPriceElementFinder(/\$/, converter))
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
                const elemRect = currElem.getBoundingClientRect();
                const frameRect = this.priceFrame.priceDiv.getBoundingClientRect();
                this.priceFrame.displayPriceElementInfoOnPriceDiv(currElem);
                this.priceFrame.movePriceDivToPoint(elemRect.left, elemRect.top - frameRect.height);

                if(!this.priceFrame.isPriceDivVisible()) {
                    this.priceFrame.showPriceDiv();
                }
                return;
            }
        }
    }
}