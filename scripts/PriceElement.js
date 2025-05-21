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
     * Checks if the point is within the element's boundary, which in this case
     * is the ClientRect of the bounding element
     * 
     * @param {number} pointX - the x position of the point in the client
     * viewport
     * @param {number} pointY - the y position of the point in the client
     * viewport
     */
    isPointWithinElementBoundaries(pointX, pointY) {
        const rect = this.getBoundingClientRect();
        if (pointX >= rect.left && pointX <= rect.left + rect.width &&
            pointY >= rect.top && pointY <= rect.top + rect.height) {
            return true;
        }
        return false;
    }

    /**
     * Gives the distance from the top left corner of the element boundary to
     * the point given
     * 
     * @param {number} pointX - the x position of the point in the client
     * viewport
     * @param {number} pointY - the y position of the point in the client
     * viewport
     */
    getElementDistanceFromPoint(pointX, pointY) {
        const rect = this.getBoundingClientRect();
        return Math.sqrt(
            Math.pow(pointX - rect.left, 2) +
            Math.pow(pointY - rect.top, 2)
        );
    }
}