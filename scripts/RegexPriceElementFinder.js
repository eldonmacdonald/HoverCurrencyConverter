/**
 * This class identifies and extracts price elements from the DOM based on a 
 * combination of a currency regex and a price regex. It provides methods to 
 * locate text and ranges of price elements within a given starting element.
 * 
 * Usage:
 * 1. Create an instance with a currency regex and a converter.
 * 2. Use `getPriceElementsTextAndRange` to extract price elements and their ranges.
 * 
 * Key Methods:
 * - `getPriceElementsTextAndRange`: Extracts price elements and their text ranges.
 * - `getNodesWithTextInRange`: Retrieves nodes containing text within a specified range.
 * - `getRegexRangeInNodeArray`: Finds the range of a regex match within a node array.
 * 
 * @param {RegExp} currencyRegex - Regular expression to match currency symbols.
 * @param {Object} converter - An object responsible for currency conversion.
 * 
 * @author Eldon MacDonald
 */
class RegexPriceElementFinder {

    /**
     * Constructs a new instance of `RegexPriceElementFinder`.
     * 
     * @param {RegExp} currencyRegex - Regular expression to match currency symbols.
     * @param {CurrencyConverter} converter - An object responsible for currency conversion.
     */
    constructor(currencyRegex, converter) {
        this.currencyRegex = currencyRegex;
        this.converter = converter;

        this.priceElementBuilder = new PriceElementBuilder(converter);

        // Array to store price elements
        this.priceElements = [];

        // Regular expression to match numeric price patterns
        this.priceRegex = /\s*[\d,]+(\.[\d]+)?/;
    }

    updatePriceElements() {
        this.priceElements = []
        let textsAndRanges = this.getPriceElementsTextAndRange(document.body);

        textsAndRanges.forEach(textAndRange => {
            let newElem = this.priceElementBuilder.buildRangedPriceElement(
                textAndRange.text,
                textAndRange.range
            );
            this.priceElements.push(newElem);
        })
    }

    /**
     * Extracts price elements and their text ranges from the DOM starting at 
     * the specified element.
     * 
     * @param {Element} startingElement - The DOM element to start the search from.
     * @returns {Array<Object>} An array of objects containing text and range for each price element.
     */
    getPriceElementsTextAndRange(startingElement) {
        let textsAndRanges = [];

        // Create a TreeWalker to traverse text nodes
        const treeWalker = document.createTreeWalker(
            startingElement,
            NodeFilter.SHOW_TEXT,
            null
        );

        // Combine currency and price regexes
        let fullPriceRegex = new RegExp(this.currencyRegex.source + 
            this.priceRegex.source, "g");

        // Add a termination character to ensure greedy matching
        let terminatedFullPriceRegex = new RegExp(fullPriceRegex.source + 
            "[\\s\\.\\,\\d]*(?=[^\\.\\d\\,\\s])", 'g');

        let node;
        let nodesToConcat = [];
        let nextStartOffset = 0;
        while ((node = treeWalker.nextNode())) {

            // Skip nodes with excessively long text content or that only
            // contain whitespace
            if (node.textContent.length > 1000 ||
                node.textContent.replace(/\s+/g, '') == ''
            ) {
                continue;
            }

            nodesToConcat.push(node);
            let concatText = "";
            nodesToConcat.forEach(
                node => concatText += node.textContent
            );

            terminatedFullPriceRegex.lastIndex = nextStartOffset;
            let match;
            let endIndex = 0;
            while ((match = terminatedFullPriceRegex.exec(concatText))) {

                // Find the full match for the price regex
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
                );

                // Store the text and range of the match
                let textAndRange = new Object();
                textAndRange.text = fullRegexString;
                textAndRange.range = fullRegexRange;

                textsAndRanges.push(textAndRange);
            }

            // Remove processed nodes from the concatenation buffer
            nextStartOffset = 0;
            concatText = "";
            while (concatText.length < endIndex) {
                // Don't remove next node if it contains the end index
                if(nodesToConcat.length > 0) {
                    let nextNodeLength = nodesToConcat[0].textContent.length
                    if(concatText.length + nextNodeLength > endIndex) {
                        nextStartOffset = concatText.length;
                        break;
                    }
                }
                concatText += nodesToConcat.shift().textContent;
            }

            // Limit the number of nodes being processed for performance
            while (nodesToConcat.length > 10) {
                nodesToConcat.shift();
            }
        }

