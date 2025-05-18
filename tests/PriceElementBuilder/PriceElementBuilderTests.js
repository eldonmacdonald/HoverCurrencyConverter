let t_rates_gbp = {
    "USD": 1.3,
    "GBP": 1.0,
    "INR": 130,
}

function constructor_errorOnBadConverterTest() {
    let converter = "This is a string!";
    let priceElementBuilder = new PriceElementBuilder(converter);

    return priceElementBuilder;
}

// Should return '$', or the first character of the element's inner text
function findIndexOfElementTextInParentTextContent_indexAfterDistractionsTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    // Get the element to start from from the parent that holds the test ID
    let parent = document.getElementById("parent-element-all-same-level-decimal-separated-commas-noise");
    let elem = parent.querySelector(".starting-elem");

    // Get the index of the element start in the parent text, and slice at that
    // point
    let index = priceElementBuilder.findIndexOfElementTextInParentTextContent(elem);
    let slicedContents = parent.textContent.slice(index);
    
    // Make sure the first char of the sliced string is the same as the first
    // char of the element inner text
    return slicedContents.charAt(0);
}

// Should return false
function isPriceContainedInSingleElement_falseOnSymbolOnlyTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-all-same-level-decimal-separated");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.isPriceContainedInSingleElement(elem);
}

// Should return true
function isPriceContainedInSingleElement_trueWhenAmountInElemTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("text-node-dollar-single-element-decimal");

    return priceElementBuilder.isPriceContainedInSingleElement(elem);
}

// Should return 14.99
function getPriceFromElementText_textNodeSingleElementTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("text-node-dollar-single-element-decimal");

    return priceElementBuilder.getPriceFromElementText(elem);
}

// Should return 14.99
function getPriceFromElementText_singleElementWithDecimalTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("single-element-price-with-decimal");

    return priceElementBuilder.getPriceFromElementText(elem);
}

// Should return 1400
function getPriceFromElementText_singleElementNoDecimalTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("single-element-price-no-decimal");

    return priceElementBuilder.getPriceFromElementText(elem);
}

// Should return 1400
function getPriceFromElementText_singleElementNoDecimalCommaTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("single-element-no-decimal-comma");

    return priceElementBuilder.getPriceFromElementText(elem);
}

// Should return 14.99
function getPriceFromElementText_singleElementWithDecimalNoiseTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("single-element-with-decimal-noise");

    return priceElementBuilder.getPriceFromElementText(elem);
}

// Should return 1400
function getPriceFromElementText_singleElementNoDecimalNoiseTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("single-element-no-decimal-noise");

    return priceElementBuilder.getPriceFromElementText(elem);
}

// Should throw an error
function getPriceFromElementText_throwErrorOnNoPriceMatchesTest() {
    let currencyConverter = new CurrencyConverter("GBP", "INR", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("no-price-matches");

    return priceElementBuilder.getPriceFromElementText(elem);
}

// Should create an element with a defined bounding element and a display
// price of 0.12 pounds
function buildPriceElementFromSingleElement_singleElementWithDecimalTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("single-element-price-with-decimal");

    let priceElem = priceElementBuilder.buildPriceElementFromSingleElement(elem);

    return priceElem;
}

// Should return null
function buildPriceElementFromSingleElement_returnNullOnNoPriceTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let elem = document.getElementById("no-price-matches");

    let priceElem = priceElementBuilder.buildPriceElementFromSingleElement(elem);

    return priceElem;
}

// Should return 14.99
function getPriceFromParentText_allSameLevelDecimalSeparatedTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-all-same-level-decimal-separated");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should return 1400.99
function getPriceFromParentText_allSameLevelDecimalSeparatedCommasTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-all-same-level-decimal-separated-commas");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should return 1400.99
function getPriceFromParentText_allSameLevelDecimalSeparatedCommasNoiseTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-all-same-level-decimal-separated-commas-noise");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should return 14.99
function getPriceFromParentText_allSameLevelFullAmountTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-all-same-level-full-amount");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should return 1400
function getPriceFromParentText_allSameLevelNoDecimalTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-all-same-level-no-decimal");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should return 14.99
function getPriceFromParentText_allDifferentLevelsNoDecimalSeparatedTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-different-levels-decimal-separated");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should return 14.99
function getPriceFromParentText_allDifferentLevelsFullAmountTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-different-levels-full-amount");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should throw a TypeError
function getPriceFromParentText_throwErrorOnNoPriceMatchesTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("no-price-matches-parent");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.getPriceFromParentText(elem);
}

// Should return priceElement with displayPrice of 0.12 pounds and a defined
// bounding element
function buildPriceElementThroughParent_createPriceElementTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("parent-element-different-levels-noise");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.buildPriceElementThroughParent(elem);
}

//Should return null
function buildPriceElementThroughParent_nullOnNoPriceTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parent = document.getElementById("no-price-matches-parent");
    let elem = parent.querySelector(".starting-elem");

    return priceElementBuilder.buildPriceElementThroughParent(elem);
}

// Should return array of price elements of size 14 with no NaN display prices 
// and every bounding elem defined
function buildPriceElementsFromCurrencySymbolElementArray_validArrayTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let startElems = document.getElementsByClassName("starting-elem");
    let startElemsArray = Array.from(startElems);

    return priceElementBuilder
        .buildPriceElementsFromCurrencySymbolElementArray(startElemsArray);
}

// Should throw a TypeError
function buildPriceElementsFromCurrencySymbolElementArray_throwErrorOnInvalidArrayTest() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let badArray = [1, 2, 3, 4]

    return priceElementBuilder
        .buildPriceElementsFromCurrencySymbolElementArray(badArray);
}

function buildRangedPriceElement_builtFromCorrectPrice() {
    let currencyConverter = new CurrencyConverter("INR", "GBP", t_rates_gbp, 
        "en-IN");
    let priceElementBuilder = new PriceElementBuilder(currencyConverter);

    let parentContainer = document.querySelector("#parent-element-all-same-level-decimal-separated-commas");

    let range = document.createRange()
    range.setStart(parentContainer, 0);
    range.setEnd(parentContainer, 0);

    return priceElementBuilder.buildRangedPriceElement("$ \n14,\n000", range)
}