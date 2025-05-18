class RegexPriceElementFinder {

    constructor(currencyRegex, converter) {
        this.currencyRegex = currencyRegex;
        this.converter = converter;

        this.priceElements = [];
        this.priceRegex = /\s*([\d,]+\s*[\d,]*)+(\.[\d]+)?\s*/;
    }

    // need to split into smaller methods, then work out index issues
    getPriceElementsTextAndRange(startingElement) {
        let textsAndRanges = [];

        const treeWalker = document.createTreeWalker(
            startingElement,
            NodeFilter.SHOW_TEXT,
            null
        );
        
        let fullPriceRegex = new RegExp(this.currencyRegex.source + 
            this.priceRegex.source, "g");

        // Regex for checking if a full price has been found - must have one
        // 'termination' character after the fullPriceRegex match to ensure that 
        // the regex match is greedy
        let terminatedFullPriceRegex = new RegExp(fullPriceRegex.source + 
            "(?=[^\\.\\d\\,\\s])", 'g');

        let node;
        let nodesToConcat = [];
        while((node = treeWalker.nextNode())) {

            // Don't process nodes that are clearly not meant to be prices
            if(node.textContent.length > 1000) {
                continue;
            }

            nodesToConcat.push(node);
            let concatText = "";
            nodesToConcat.forEach(
                node => concatText += node.textContent
            );

            terminatedFullPriceRegex.lastIndex = 0;
            let match;
            let endIndex = 0;
            while((match = terminatedFullPriceRegex.exec(concatText))) {

                fullPriceRegex.lastIndex = terminatedFullPriceRegex.lastIndex
                    - match[0].length;
                let fullRegexMatch = fullPriceRegex.exec(concatText);
                let fullRegexString = fullRegexMatch[0];
                endIndex = fullRegexMatch.index + fullRegexString.length;

                const startIndex = fullRegexMatch.index;
                let fullRegexRange = this.getRegexRangeInNodeArray(
                    fullPriceRegex,
                    nodesToConcat,
                    startIndex,
                    endIndex
                )

                let textAndRange = new Object();
                textAndRange.text = fullRegexString;
                textAndRange.range = fullRegexRange;

                textsAndRanges.push(textAndRange);
            }

            concatText = ""
            while(concatText.length < endIndex) {
                concatText += nodesToConcat.shift().textContent;
            }

            // Have a maximum of 10 nodes being processed at a time for
            // performance
            while(nodesToConcat.length > 10) {
                nodesToConcat.shift();
            }
        }

        return textsAndRanges;
    }

    getNodesWithTextInRange(startIndex, endIndex, nodes) {
        if(!nodes.every(
            node => !node.hasChildNodes()
        )) {
            throw new Error("nodes array must contain only nodes with " +
                "no child nodes");
        }

        let nodesCopy = Array.from(nodes);

        let rightChoppedNodes = [];
        let concatText = ""
        while(endIndex > concatText.length) {
            concatText = "";
            rightChoppedNodes.push(nodesCopy.shift());
            rightChoppedNodes.forEach(
                node => concatText = concatText + node.textContent
            );
        }

        let overflow = concatText.length - endIndex;

        rightChoppedNodes.reverse();

        let leftChoppedNodes = [];
        concatText = ""
        while((endIndex + overflow - startIndex) > concatText.length) {
            concatText = ""
            leftChoppedNodes.push(rightChoppedNodes.shift());
            leftChoppedNodes.forEach(
                node => concatText = node.textContent + concatText
            );
        }

        leftChoppedNodes.reverse()

        return leftChoppedNodes;
    }

    getRegexRangeInNodeArray(regex, nodeArray, startIndex, endIndex) {
        // Create a copy of the regex so that none of the original regex's
        // values are mutated in function logic
        let tmpRegex = new RegExp(regex.source, 'g');

        let concatText = ""
        nodeArray.forEach(
            node => concatText += node.textContent
        )
        tmpRegex.lastIndex = startIndex;
        let matchInText = tmpRegex.exec(concatText);
        if(!matchInText || matchInText.index >= endIndex) {
            throw new Error("no regex matches found in range given");
        }


        let tmpNodeArray = this.getNodesWithTextInRange(matchInText.index, 
            matchInText.index + matchInText[0].length, nodeArray);

        let range = document.createRange();

        const startNode = tmpNodeArray[0];
        const endNode = tmpNodeArray[tmpNodeArray.length - 1]

        let tmpNodeArrayText = ""
        tmpNodeArray.forEach(node => tmpNodeArrayText += node.textContent);

        tmpRegex.lastIndex = 0;
        let regexMatches = tmpRegex.exec(tmpNodeArrayText);
        let startOffset = regexMatches.index;

        let endOffsetDistanceFromEnd = tmpNodeArrayText.length - 
            (regexMatches.index + regexMatches[0].length)
        let endOffset = endNode.textContent.length - endOffsetDistanceFromEnd;

        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        return range;
    }

}