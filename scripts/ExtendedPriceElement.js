class ExtendedPriceElement extends RangedPriceElement {
    constructor(displayPrice, originalPrice, displayCurrency, originalCurrency, 
        boundingElem, range) {
        super(displayPrice, boundingElem, range);

        this.originalPrice = originalPrice;
        this.displayCurrency = displayCurrency;
        this.originalCurrency = originalCurrency;
    }
}