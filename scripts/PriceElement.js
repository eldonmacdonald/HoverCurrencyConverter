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

    constructor(top, left, width, height, displayPrice) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.displayPrice = displayPrice; 

        this.hoverRect = new PriceElement.Rectangle(
            top,
            left,
            width + 10,
            height + 10
        );
    }

    destroy() {
        this.hovering = false;
    }
}