/**
 * Represents a price element in the DOM, including its converted price and the 
 * bounding DOM element. Provides utility methods to check visibility and retrieve 
 * the element's bounding rectangle.
 * 
 * Usage:
 * 1. Create an instance with the converted price and the associated DOM element.
 * 2. Use `getBoundingClientRect` to retrieve the element's position and size.
 * 3. Use `isVisible` to check if the element is visible in the viewport.
 * 
 * @author Eldon MacDonald
 */
class PriceElement {

    /**
     * @param {string} displayPrice - The converted price to display (e.g., "₹1,000").
     * @param {Element} boundingElem - The DOM element associated with the price.
     * @throws {TypeError} If `boundingElem` is not an instance of `Element`.
     */
    constructor(displayPrice, boundingElem) {
        if (!(boundingElem instanceof Element)) {
            throw new TypeError("boundingElem argument must be of type Element");
        }

        this.displayPrice = displayPrice;
        this.boundingElem = boundingElem;
    }

    /**
     * Retrieves the bounding rectangle of the associated DOM element.
     * 
     * @returns {DOMRect} The bounding rectangle of the element.
     */
    getBoundingClientRect() {
        return this.boundingElem.getBoundingClientRect();
    }

    /**
     * Checks if the associated DOM element is visible in the viewport.
     * 
     * @returns {boolean} True if the element is visible, false otherwise.
     */
    isVisible() {
        const rect = this.boundingElem.getBoundingClientRect();

        // Check if the element is outside the viewport
        if (
            rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
            rect.right > (window.innerWidth || document.documentElement.clientWidth) ||
            rect.left < 0 || rect.top < 0
        ) {
            return false;
        }

        let currentElement = this.boundingElem;

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

            // Check if the element or any ancestor has zero opacity
            const opacity = parseFloat(computedStyle.opacity);
            if (opacity === 0) {
                return false;
            }

            currentElement = currentElement.parentElement; // Move up the DOM tree
        }

        return true;
    }
}