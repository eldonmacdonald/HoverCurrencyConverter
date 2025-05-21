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
        this.createEuroContexts();
        this.createPoundContexts();
    }

    createDollarContexts() {
        let USDConverter = new CurrencyConverter(
            "USD",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        const USDPrefixes = [
            "US\\s*\\$",
            "USD\\s*\\$",
            "US\\s*",
            "USD\\s*",
            "$\\s*US",
            "$\\s*USD"
        ]
        const USDPrefixRegex = new RegExp(`(${USDPrefixes.join("|")})`, "g");
        let USDRegexPriceElementFinder = 
            new RegexPriceElementFinder(USDPrefixRegex, USDConverter);
        this.currencyContexts.push(USDRegexPriceElementFinder);

        let CADConverter = new CurrencyConverter(
            "CAD",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        const CADPrefixes = [
            "C\\s*\\$",
            "CA\\s*\\$",
            "$\\s*C",
            "$\\s*CA"
        ]
        const CADPrefixRegex = new RegExp(`(${CADPrefixes.join("|")})`, "g");
        let CADRegexPriceElementFinder = 
            new RegexPriceElementFinder(CADPrefixRegex, CADConverter);
        this.currencyContexts.push(CADRegexPriceElementFinder);

        let NZDConverter = new CurrencyConverter(
            "NZD",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        const NZDPrefixes = [
            "NZD\\s*\\$",
            "$\\s*NZD"
        ]
        const NZDPrefixRegex = new RegExp(`(${NZDPrefixes.join("|")})`, "g");
        let NZDRegexPriceElementFinder = 
            new RegexPriceElementFinder(NZDPrefixRegex, NZDConverter);
        this.currencyContexts.push(NZDRegexPriceElementFinder);

        let AUDConverter = new CurrencyConverter(
            "AUD",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        const AUDPrefixes = [
            "A\\s*\\$",
            "AU\\s*\\$",
            "AUD\\s*\\$",
            "$\\s*A",
            "$\\s*AU",
            "$\\s*AUD"
        ]
        const AUDPrefixRegex = new RegExp(`(${AUDPrefixes.join("|")})`, "g");
        let AUDRegexPriceElementFinder = 
            new RegexPriceElementFinder(AUDPrefixRegex, AUDConverter);
        this.currencyContexts.push(AUDRegexPriceElementFinder);

        const href = window.location.href.toLowerCase();
        let defaultToConvertFrom = "USD"
        if(href.includes(".ca") || href.includes("en-ca") 
            || href.includes("en_ca") || href.includes("/ca/")) {

            defaultToConvertFrom = "CAD"
        } else if(href.includes(".nz") || href.includes("en-nz") 
            || href.includes("en_nz") || href.includes("/nz/")) {
            
            defaultToConvertFrom = "NZD";
        } else if(href.includes(".au") || href.includes("en-au") 
            || href.includes("en_au") || href.includes("/au/")) {
            
            defaultToConvertFrom = "AUD";
        }
        
        const allPrefixes = USDPrefixes
            .concat(CADPrefixes)
            .concat(NZDPrefixes)
            .concat(AUDPrefixes);
        const noPrefixRegex = new RegExp(`(?<!${allPrefixes.join("|")})\\$`);
        let genericConverter = new CurrencyConverter(
            defaultToConvertFrom, 
            this.convertToCurrency, 
            this.exchangeRates,
            this.localeFormat
        );
        this.currencyContexts.push(new RegexPriceElementFinder(noPrefixRegex, genericConverter))
    }

    createEuroContexts() {
        let converter = new CurrencyConverter(
            "EUR",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        let regexPriceElementFinder = new RegexPriceElementFinder(/€/g, converter);
        this.currencyContexts.push(regexPriceElementFinder);
    }

    createPoundContexts() {
        let converter = new CurrencyConverter(
            "GBP",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        let regexPriceElementFinder = new RegexPriceElementFinder(/£/g, converter);
        this.currencyContexts.push(regexPriceElementFinder);
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

                // Only show the price div when a conversion is necessary
                if(currElem instanceof ExtendedPriceElement) {
                    if(!currElem.isConversionNecessary()) {
                        continue;
                    }
                }

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

        this.priceFrame.hidePriceDiv();
    }
}