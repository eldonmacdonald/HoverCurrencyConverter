// Should return the body's bounding client rect
function getBoundingClientRect_differentElementsTest() {
    let startElem = document.querySelector("#start");
    let endElem = document.querySelector("#end");

    let range = document.createRange();
    range.setStart(startElem, 0);
    range.setEnd(endElem, 0);

    let rangedPriceElement = new RangedPriceElement(
        "$0.00", 
        range.commonAncestorContainer, 
        range
    )

    return [
        rangedPriceElement.getBoundingClientRect().width, 
        document.body.getBoundingClientRect().width
    ]
}

// Should return top 100 and left 100
function getBoundingClientRect_sameElemTest() {
    let elem = document.querySelector("#all-one");

    let range = document.createRange();
    range.setStart(elem.firstChild, 0);
    range.setEnd(elem.firstChild, 29);

    let rangedPriceElement = new RangedPriceElement(
        "$0.00", 
        range.commonAncestorContainer.parentNode, 
        range
    )

    return [
        rangedPriceElement.getBoundingClientRect().top, 
        rangedPriceElement.getBoundingClientRect().left
    ]
}