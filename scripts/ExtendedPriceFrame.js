class ExtendedPriceFrame extends PriceFrame {
    constructor(frame, priceDiv, conversionConfirmationElem, originalPriceElem, newPriceElem) {
        super(frame, priceDiv);

        this.conversionConfirmationElem = conversionConfirmationElem;
        this.originalPriceElem = originalPriceElem;
        this.newPriceElem = newPriceElem;
    }

    static async build(frameContentUrl, priceDivId, 
        conversionConfirmationElemId, originalPriceElemId, newPriceElemId) {
        let frame = this.createFrame();
        frame = await this.initializeFrame(frameContentUrl, frame);
        let priceDiv = this.getPriceDiv(frame, priceDivId);
        let conversionConfirmationElem = this.getGenericElement(frame, conversionConfirmationElemId);
        let originalPriceElem = this.getGenericElement(frame, originalPriceElemId);
        let newPriceElem = this.getGenericElement(frame, newPriceElemId);
        
        return new ExtendedPriceFrame(frame, priceDiv, 
            conversionConfirmationElem, originalPriceElem, newPriceElem);
    }

    static getGenericElement(frame, genericElementId) {
        if (!frame.contentDocument) {
            throw new Error(`given iframe does not have any content`);
        }

        const ret = frame.contentDocument.getElementById(genericElementId);

        if (ret) {
            return ret;
        } else {
            throw new Error(`element id ${genericElementId} did not match any elements ` +
                `in the frame document`);
        }
    }

    displayPriceElementInfoOnPriceDiv(priceElement) {
        this.newPriceElem.innerText = priceElement.displayPrice;

        this.conversionConfirmationElem.innerText = 
            `${priceElement.originalCurrency} → ${priceElement.displayCurrency}`
        
        this.originalPriceElem.innerText = priceElement.originalPrice;
    }
}