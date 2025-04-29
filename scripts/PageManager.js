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