class PriceElementBuilder {

    constructor(converter) {
        this.converter = converter;
    }

    buildFromElementContainingFullPrice(elem) {
        let elemText = elem.textContent.trim();
        let priceMatch = elemText.match(/[\d,]+(\.\d{2})?/);
        const cleanPrice = priceMatch[0].replace(/,/g, '');
        let amount = parseFloat(cleanPrice);

        let convertedString = this.converter.getConvertedString(amount);

        return new PriceElement(
            elem.getBoundingClientRect().top,
            elem.getBoundingClientRect().left,
            elem.getBoundingClientRect().width,
            elem.getBoundingClientRect().height,
            convertedString
        );
    }

    buildFromElementContainingFullAmount(symbolElem, amountElem) {
        let amountText = amountElem.textContent.trim();
        let priceMatch = amountText.match(/[\d,]+(\.\d{2})?/);
        const cleanPrice = priceMatch[0].replace(/,/g, '');
        let amount = parseFloat(cleanPrice);

        let convertedString = this.converter.getConvertedString(amount);

        let fullElemHeight;
        let fullElemWidth;
        try {
            fullElemHeight = amountElem.getBoundingClientRect().height;
            fullElemWidth = symbolElem.getBoundingClientRect().width + amountElem.getBoundingClientRect().width;
        } catch (e) {
            fullElemHeight = amountElem.parentElement.getBoundingClientRect().height;
            fullElemWidth = amountElem.parentElement.getBoundingClientRect().width;
        }

        return new PriceElement(
            symbolElem.getBoundingClientRect().top,
            symbolElem.getBoundingClientRect().left,
            fullElemWidth,
            fullElemHeight,
            convertedString
        );
    }

    buildFromDollarAndCentElements(symbolElem, dollarElem, centElem) {
        let dollarText = dollarElem.textContent.trim();
        let centText = centElem.textContent.trim();

        let dollarMatch = dollarText.match(/[\d,]+/);
        let centMatch = centText.match(/[\d,]+/);

        if(dollarMatch && centMatch) {
            const cleanDollarPrice = dollarMatch[0].replace(/,/g, '');
            const cleanCentPrice = centMatch[0].replace(/,/g, '');

            let amount = parseFloat(cleanDollarPrice) + (parseFloat(cleanCentPrice) / 100);

            let convertedString = this.converter.getConvertedString(amount);

            return new PriceElement(
                symbolElem.getBoundingClientRect().top,
                symbolElem.getBoundingClientRect().left,
                symbolElem.getBoundingClientRect().width + dollarElem.getBoundingClientRect().width + centElem.getBoundingClientRect().width,
                symbolElem.getBoundingClientRect().height,
                convertedString
            );
        }
    }
}