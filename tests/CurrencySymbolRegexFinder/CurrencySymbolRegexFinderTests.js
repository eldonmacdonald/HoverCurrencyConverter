
// Should return 2 arrays that are the same - jest does not support the js
// Element class so mapping each element to its parent's text content is
// necessary for proper identification
function updateSymbolElemResults_bodyReturnsCorrectSymbolElementsTest() {
    let currSymRegFinder = new CurrencySymbolRegexFinder(/CA\$/, "$");
    let knownSymbolElements = document.getElementsByClassName("symbol-elem");

    currSymRegFinder.updateSymbolElemResults();

    return [
        currSymRegFinder.symbolElemResults.getValue().map(
            element => element.parentNode.textContent
        ),
        Array.from(knownSymbolElements).map(
            element => element.parentNode.textContent
        )
    ];
}

// Should return the element with the id 'single-element-contains-index-0-37'
function getElementThatContainsBodyTextIndex_singleElementContainsIndex0To37Test() {
    let currSymRegFinder = new CurrencySymbolRegexFinder(/CA\$/, "$");

    return [
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            0
        ).id,
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            34
        ).id
    ];
}

// Should return the element with the id 'contains-index-61-80'
function getElementThatContainsBodyTextIndex_multipleElementsTest1() {
    let currSymRegFinder = new CurrencySymbolRegexFinder(/CA\$/, "$");

    return [
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            61
        ).id,
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            80
        ).id
    ];
}

// Should return the element with the id 'contains-index-184-203'
function getElementThatContainsBodyTextIndex_multipleElementsTest2() {
    let currSymRegFinder = new CurrencySymbolRegexFinder(/CA\$/, "$");

    return [
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            185
        ).id,
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            204
        ).id
    ];
}

// Should return the element with the id 'contains-index-257-266'
function getElementThatContainsBodyTextIndex_multipleElementsTextNodeTest() {
    let currSymRegFinder = new CurrencySymbolRegexFinder(/CA\$/, "$");

    return [
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            257
        ).id,
        currSymRegFinder.getElementThatContainsBodyTextIndex(
            document.body,
            266
        ).id
    ];
}

