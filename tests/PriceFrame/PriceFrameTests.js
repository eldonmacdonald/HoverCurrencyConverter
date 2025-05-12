

// Should have position fixed, no pointer events, width and height equal to
// the window width and height, top and left 0, zIndex 9999
function createFrame_correctFrameCreatedTest() {
    let frame = PriceFrame.createFrame();

    return [frame.style.position, frame.style.pointerEvents, frame.style.width, 
        frame.style.height, frame.style.top, frame.style.left, 
        frame.style.zIndex, frame.style.colorScheme];
}

// RESIZE DEBUGGING CAN BE DONE THROUGH DEVTOOLS, AUTOMATED TESTS FOR RESIZING
// ARE IN PriceFrame.test.js

// Should return the HTML contents of the page below.
async function initializeFrame_correctFrameContentUrlTest(extensionId) {
    let frame = PriceFrame.createFrame();

    frame = await PriceFrame.initializeFrame(
        `chrome-extension://${extensionId}/tests/PriceFrame/ForInitializeFrameTest.html`,
        frame
    );

    return frame.srcdoc;
}

// Should return the HTML contents of the page below.
async function initializeFrame_errorOnBadURL(extensionId) {
    let frame = PriceFrame.createFrame();

    frame = await PriceFrame.initializeFrame(
        `chrome-extension://${extensionId}/tests/PriceFrame/DoesNotExist.html`,
        frame
    );

    return frame;
}

// Should return the text of the div in the frame html document, which is
// 'This is the correct div!'
async function getPriceDiv_successWhenPriceDivExistsInFrame(extensionId) {
    let frame = PriceFrame.createFrame();

    frame = await PriceFrame.initializeFrame(
        `chrome-extension://${extensionId}/tests/PriceFrame/ForGetPriceDivTest.html`,
        frame
    );

    return PriceFrame.getPriceDiv(frame, "price-div").innerHTML;
}

// Should throw an error with the message 'did not match any elements in the
// frame document'
async function getPriceDiv_throwsErrorOnDivIdNotFound(extensionId) {
    let frame = PriceFrame.createFrame();

    frame = await PriceFrame.initializeFrame(
        `chrome-extension://${extensionId}/tests/PriceFrame/ForGetPriceDivTest.html`,
        frame
    );

    return PriceFrame.getPriceDiv(frame, "does-not-exist").innerHTML;
}

// Should throw an error with the message 'given iframe does not have any 
// content'
async function getPriceDiv_throwsErrorOnFrameWithNoContent(extensionId) {
    let frame = document.createElement("iframe");

    return PriceFrame.getPriceDiv(frame, "price-div").innerHTML;
}

// Should return a defined PriceFrame with no errors
async function build_frameBuildsOnCorrectArguments(extensionId) {
    return PriceFrame.build(
        `chrome-extension://${extensionId}/tests/PriceFrame/ForGetPriceDivTest.html`,
        "price-div"
    );
}

