let t_rates_gbp = {
    "USD": 1.3,
    "GBP": 1.0,
    "INR": 130,
}

// Should return all of the child nodes of the element, since the total text
// content of all its children are from indexes 0 to 9
function getNodesWithTextInRange_allSameLevelDecimalTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector("#parent-element-all-same-level-decimal-separated-commas");

    //Get array of child nodes, without block text white space
    let childNodes = Array.from(parentElem.childNodes).filter(
        node => node.nodeType != Node.TEXT_NODE
    ).map(
        node => node.firstChild
    );

    return regexPriceElementFinder.getNodesWithTextInRange(0, 10, childNodes).map(
        elem => elem.textContent
    );
}

// Should return only the nodes with the text content from index 49 to index 58
function getNodesWithTextInRange_allSameLevelDecimalNoiseTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector("#parent-element-all-same-level-decimal-separated-commas-noise");

    //Get array of child nodes, without block text white space
    let childNodes = Array.from(parentElem.childNodes).filter(
        node => node.nodeType != Node.TEXT_NODE
    ).map(
        node => node.firstChild
    );

    return regexPriceElementFinder.getNodesWithTextInRange(49, 59, childNodes).map(
        elem => elem.textContent
    );
}

// Should throw an error because some of the nodes have children
function getNodesWithTextInRange_errorOnNodesWithChildren() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector("#parent-element-different-levels-decimal-separated");

    //Get array of child nodes, without block text white space
    let childNodes = Array.from(parentElem.childNodes).filter(
        node => node.nodeType != Node.TEXT_NODE
    );

    return regexPriceElementFinder.getNodesWithTextInRange(0, 10, childNodes).map(
        elem => elem.textContent
    );
}

// Should return an object with the same start and end node text (because the 
// regex match is in the same node), start offset of 5 and end offset of 11
function getRegexRangeInNodeArray_twoElementsWithNoiseTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector("#two-elements-with-decimal-noise");

    let textNode = parentElem.firstChild;

    let retRange = regexPriceElementFinder.getRegexRangeInNodeArray(/\$14.99/, [textNode], 5, 11);

    let retObject = {
        startNodeText: retRange.startContainer.textContent,
        startOffset: retRange.startOffset,
        endNodeText: retRange.endContainer.textContent,
        endOffset: retRange.endOffset,
    }

    return retObject
}

// Should return a node with '$' as text content for the starting node, a node
// with '.99' as the text content for the ending node and offset 0 and 3
function getRegexRangeInNodeArray_allSameLevelDecimalNoiseTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector("#parent-element-all-same-level-decimal-separated-commas-noise");

    //Get array of child nodes, without block text white space
    let childNodes = Array.from(parentElem.childNodes).filter(
        node => node.nodeType != Node.TEXT_NODE
    ).map(
        node => node.firstChild
    );

    let retRange = regexPriceElementFinder.getRegexRangeInNodeArray(/\$14,000.99/, childNodes, 40, 59);

    let retObject = {
        startNodeText: retRange.startContainer.textContent,
        startOffset: retRange.startOffset,
        endNodeText: retRange.endContainer.textContent,
        endOffset: retRange.endOffset,
    }

    return retObject;
}

//Should reteurn objects with text $14.99 and $200.00
function getPriceElementsTextAndRange_twoElementsWithDecimalNoiseTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector('#two-elements-with-decimal-noise');
    
    return regexPriceElementFinder.getPriceElementsTextAndRange(parentElem);
}

// Should return two objects with texts $20.00 and $20.00
function getPriceElementsTextAndRange_twoElementsSamePriceTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector('#two-elements-same-price');
    
    return regexPriceElementFinder.getPriceElementsTextAndRange(parentElem);
}

// Should return object with text $1400
function getPriceElementsTextAndRange_allSameLevelNoDecimalTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    
    let regexPriceElementFinder = new RegexPriceElementFinder(/\$/, 
        currencyConverter);

    let parentElem = document.querySelector('#parent-element-all-same-level-no-decimal');
    
    return regexPriceElementFinder.getPriceElementsTextAndRange(parentElem);
}