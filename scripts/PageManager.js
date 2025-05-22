/**
 * Manages currency conversion and price display interactions on a web page.
 * 
 * The PageManager is responsible for:
 * - Initializing and managing currency conversion contexts for different currencies.
 * - Handling mouse and scroll events to display converted prices in a floating frame.
 * - Observing DOM mutations to update price elements dynamically.
 * 
 * Usage:
 * 1. Instantiate with exchange rates, target currency, locale format, and source currency.
 * 2. Call `activatePageManager()` to initialize event listeners and mutation observers.
 */
class PageManager {

    /**
     * Constructs a PageManager instance.
     * 
     * @param {Object} exchangeRates - Exchange rates for currency conversion.
     * @param {string} convertToCurrency - The currency code to convert prices to.
     * @param {string} localeFormat - The locale format for displaying prices.
     * @param {string} convertFrom - The source currency code, or "AUTODETECT" to infer from context.
     */
    constructor(exchangeRates, convertToCurrency, localeFormat, convertFrom) {
        this.exchangeRates = exchangeRates;
        this.convertToCurrency = convertToCurrency;
        this.localeFormat = localeFormat;
        this.convertFrom = convertFrom;

        /**
         * Array of currency context objects (RegexPriceElementFinder instances).
         * Each context is responsible for finding and converting prices for a specific currency.
         * @type {Array}
         */
        this.currencyContexts = [];
    }

    /**
     * Initializes the PageManager:
     * - Builds the floating price frame.
     * - Sets up currency contexts for price detection and conversion.
     * - Adds event listeners for mouse movement and scroll.
     * - Observes DOM mutations to update price elements dynamically.
     */
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

    /**
     * Called when the DOM is mutated.
     * Updates all currency contexts to refresh their price elements.
     */
    onPageMutation() {
        this.currencyContexts.forEach(currencyContext => {
            currencyContext.updatePriceElements();
        })
    }

    /**
     * Handles scroll events by hiding the floating price frame.
     */
    scrollEvent() {
        this.priceFrame.hidePriceDiv();
    }

    /**
     * Creates currency contexts for price detection and conversion.
     * If a specific source currency is provided, only that context is created.
     * Otherwise, contexts for USD, CAD, NZD, AUD, EUR, GBP, and INR are created.
     */
    createCurrencyContexts() {
        if(this.convertFrom != "AUTODETECT") {
            let converter = new CurrencyConverter(
                this.convertFrom,
                this.convertToCurrency,
                this.exchangeRates,
                this.localeFormat
            );
            let regexPriceElementFinder = new RegexPriceElementFinder(/(\$|€|£|₹)/g, converter);
            this.currencyContexts.push(regexPriceElementFinder);
            return;
        }

        this.createDollarContexts();
        this.createEuroContexts();
        this.createPoundContexts();
        this.createRupeeContexts();
    }

    /**
     * Creates contexts for dollar-based currencies (USD, CAD, NZD, AUD).
     * Also determines the default currency to use for generic dollar signs based on the page URL.
     */
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

    /**
     * Creates a context for detecting and converting Euro (€) prices.
     */
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

    /**
     * Creates a context for detecting and converting Pound (£) prices.
     */
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

    /**
     * Creates a context for detecting and converting Rupee (₹) prices.
     */
    createRupeeContexts() {
        let converter = new CurrencyConverter(
            "INR",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        let regexPriceElementFinder = new RegexPriceElementFinder(/₹/g, converter);
        this.currencyContexts.push(regexPriceElementFinder);
    }

    /**
     * Handles mouse movement events.
     * Tracks the mouse position and checks if it is hovering over a price element.
     * 
     * @param {MouseEvent} event - The mousemove event.
     */
    manageMouseMove(event) {
        this.mousePosX = event.clientX;
        this.mousePosY = event.clientY;
        this.checkHovering();
    }

    /**
     * Checks if the mouse is hovering over any price elements.
     * If so, displays the floating price frame with conversion info.
     * Otherwise, hides the frame.
     */
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

    /**
     * Returns an array of elements from the given list that contain the specified point.
     * 
     * @param {Array} elems - Array of price element objects.
     * @param {number} pointX - X coordinate.
     * @param {number} pointY - Y coordinate.
     * @returns {Array} Elements containing the point.
     */
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

    /**
     * Compares two price elements by their distance from a given point.
     * 
     * @param {Object} a - First price element.
     * @param {Object} b - Second price element.
     * @param {number} pointX - X coordinate.
     * @param {number} pointY - Y coordinate.
     * @returns {number} Negative if a is closer, positive if b is closer.
     */
    comparePriceElemDifferenceInDistance(a, b, pointX, pointY) {

        const distanceA = a.getElementDistanceFromPoint(pointX, pointY);

        const distanceB = b.getElementDistanceFromPoint(pointX, pointY);

        return distanceA - distanceB;
    }

    /**
     * Displays the floating price frame for the first visible price element in the array.
     * If no visible element is found, hides the frame.
     * 
     * @param {Array} elems - Array of price element objects.
     */
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