        return textsAndRanges;
    }

    /**
     * Retrieves nodes containing text within the specified range.
     * 
     * @param {number} startIndex - The starting index of the range.
     * @param {number} endIndex - The ending index of the range.
     * @param {Array<Node>} nodes - Array of text nodes to search within.
     * @returns {Array<Node>} An array of nodes containing text within the range.
     * 
     * @throws {Error} If the nodes array contains elements with child nodes.
     */
    getNodesWithTextInRange(startIndex, endIndex, nodes) {
        if (!nodes.every(
            node => !node.hasChildNodes()
        )) {
            throw new Error("nodes array must contain only nodes with " +
                "no child nodes");
        }

        let nodesCopy = Array.from(nodes);

        let rightChoppedNodes = [];
        let concatText = "";
        while (endIndex > concatText.length) {
            concatText = "";
            rightChoppedNodes.push(nodesCopy.shift());
            rightChoppedNodes.forEach(
                node => concatText = concatText + node.textContent
            );
        }

        let overflow = concatText.length - endIndex;

        rightChoppedNodes.reverse();

        let leftChoppedNodes = [];
        concatText = "";
        while ((endIndex + overflow - startIndex) > concatText.length) {
            concatText = "";
            leftChoppedNodes.push(rightChoppedNodes.shift());
            leftChoppedNodes.forEach(
                node => concatText = node.textContent + concatText
            );
        }

        leftChoppedNodes.reverse();

        return leftChoppedNodes;
    }

    /**
     * Finds the range of a regex match within a node array.
     * 
     * @param {RegExp} regex - The regular expression to match.
     * @param {Array<Node>} nodeArray - Array of text nodes to search within.
     * @param {number} startIndex - The starting index of the match.
     * @param {number} endIndex - The ending index of the match.
     * @returns {Range} A DOM Range object representing the match.
     * 
     * @throws {Error} If no regex matches are found in the specified range.
     */
    getRegexRangeInNodeArray(regex, nodeArray, startIndex, endIndex) {
        // Create a copy of the regex to avoid mutating the original
        let tmpRegex = new RegExp(regex.source, 'g');

        let concatText = "";
        nodeArray.forEach(
            node => concatText += node.textContent
        );
        tmpRegex.lastIndex = startIndex;
        let matchInText = tmpRegex.exec(concatText);
        if (!matchInText || matchInText.index >= endIndex) {
            throw new Error("no regex matches found in range given");
        }

        // Get nodes containing the regex match
        const reducedNodeArray = this.getNodesWithTextInRange(matchInText.index, 
            matchInText.index + matchInText[0].length, nodeArray);
        let reducedNodeArrayText = ""
        reducedNodeArray.forEach(node => reducedNodeArrayText += node.textContent);

        // Get the index of the element containing the regex in the full
        // text
        const reducedNodeArrayIndexInOriginal = 
            this.getStartOfNodeArrayTextInOtherNodeArrayText(nodeArray, 
                reducedNodeArray, startIndex, endIndex);
        const matchIndexInReducedNodeArray = 
            matchInText.index - reducedNodeArrayIndexInOriginal;
        if(matchIndexInReducedNodeArray < 0) {
            throw new Error("Match index is not within reduced node array")
        }

        let range = document.createRange();

        const startNode = reducedNodeArray[0];
        const endNode = reducedNodeArray[reducedNodeArray.length - 1];
        
        let startOffset = matchIndexInReducedNodeArray;

        let endOffsetDistanceFromEnd = reducedNodeArrayText.length - 
            (matchIndexInReducedNodeArray + matchInText[0].length);
        let endOffset = endNode.textContent.length - endOffsetDistanceFromEnd;

        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        return range;
    }

    getStartOfNodeArrayTextInOtherNodeArrayText(outerArr, innerArr, startIndex, endIndex) {
        // Get text content of outer array
        let outerArrText = ""
        outerArr.forEach(node => outerArrText += node.textContent);

        // get text content of inner array and create a regex from it
        let innerArrText = "";
        innerArr.forEach(node => innerArrText += node.textContent);
        let innerArrTextRegex = new RegExp(this.stringToRegex(innerArrText), 'g');

        // Get the text match of the inner array text in the outer array text,
        // ensuring that that match is within the range specified by
        // startIndex and endIndex
        let innerArrTextMatchInOuterArrText = null
        let indexOfInnerArrTextMatchInOuterArrText = 0
        let endIndexOfInnerArrTextMatchInOuterArrText = 0
        do {
            innerArrTextMatchInOuterArrText = 
                innerArrTextRegex.exec(outerArrText);
            indexOfInnerArrTextMatchInOuterArrText = 
                innerArrTextMatchInOuterArrText.index;
            endIndexOfInnerArrTextMatchInOuterArrText = 
                indexOfInnerArrTextMatchInOuterArrText + 
                innerArrTextMatchInOuterArrText[0].length;
        } while (
            !this.isRangeInOtherRange(
                startIndex, 
                endIndex,
                indexOfInnerArrTextMatchInOuterArrText,
                endIndexOfInnerArrTextMatchInOuterArrText
            )
        )
        return indexOfInnerArrTextMatchInOuterArrText;
    }

    isRangeInOtherRange(outerRangeStart, outerRangeEnd, 
        innerRangeStart, innerRangeEnd) {
        
        let withinRange = false;
        if(innerRangeStart < outerRangeEnd) {
            if(innerRangeEnd > outerRangeStart) {
                withinRange = true;
            }
        }
        return withinRange;
    }

    stringToRegex(string) {
        return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}