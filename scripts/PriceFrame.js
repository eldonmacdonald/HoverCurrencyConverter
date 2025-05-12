/**
 * Represents a floating iframe used to display price information. The iframe 
 * contains a `priceDiv` element that can be updated and repositioned dynamically.
 * 
 * Usage:
 * 1. Use `PriceFrame.build` to create and initialize a `PriceFrame` instance.
 * 2. Use `displayPriceElementInfoOnPriceDiv` to update the displayed price.
 * 3. Use `movePriceDivToPoint` to reposition the `priceDiv` within the iframe.
 * 4. Use `showPriceDiv` and `hidePriceDiv` to control the visibility of the `priceDiv`.
 * 
 * @author Eldon MacDonald
 */
class PriceFrame {

    // Time (in ms) to wait after a window resize before resizing the iframe
    static resizeGracePeriod = 300;

    /**
     * @param {HTMLIFrameElement} frame - The iframe element used to display the price.
     * @param {HTMLDivElement} priceDiv - The div element inside the iframe for displaying the price.
     */
    constructor(frame, priceDiv) {
        this.frame = frame;
        this.priceDiv = priceDiv;
    }

    /**
     * Creates and initializes a `PriceFrame` instance.
     * 
     * @param {string} frameContentUrl - URL of the HTML content to load into the iframe.
     * @param {string} priceDivId - ID of the div element inside the iframe to use for displaying the price.
     * @returns {Promise<PriceFrame>} A promise that resolves to a `PriceFrame` instance.
     */
    static async build(frameContentUrl, priceDivId) {
        let frame = this.createFrame();
        frame = await this.initializeFrame(frameContentUrl, frame);
        let priceDiv = this.getPriceDiv(frame, priceDivId);
        
        return new PriceFrame(frame, priceDiv);
    }

    /**
     * Creates an iframe element with default styles for positioning and size.
     * 
     * @returns {HTMLIFrameElement} The created iframe element.
     */
    static createFrame() {
        let frame = document.createElement("iframe");

        frame.style.position = "fixed";
        frame.style.pointerEvents = "none";
        frame.style.width = window.innerWidth + "px";
        frame.style.height = window.innerHeight + "px";
        frame.style.top = "0px";
        frame.style.left = "0px";
        frame.style.colorScheme = "light";
        frame.style.zIndex = "9999";

        // Adjust iframe size on window resize
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                frame.style.width = window.innerWidth + "px";
                frame.style.height = window.innerHeight + "px";
            }, PriceFrame.resizeGracePeriod);
        });

        return frame;
    }

    /**
     * Loads HTML content into the iframe and appends it to the document body.
     * 
     * @param {string} frameContentUrl - URL of the HTML content to load.
     * @param {HTMLIFrameElement} frame - The iframe element to initialize.
     * @returns {Promise<HTMLIFrameElement>} A promise that resolves to the initialized iframe.
     */
    static initializeFrame(frameContentUrl, frame) {
        return new Promise((resolve, reject) => {
            fetch(frameContentUrl)
                .then(response => response.text())
                .then(html => {
                    frame.srcdoc = html;
                    document.body.appendChild(frame);

                    frame.onload = () => {
                        resolve(frame);
                    };
                })
                .catch(reason => {
                    reject(new Error(`Fetching file at url ` +
                        `'${frameContentUrl}' failed. Reason: ${reason}`));
                });
        });
    }

    /**
     * Retrieves the div element inside the iframe by its ID.
     * 
     * @param {HTMLIFrameElement} frame - The iframe containing the div element.
     * @param {string} divId - ID of the div element to retrieve.
     * @returns {HTMLDivElement} The retrieved div element.
     * @throws {Error} If the div element is not found or the iframe has no content.
     */
    static getPriceDiv(frame, divId) {
        if (!frame.contentDocument) {
            throw new Error(`given iframe does not have any content`);
        }

        const ret = frame.contentDocument.getElementById(divId);

        if (ret) {
            return ret;
        } else {
            throw new Error(`div id ${divId} did not match any elements ` +
                `in the frame document`);
        }
    }

    /**
     * Updates the `priceDiv` with the display price from a `PriceElement`.
     * 
     * @param {PriceElement} priceElement - The `PriceElement` containing the price to display.
     */
    displayPriceElementInfoOnPriceDiv(priceElement) {
        this.priceDiv.innerText = priceElement.displayPrice;
    }

    /**
     * Moves the top left corner of `priceDiv` to the specified coordinates 
     * within the iframe.
     * 
     * @param {number} x - The x-coordinate to move the `priceDiv` to.
     * @param {number} y - The y-coordinate to move the `priceDiv` to.
     */
    movePriceDivToPoint(x, y) {
        this.priceDiv.style.left = `${x}px`;
        this.priceDiv.style.top = `${y}px`;
    }

    /**
     * Checks if the `priceDiv` is currently visible.
     * 
     * @returns {boolean} True if the `priceDiv` is visible, false otherwise.
     */
    isPriceDivVisible() {
        return this.priceDiv.style.visibility != "hidden";
    }

    /**
     * Makes the `priceDiv` visible.
     */
    showPriceDiv() {
        this.priceDiv.style.visibility = "visible";
    }

    /**
     * Hides the `priceDiv`.
     */
    hidePriceDiv() {
        this.priceDiv.style.visibility = "hidden";
    }
}