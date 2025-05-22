/**
 * Represents a price element with both original and converted price information.
 * 
 * Extends RangedPriceElement by adding:
 * - The original price and currency.
 * - The display (converted) price and currency.
 * 
 * Used to determine if a conversion is necessary and to provide both original
 * and converted price data for UI display.
 * @author Eldon MacDonald
 */
class ExtendedPriceElement extends RangedPriceElement {
    /**
     * Constructs an ExtendedPriceElement.
     * 
     * @param {number|string} displayPrice - The price to display (converted).
     * @param {number|string} originalPrice - The original price before conversion.
     * @param {string} displayCurrency - The currency code of the displayed price.
     * @param {string} originalCurrency - The currency code of the original price.
     * @param {Element} boundingElem - The DOM element bounding this price.
     * @param {Object} range - The range object representing the price's location in the DOM.
     */
    constructor(displayPrice, originalPrice, displayCurrency, originalCurrency, 
        boundingElem, range) {
        super(displayPrice, boundingElem, range);
        this.originalPrice = originalPrice;
        this.displayCurrency = displayCurrency;
        this.originalCurrency = originalCurrency;
    }

    /**
     * Determines if a currency conversion is necessary.
     * 
     * @returns {boolean} True if the display currency differs from the original currency.
     */
    isConversionNecessary() {
        return this.displayCurrency != this.originalCurrency;
    }
}