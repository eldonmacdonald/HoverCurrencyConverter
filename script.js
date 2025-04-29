
let convertToCurrency = "INR"; // Default currency to convert to

async function getExchangeRates() {
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${convertToCurrency}`; // Replace with your API URL
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        return null;
    }
}

let currencyExchangeRates = null;

let newPriceDivYPadding = 10;
let newPriceDivXPadding = 5;

async function initExtension() {
    currencyExchangeRates = await getExchangeRates();

    new PageManager();
}

class PriceElement {

    // Class to hold rectangle properties
    static Rectangle = class {
        constructor(top, left, width, height) {
            this.top = top;
            this.left = left;
            this.width = width;
            this.height = height;
            this.hovering = false;
        }
    };

    static #scaleFactor = 2;
    static processedElements = []; // Track processed elements

    constructor(top, left, width, height, displayPrice) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.displayPrice = displayPrice; 

        this.hoverRect = new PriceElement.Rectangle(
            top,
            left,
            width * PriceElement.#scaleFactor,
            height * PriceElement.#scaleFactor
        );

        PriceElement.processedElements.push(this);
    }

    #createNewPriceDiv() {
        const newPriceDiv = document.createElement("div");
        newPriceDiv.classList.add("temp-price-div"); // Add a class for easy removal later

        newPriceDiv.style.position = "absolute";
        newPriceDiv.style.left = `${this.left + window.scrollX}px`;
        newPriceDiv.style.padding = `${newPriceDivXPadding}px ${newPriceDivYPadding}px`;
        newPriceDiv.style.backgroundColor = "rgb(8, 8, 17)"; // Semi-transparent blue
        newPriceDiv.style.color = "white"; // Text color
        newPriceDiv.style.zIndex = "9999"; // Ensure it's on top

        newPriceDiv.innerHTML = this.displayPrice;

        document.body.appendChild(newPriceDiv);

        newPriceDiv.style.top = `${this.top + window.scrollY - newPriceDiv.offsetHeight}px`;

        // Optionally store a reference to the newPriceDiv for later removal
        this.newPriceDiv = newPriceDiv;
    }

    #removeNewPriceDiv() {
        if (this.newPriceDiv) {
            this.newPriceDiv.remove();
            this.newPriceDiv = null;
        }
    }

    setHover() {
        if(!this.hovering) {
            this.hovering = true;
            this.#createNewPriceDiv(); // Create new price div
        }
    }

    unsetHover() {
        this.hovering = false;
        this.#removeNewPriceDiv(); // Remove new price div
    }

    static destroyAll() {
        PriceElement.processedElements.forEach((instance) => {
            instance.destroy();
        });

        // Clear the processed elements array
        PriceElement.processedElements = [];
    }

    destroy() {
        this.#removeNewPriceDiv(); // Remove new price div if it exists
        this.hovering = false;

        // Remove this instance from the processed elements array
        PriceElement.processedElements = PriceElement.processedElements.filter(
            (instance) => instance !== this
        );
    }
}

class CurrencyConverter {

    constructor(currency) {
        this.currency = currency;
    }

    getConvertedString(amount) {
        let convertedAmount = amount / currencyExchangeRates[this.currency];
        return convertedAmount.toLocaleString('en-IN', { style: 'currency', currency: convertToCurrency });
    }
}

class PriceElementBuilder {

    constructor(converter) {
        this.converter = converter;
    }

    buildFromElementContainingFullPrice(elem) {
        let elemText = elem.textContent.trim();
        let priceMatch = elemText.match(/[\d,]+(\.\d{2})?/);
        const cleanPrice = priceMatch[0].replace(/,/g, '');
        let amount = parseFloat(cleanPrice);

        let convertedString = this.converter.getConvertedString(amount);

        new PriceElement(
            elem.getBoundingClientRect().top,
            elem.getBoundingClientRect().left,
            elem.getBoundingClientRect().width,
            elem.getBoundingClientRect().height,
            convertedString
        );
    }

    buildFromElementContainingFullAmount(symbolElem, amountElem) {
        let amountText = amountElem.textContent.trim();
        let priceMatch = amountText.match(/[\d,]+(\.\d{2})?/);
        const cleanPrice = priceMatch[0].replace(/,/g, '');
        let amount = parseFloat(cleanPrice);

        let convertedString = this.converter.getConvertedString(amount);

        let fullElemHeight;
        let fullElemWidth;
        try {
            fullElemHeight = amountElem.getBoundingClientRect().height;
            fullElemWidth = symbolElem.getBoundingClientRect().width + amountElem.getBoundingClientRect().width;
        } catch (e) {
            fullElemHeight = amountElem.parentElement.getBoundingClientRect().height;
            fullElemWidth = amountElem.parentElement.getBoundingClientRect().width;
        }

        new PriceElement(
            symbolElem.getBoundingClientRect().top,
            symbolElem.getBoundingClientRect().left,
            fullElemWidth,
            fullElemHeight,
            convertedString
        );
    }

    buildFromDollarAndCentElements(symbolElem, dollarElem, centElem) {
        let dollarText = dollarElem.textContent.trim();
        let centText = centElem.textContent.trim();

        let dollarMatch = dollarText.match(/[\d,]+/);
        let centMatch = centText.match(/[\d,]+/);

        if(dollarMatch && centMatch) {
            const cleanDollarPrice = dollarMatch[0].replace(/,/g, '');
            const cleanCentPrice = centMatch[0].replace(/,/g, '');

            let amount = parseFloat(cleanDollarPrice) + (parseFloat(cleanCentPrice) / 100);

            let convertedString = this.converter.getConvertedString(amount);

            new PriceElement(
                symbolElem.getBoundingClientRect().top,
                symbolElem.getBoundingClientRect().left,
                symbolElem.getBoundingClientRect().width + dollarElem.getBoundingClientRect().width + centElem.getBoundingClientRect().width,
                symbolElem.getBoundingClientRect().height,
                convertedString
            );
        }
    }
}

function getSiblingsThatMatchRegex(element, regex) {
    const siblings = Array.from(element.parentNode.childNodes); // Include all child nodes (elements + text nodes)
    return siblings.filter((sibling) => {
        if (sibling === element) {
            return false; // Skip the element itself
        }

        if (sibling.nodeType === Node.TEXT_NODE) {
            // Check if the text node matches the regex
            return regex.test(sibling.nodeValue.trim());
        } else if (sibling.nodeType === Node.ELEMENT_NODE) {
            // Check if the element's text content matches the regex
            return regex.test(sibling.textContent.trim());
        }

        return false; // Ignore other node types
    });
}

function isElementVisible(element) {

    const rect = element.getBoundingClientRect();
    if(rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
        rect.right > (window.innerWidth || document.documentElement.clientWidth) ||
        rect.left < 0 || rect.top < 0) {

        return false;
    }

    let currentElement = element;
    while (currentElement) {
        const computedStyle = window.getComputedStyle(currentElement);
        
        if(computedStyle.clip == "rect(0px, 0px, 0px, 0px)") {
            return false;
        }

        const opacity = parseFloat(computedStyle.opacity);
        if (opacity === 0) {
            return false; // If any ancestor has opacity 0, the element is not visible
        }
        currentElement = currentElement.parentElement; // Move up the DOM tree
    }
    return true;
}

class CurrencyFinder {

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

class PageManager {

    constructor() {

        this.currencyFinders = [];
        this.priceElementBuilders = new Map();

        this.#findCurrenciesOnPage();

        document.addEventListener("mousemove", this.manageMouseMove.bind(this), false);

        this.interval = setInterval(this.executePriceElementLogic.bind(this), 500);
    }

    #findCurrenciesOnPage() {
        let dollarPath = `//*[child::text()[contains(., '$')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
        let dollarNodeResults = document.evaluate(dollarPath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        if(dollarNodeResults.snapshotLength > 0) {
            if(/\/ca\//.test(window.location.href) || /.ca\//.test(window.location.href)) {
                this.currencyFinders.push(new CurrencyFinder("$", "CAD"));
                this.priceElementBuilders.set("CAD", new PriceElementBuilder(new CurrencyConverter("CAD")));
            } else {
                this.currencyFinders.push(new CurrencyFinder("$", "USD"));
                this.priceElementBuilders.set("USD", new PriceElementBuilder(new CurrencyConverter("USD")));
            }
        }
        
        let euroPath = `//*[child::text()[contains(., '€')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
        let euroNodeResults = document.evaluate(euroPath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        if(euroNodeResults.snapshotLength > 0) {
            this.currencyFinders.push(new CurrencyFinder("€", "EUR"));
            this.priceElementBuilders.set("EUR", new PriceElementBuilder(new CurrencyConverter("EUR")));
        }

        let poundPath = `//*[child::text()[contains(., '£')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
        let poundNodeResults = document.evaluate(poundPath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        if(poundNodeResults.snapshotLength > 0) {
            this.currencyFinders.push(new CurrencyFinder("£", "GBP"));
            this.priceElementBuilders.set("GBP", new PriceElementBuilder(new CurrencyConverter("GBP")));
        }
        
        let yenPath = `//*[child::text()[contains(., '¥')] and not(ancestor::*[contains(@style, 'display:none') or contains(@style, 'visibility:hidden')])]`
        let yenNodeResults = document.evaluate(yenPath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        if(yenNodeResults.snapshotLength > 0) {
            if(/\/jp\//.test(window.location.href) || /.jp\//.test(window.location.href)) {
                this.currencyFinders.push(new CurrencyFinder("¥", "JPY"));
                this.priceElementBuilders.set("JPY", new PriceElementBuilder(new CurrencyConverter("JPY")));
            }
            else {
                this.currencyFinders.push(new CurrencyFinder("¥", "CNY"));
                this.priceElementBuilders.set("CNY", new PriceElementBuilder(new CurrencyConverter("CNY")));
            }
        }
    }

    manageMouseMove(event) {
        this.mousePosX = event.clientX;
        this.mousePosY = event.clientY;
        this.checkHovering();
    }

    executePriceElementLogic() {
        // Clear previous instances
        PriceElement.destroyAll();
        
        this.currencyFinders.forEach((currencyFinder) => {
            currencyFinder.currencyResults.forEach((dollarResult) => {
    
                const isVisible = isElementVisible(dollarResult);
        
                if (isVisible) {
                    // Enhanced regex that handles:
                    // - Optional currency symbols (C, CA, US, etc.)
                    // - Optional commas in numbers
                    // - Optional whitespace
                    
                    if(!/[{}()]/.test(dollarResult.textContent.trim())) {
                        
                        let fullRegex = new RegExp("\\" + currencyFinder.currencySymbol + "\\s*[\\d,]+(\\.\\d{2})?")
                        if (fullRegex.test(dollarResult.textContent.trim())) {
                            this.priceElementBuilders.get(currencyFinder.currency).buildFromElementContainingFullPrice(dollarResult);
                        } else {
        
                            let centSiblings = getSiblingsThatMatchRegex(dollarResult, /(?<![\d])(\.\d{2})/);
                            let dollarSiblings = getSiblingsThatMatchRegex(dollarResult, /[\d,]+\.?/);
        
                            if (centSiblings.length > 0 && dollarSiblings.length > 0) {
                                this.priceElementBuilders.get(currencyFinder.currency).buildFromDollarAndCentElements(dollarResult, dollarSiblings[0], centSiblings[0]);
                            } else {

                                if(dollarSiblings.length >= 2) {
                                    this.priceElementBuilders.get(currencyFinder.currency).buildFromDollarAndCentElements(dollarResult, dollarSiblings[0], dollarSiblings[1]);
                                } else {
                                    let fullAmountSiblings = getSiblingsThatMatchRegex(dollarResult, /[\d,]+(\.\d{2})?/);
                                    if(fullAmountSiblings.length > 0) {
                                        console.log("Found!")
                                        this.priceElementBuilders.get(currencyFinder.currency).buildFromElementContainingFullAmount(dollarResult, fullAmountSiblings[0]);
                                    }
                                }
                            }
                        }
                    } else {
                        currencyFinder.currencyResults.delete(dollarResult);
                    }
                }
            });
        });

        this.checkHovering(); // Check for hovering on existing elements
    }

    checkHovering() {

        let hoveringElems = [];
    
        PriceElement.processedElements.forEach((instance) => {
            if (instance.hoverRect) {
                const rect = instance.hoverRect;
                if (this.mousePosX >= rect.left && this.mousePosX <= rect.left + rect.width &&
                    this.mousePosY >= rect.top && this.mousePosY <= rect.top + rect.height) {
                    hoveringElems.push(instance);
                } else {
                    if(instance.hovering) {
                        instance.unsetHover();
                    }
                }
            }
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

initExtension();