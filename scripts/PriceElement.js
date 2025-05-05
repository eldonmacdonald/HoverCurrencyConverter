class PriceElement {

    constructor(displayPrice, boundingElem) {
        this.displayPrice = displayPrice;
        this.boundingElem = boundingElem 
    }

    getBoundingClientRect() {
        return this.boundingElem.getBoundingClientRect();
    }

    isVisible() {
        const rect = this.boundingElem.getBoundingClientRect();
        if(rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
            rect.right > (window.innerWidth || document.documentElement.clientWidth) ||
            rect.left < 0 || rect.top < 0) {

            return false;
        }

        let currentElement = this.boundingElem;
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

    destroy() {
        this.hovering = false;
    }
}