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

    static scaleFactor = 2;
    static newPriceDivYPadding = 10;
    static newPriceDivXPadding = 5;
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
            width * PriceElement.scaleFactor,
            height * PriceElement.scaleFactor
        );
    }

    #createNewPriceDiv() {
        const newPriceDiv = document.createElement("div");
        newPriceDiv.classList.add("temp-price-div"); // Add a class for easy removal later

        newPriceDiv.style.position = "absolute";
        newPriceDiv.style.left = `${this.left + window.scrollX}px`;
        newPriceDiv.style.padding = `${PriceElement.newPriceDivXPadding}px ${PriceElement.newPriceDivYPadding}px`;
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