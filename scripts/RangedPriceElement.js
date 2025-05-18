class RangedPriceElement extends PriceElement {

    constructor(displayPrice, boundingElem, range) {
        super(displayPrice, boundingElem);

        this.range = range;
    }

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