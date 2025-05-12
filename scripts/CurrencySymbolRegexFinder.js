class CurrencySymbolRegexFinder extends CurrencySymbolFinder {

    constructor(currencyRegex, currencySymbol) {
        super(currencySymbol);
        // Ensure 'g' flag is present
        let flags = currencyRegex.flags.includes('g') ? currencyRegex.flags : currencyRegex.flags + 'g';
        this.currencyRegex = new RegExp(currencyRegex.source, flags);

        this.symbolRegex = new RegExp(currencySymbol, 'g');
    }

    updateSymbolElemResults() {
        let documentBodyText = document.body.textContent;
        documentBodyText = documentBodyText.replace(/\s+/g, '');

        let matchSymbolIndices = [];
        let match;
        while ((match = this.currencyRegex.exec(documentBodyText)) !== null) {
            let symbolMatch = this.symbolRegex.exec(match[0]);
            if (symbolMatch) {
                let matchSymbolIndex = match.index + symbolMatch.index;
                matchSymbolIndices.push(matchSymbolIndex);
            } else {
                throw new Error("Could not find currency symbol in currency regex");
            }
        }

        let tmpSymbolElemResults = [];
        matchSymbolIndices.forEach(matchSymbolIndex => {
            let matchElem = this.getElementThatContainsBodyTextIndex(
                document.body,
                matchSymbolIndex
            );
            tmpSymbolElemResults.push(matchElem);
        })

        this.symbolElemResults.setValue(tmpSymbolElemResults);
    }

    getElementThatContainsBodyTextIndex(startingElem, indexFromStartingElem) {
        const startingElemEffectiveText = 
            startingElem.textContent.replace(/\s+/g, '');
        const startingElemEffectiveTextLength = 
            startingElemEffectiveText.length;

        if(!startingElem.hasChildNodes()) {

            if(indexFromStartingElem < startingElemEffectiveTextLength) {
                if(startingElem.nodeType == Node.TEXT_NODE) {
                    return startingElem.parentNode;
                } else if(startingElem.nodeType == Node.ELEMENT_NODE) {
                    return startingElem;
                } else {
                    throw new Error("unsupported node type found");
                }
            } else if(startingElem.nextSibling) {
                return this.getElementThatContainsBodyTextIndex(
                    startingElem.nextSibling,
                    indexFromStartingElem -
                        startingElemEffectiveTextLength
                );
            } else if(startingElem.parentNode.nextSibling) {
                return this.getElementThatContainsBodyTextIndex(
                    startingElem.parentNode.nextSibling,
                    indexFromStartingElem -
                        startingElemEffectiveTextLength
                );
            } else {
                throw new Error("index greater than body text length");
            }
        } else {
            if(startingElem.firstChild) {
                return this.getElementThatContainsBodyTextIndex(
                    startingElem.firstChild,
                    indexFromStartingElem
                );
            } else {
                throw new Error("Did not find child node where there should be")
            }
        }
    }
}