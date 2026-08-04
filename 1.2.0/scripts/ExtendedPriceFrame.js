/**
 * ExtendedPriceFrame manages a floating UI frame that displays both the original
 * and converted price information for a price element.
 * 
 * Extends PriceFrame by adding references to elements for:
 * - The original price
 * - The converted (new) price
 * - The conversion confirmation (currencies involved)
 * 
 * Provides methods to build the frame, retrieve elements within it, and update
 * the frame's content based on a given price element.
 * 
 * Github Copilot was used for some code snippets, comments and debugging in this
 * class.
 * 
 * @author Eldon MacDonald
 */
class ExtendedPriceFrame extends PriceFrame {
    /**
     * Constructs an ExtendedPriceFrame.
     * 
     * @param {HTMLIFrameElement} frame - The iframe element containing the price frame UI.
     * @param {HTMLElement} priceDiv - The main container div for the price frame.
     * @param {HTMLElement} conversionConfirmationElem - Element displaying the conversion direction.
     * @param {HTMLElement} originalPriceElem - Element displaying the original price.
     * @param {HTMLElement} newPriceElem - Element displaying the converted price.
     */
    constructor(frame, priceDiv, conversionConfirmationElem, originalPriceElem, newPriceElem) {
        super(frame, priceDiv);
        this.conversionConfirmationElem = conversionConfirmationElem;
        this.originalPriceElem = originalPriceElem;
        this.newPriceElem = newPriceElem;
    }

    /**
     * Asynchronously builds and initializes an ExtendedPriceFrame.
     * Loads the frame content, retrieves required elements, and returns an instance.
     * 
     * @param {string} frameContentUrl - URL to load into the iframe.
     * @param {string} priceDivId - ID of the main price div in the frame.
     * @param {string} conversionConfirmationElemId - ID of the conversion confirmation element.
     * @param {string} originalPriceElemId - ID of the original price element.
     * @param {string} newPriceElemId - ID of the new price element.
     * @returns {Promise<ExtendedPriceFrame>} The initialized ExtendedPriceFrame instance.
     */
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

    /**
     * Retrieves a generic element by ID from the frame's content document.
     * Throws an error if the element is not found.
     * 
     * @param {HTMLIFrameElement} frame - The iframe containing the element.
     * @param {string} genericElementId - The ID of the element to retrieve.
     * @returns {HTMLElement} The found element.
     * @throws {Error} If the frame has no content or the element is not found.
     */
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

    /**
     * Updates the price frame UI with information from the given price element.
     * Sets the new price, original price, and conversion direction.
     * 
     * @param {ExtendedPriceElement} priceElement - The price element containing conversion info.
     */
    displayPriceElementInfoOnPriceDiv(priceElement) {
        this.newPriceElem.innerText = priceElement.displayPrice;

        this.conversionConfirmationElem.innerText = 
            `${priceElement.originalCurrency} → ${priceElement.displayCurrency}`
        
        this.originalPriceElem.innerText = priceElement.originalPrice;
    }
}