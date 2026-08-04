/**
 * Manages currency conversion and price display interactions on a web page.
 * 
 * The PageManager is responsible for:
 * - Initializing and managing currency conversion contexts for different currencies.
 * - Handling mouse and scroll events to display converted prices in a floating frame.
 * - Observing DOM mutations to update price elements dynamically.
 * - Creating and managing the floating price frame that displays conversion information.
 * - Anything else related to the page that the user is interacting with.
 * 
 * Usage:
 * 1. Instantiate with exchange rates, target currency, locale format, and source currency.
 * 2. Call `activatePageManager()` to initialize event listeners and mutation observers.
 * 
 * Github Copilot was used for some code snippets, comments and debugging in this
 * class.
 * 
 * @author Eldon MacDonald
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

        this.pageTextToNode = new TextToNode();

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
        this.onPageMutation();
    }

    /**
     * Called when the DOM is mutated.
     * Updates all currency contexts to refresh their price elements.
     */
    onPageMutation() {
        this.pageString = this.updatePageString(document.body);
        this.currencyContexts.forEach(currencyContext => {
            currencyContext.updatePriceElements(this.pageString, this.pageTextToNode);
        });

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
            let regexPriceElementFinderSymbolFirst = new RegexPriceElementFinder(/(\$|€|£|₹|¥)/g, converter, true);
            let regexPriceElementFinderSymbolAfter = new RegexPriceElementFinder(/zł/g, converter, false);

            this.currencyContexts.push(regexPriceElementFinderSymbolAfter);
            this.currencyContexts.push(regexPriceElementFinderSymbolFirst);
            return;
        }

        this.createDollarContexts();
        this.createEuroContexts();
        this.createPoundContexts();
        this.createRupeeContexts();
        this.createYenAndYuanContexts();
        this.createPoleContexts();
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
            new RegexPriceElementFinder(USDPrefixRegex, USDConverter, true);
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
            new RegexPriceElementFinder(CADPrefixRegex, CADConverter, true);
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
            new RegexPriceElementFinder(NZDPrefixRegex, NZDConverter, true);
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
            new RegexPriceElementFinder(AUDPrefixRegex, AUDConverter, true);
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
        this.currencyContexts.push(new RegexPriceElementFinder(noPrefixRegex, genericConverter, true))
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
        let regexPriceElementFinder = new RegexPriceElementFinder(/€/g, converter, true);
        this.currencyContexts.push(regexPriceElementFinder);
    }

    /**
     * Creates a context for detecting and converting Polish (zł) prices.
     */
    createPoleContexts() {
        let converter = new CurrencyConverter(
            "PLN",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        let regexPriceElementFinder = new RegexPriceElementFinder(/zł/g, converter, false);
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
        let regexPriceElementFinder = new RegexPriceElementFinder(/£/g, converter, true);
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
        let regexPriceElementFinder = new RegexPriceElementFinder(/₹/g, converter, true);
        this.currencyContexts.push(regexPriceElementFinder);
    }

     /**
     * Creates contexts for ¥-based currencies (JPY, CNY).
     * Also determines the default currency to use for generic ¥ signs based on the page URL.
     */
    createYenAndYuanContexts() {
        let JPYConverter = new CurrencyConverter(
            "JPY",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        const JPYPrefixes = [
            "JP\\s*\\¥",
            "JP\\s*",
            "¥\\s*JP",
            "¥\\s*JPY"
        ]
        const JPYPrefixRegex = new RegExp(`(${JPYPrefixes.join("|")})`, "g");
        let JPYRegexPriceElementFinder = 
            new RegexPriceElementFinder(JPYPrefixRegex, JPYConverter, true);
        this.currencyContexts.push(JPYRegexPriceElementFinder);

        let CNYConverter = new CurrencyConverter(
            "JPY",
            this.convertToCurrency,
            this.exchangeRates,
            this.localeFormat
        )
        const CNYPrefixes = [
            "CN\\s*\\¥",
            "CN\\s*",
            "¥\\s*CN",
            "¥\\s*CNY"
        ]
        const CNYPrefixRegex = new RegExp(`(${CNYPrefixes.join("|")})`, "g");
        let CNYRegexPriceElementFinder = 
            new RegexPriceElementFinder(CNYPrefixRegex, CNYConverter, true);
        this.currencyContexts.push(CNYRegexPriceElementFinder);

        const href = window.location.href.toLowerCase();
        let defaultToConvertFrom = "JPY"
        if(href.includes(".cn") || href.includes("zh-cn") 
            || href.includes("zh_cn") || href.includes("/cn/")) {

            defaultToConvertFrom = "CNY"
        }
        const allPrefixes = JPYPrefixes
            .concat(CNYPrefixes);
        const noPrefixRegex = new RegExp(`(?<!${allPrefixes.join("|")})¥`);
        let genericConverter = new CurrencyConverter(
            defaultToConvertFrom, 
            this.convertToCurrency, 
            this.exchangeRates,
            this.localeFormat
        );
        this.currencyContexts.push(new RegexPriceElementFinder(noPrefixRegex, 
            genericConverter, true))
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

    /**
     * Checks if the associated DOM element is visible in the viewport.
     * 
     * @returns {boolean} True if the element is visible, false otherwise.
     */
    isVisible(elem) {
        const rect = elem.getBoundingClientRect();

        // Check if the element is outside the viewport
        if (
            rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
            rect.right > (window.innerWidth || document.documentElement.clientWidth) ||
            rect.left < 0 || rect.top < 0
        ) {
            return false;
        }

        let currentElement = elem;

        // Traverse up the DOM tree to check visibility and opacity
        while (currentElement) {
            const computedStyle = window.getComputedStyle(currentElement);

            // Check if the element or any ancestor is hidden
            if (computedStyle.visibility === "hidden") {
                return false;
            }

            // Check if the element or any ancestor is clipped
            if (computedStyle.clip === "rect(0px, 0px, 0px, 0px)") {
                return false;
            }

            // Check if the element or any ancestor has invisible clip-path
            if (computedStyle.clipPath == "inset(50%)") {
                return false;
            }


            // Check if the element or any ancestor has zero opacity
            const opacity = parseFloat(computedStyle.opacity);
            if (opacity === 0) {
                return false;
            }

            currentElement = currentElement.parentElement; // Move up the DOM tree
        }

        return true;
    }


    /**
     * Get a string of all useful text on the site
     */
    updatePageString(startingElement) {
        const treeWalker = document.createTreeWalker(
            startingElement,
            NodeFilter.SHOW_TEXT,
            null
        );
        let contentString = ""

        this.pageTextToNode.reset();

        let node;
        while((node = treeWalker.nextNode())) {
            // If the text likely does not contain a part of the price, skip
            if(node.textContent.length > 1000 ||
                node.textContent.replace(/\s+/g, '') == ''
            ) {
                
                continue;
            }

            let cleanedNodeText = node.textContent.replace(/\s+/g, '');

            const start = contentString.length;
            const end = contentString.length + cleanedNodeText.length;
            this.pageTextToNode.addTextToNodeRange(start, end, node);
            contentString += cleanedNodeText;
        }
        return contentString;
    }
}



