function constructor_throwTypeErrorOnBadBoundingElemTypeTest() {
    let priceElement = new PriceElement("$0", 1);

    return priceElement();
}

// Should return false
function isVisible_parent2LevelsVisibilityHiddenTest() {

    let parent = document.getElementById("parent-2-levels-hidden");
    let elem = parent.querySelector(".elem");

    let priceElement = new PriceElement("$0", elem);

    return priceElement.isVisible();
}

// Should return false
function isVisible_parent2LevelsOpacity0Test() {

    let parent = document.getElementById("parent-2-levels-opacity-0");
    let elem = parent.querySelector(".elem");

    let priceElement = new PriceElement("$0", elem);

    return priceElement.isVisible();
}

// Should return false
function isVisible_parent2LevelsClipTest() {

    let parent = document.getElementById("parent-2-levels-clip");
    let elem = parent.querySelector(".elem");

    let priceElement = new PriceElement("$0", elem);

    return priceElement.isVisible();
}

// Should return true
function isVisible_elementVisibleTest() {

    let elem = document.getElementById("visible");

    let priceElement = new PriceElement("$0", elem);

    return priceElement.isVisible();
}

// Should return equal values
function getBoundingClientRect_getCorrectBoundingRect() {
    let elem = document.getElementById("visible");
    let priceElement = new PriceElement("$0", elem);

    let originalRect = elem.getBoundingClientRect();
    let returnedRect = priceElement.getBoundingClientRect();

    return [originalRect, returnedRect];
}