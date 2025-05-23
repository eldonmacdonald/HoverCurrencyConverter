/**
 * Represents a price element that is associated with a specific DOM Range.
 * 
 * Extends PriceElement by adding:
 * - A DOM Range indicating the exact location of the price in the document.
 * 
 * Provides a method to get the bounding rectangle of the price, using the range
 * if possible, or falling back to the bounding element.
 */
class RangedPriceElement extends PriceElement {

    /**
     * Constructs a RangedPriceElement.
     * 
     * @param {number|string} displayPrice - The price to display (converted or original).
     * @param {Element} boundingElem - The DOM element bounding this price.
     * @param {Range} range - The DOM Range representing the price's location.
     */
    constructor(displayPrice, boundingElem, range) {
        super(displayPrice, boundingElem);

        /**
         * The DOM Range representing the price's location in the document.
         * @type {Range}
         */
        this.range = range;
    }

    /**
     * Returns the bounding client rectangle for the price.
     * Uses the range's bounding rect if the range is within a single node,
     * otherwise falls back to the bounding element's rect.
     * 
     * @returns {DOMRect} The bounding rectangle of the price.
     */
    getBoundingClientRect() {

        // Only return the range if the range's start end end container are also
        // its common ancestor, as in the price is contained in a single node
        if(this.range.commonAncestorContainer == this.range.startContainer
            && this.range.commonAncestorContainer == this.range.endContainer) {
            return this.range.getBoundingClientRect();
        } else {
            return this.boundingElem.getBoundingClientRect();
        }
    }
}