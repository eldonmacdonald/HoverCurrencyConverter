class PriceFrame {

    constructor() {
        this.frame = document.createElement("iframe");

        this.frame.style.position = "fixed";
        this.frame.style.pointerEvents = "none";


        this.frame.style.width = window.innerWidth + "px";
        this.frame.style.height = window.innerHeight + "px";
        window.addEventListener('resize', () => {
            this.frame.style.width = window.innerWidth + "px";
            this.frame.style.height = window.innerHeight + "px";
        })

        this.frame.style.top = "0px";
        this.frame.style.left = "0px";

        this.frame.style.border = "none";
        this.frame.style.zIndex = "9999";

        fetch(chrome.runtime.getURL("resources/frame.html"))
        .then(response => response.text())
        .then(html => {
            this.frame.srcdoc = html;
            document.body.appendChild(this.frame);
            this.frame.onload = () => {
                this.initializeFrameContent();
                this.initialized = true;
                console.log("Initialized!");
            };
        });
    }

    initializeFrameContent() {
        let frameDocument = this.frame.contentDocument;
        this.priceDiv = frameDocument.getElementById("price-div");
    }

    displayPriceElementInfoOnPriceDiv(priceElement) {
        if(this.initialized) {
            this.priceDiv.style.top = `${priceElement.top - this.priceDiv.offsetHeight}px`;
            this.priceDiv.style.left = `${priceElement.left}px`

            this.priceDiv.innerText = priceElement.displayPrice;
        }
    }

    isPriceDivVisible() {
        if(this.initialized) {
            return this.priceDiv.style.visibility != "hidden";
        } else {
            return false;
        }
    }

    showPriceDiv() {
        if(this.initialized) {
            this.priceDiv.style.visibility = "visible";
        }
    }

    hidePriceDiv() {
        if(this.initialized) {
            this.priceDiv.style.visibility = "hidden";
        }
    }
}