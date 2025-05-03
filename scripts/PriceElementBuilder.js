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

        let range = document.createRange();
        range.selectNode(elem);

        return new PriceElement(
            range.getBoundingClientRect().top,
            range.getBoundingClientRect().left,
            range.getBoundingClientRect().width,
            range.getBoundingClientRect().height,
            convertedString
        );
    }

    buildFromElementContainingFullAmount(symbolElem, amountElem) {
        let amountText = amountElem.textContent.trim();
        let priceMatch = amountText.match(/[\d,]+(\.\d{2})?/);
        const cleanPrice = priceMatch[0].replace(/,/g, '');
        let amount = parseFloat(cleanPrice);

        let convertedString = this.converter.getConvertedString(amount);

        let range = document.createRange();
        range.setStartBefore(symbolElem);
        range.setEndAfter(amountElem);

        return new PriceElement(
            range.getBoundingClientRect().top,
            range.getBoundingClientRect().left,
            range.getBoundingClientRect().width,
            range.getBoundingClientRect().height,
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

            let range = document.createRange();
            range.setStartBefore(symbolElem);
            range.setEndAfter(centElem);

            return new PriceElement(
                range.getBoundingClientRect().top,
                range.getBoundingClientRect().left,
                range.getBoundingClientRect().width,
                range.getBoundingClientRect().height,
                convertedString
            );
        }
    }
}