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

        // Array to store price elements
        this.priceElements = [];

        // Regular expression to match numeric price patterns
        this.priceRegex = /\s*([\d,]+\s*[\d,]*)+(\.[\d]+)?\s*/;
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
            "(?=[^\\.\\d\\,\\s])", 'g');

        let node;
        let nodesToConcat = [];
        while ((node = treeWalker.nextNode())) {

            // Skip nodes with excessively long text content
            if (node.textContent.length > 1000) {
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
            concatText = "";
            while (concatText.length < endIndex) {
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
        let tmpNodeArray = this.getNodesWithTextInRange(matchInText.index, 
            matchInText.index + matchInText[0].length, nodeArray);

        let range = document.createRange();

        const startNode = tmpNodeArray[0];
        const endNode = tmpNodeArray[tmpNodeArray.length - 1];

        let tmpNodeArrayText = "";
        tmpNodeArray.forEach(node => tmpNodeArrayText += node.textContent);

        tmpRegex.lastIndex = 0;
        let regexMatches = tmpRegex.exec(tmpNodeArrayText);
        let startOffset = regexMatches.index;

        let endOffsetDistanceFromEnd = tmpNodeArrayText.length - 
            (regexMatches.index + regexMatches[0].length);
        let endOffset = endNode.textContent.length - endOffsetDistanceFromEnd;

        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        return range;
    }
}