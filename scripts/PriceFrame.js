class PriceFrame {

    static resizeGracePeriod = 300;

    constructor(frame, priceDiv) {
        this.frame = frame;
        this.priceDiv = priceDiv;
    }

    static async build(frameContentUrl, priceDivId) {
        let frame = this.createFrame();
        frame = await this.initializeFrame(frameContentUrl, frame);
        let priceDiv = this.getPriceDiv(frame, priceDivId);
        
        return new PriceFrame(frame, priceDiv);
    }

    static createFrame() {
        let frame = document.createElement("iframe");

        frame.style.position = "fixed";
        frame.style.pointerEvents = "none";

        frame.style.width = window.innerWidth + "px";
        frame.style.height = window.innerHeight + "px";

        window.addEventListener('resize', () => {
            if(this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                frame.style.width = window.innerWidth + "px";
                frame.style.height = window.innerHeight + "px";
            }, PriceFrame.resizeGracePeriod);
        })

        frame.style.top = "0px";
        frame.style.left = "0px";

        //frame.style.border = "none";
        frame.style.zIndex = "9999";

        return frame;
    }

    static initializeFrame(frameContentUrl, frame) {
        return new Promise((resolve, reject) => {
            fetch(frameContentUrl)
                .then(response => response.text())
                .then(html => {
                    frame.srcdoc = html;
                    document.body.appendChild(frame);

                    frame.onload = () => {
                        resolve(frame); // Resolve the promise when initialized
                    };
                })
                .catch(reject); // In case fetch fails
        });
    }

    static getPriceDiv(frame, divId) {
        return frame.contentDocument.getElementById(divId);
    }

    displayPriceElementInfoOnPriceDiv(priceElement) {
        const priceElementRect = priceElement.getBoundingClientRect();
        this.priceDiv.style.top = `${priceElementRect.top - this.priceDiv.offsetHeight}px`;
        this.priceDiv.style.left = `${priceElementRect.left}px`

        this.priceDiv.innerText = priceElement.displayPrice;
    }

    isPriceDivVisible() {
        return this.priceDiv.style.visibility != "hidden";
    }

    showPriceDiv() {
        this.priceDiv.style.visibility = "visible";
    }

    hidePriceDiv() {
        this.priceDiv.style.visibility = "hidden";
    }
}