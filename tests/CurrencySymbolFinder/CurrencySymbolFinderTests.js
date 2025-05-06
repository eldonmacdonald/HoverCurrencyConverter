// Should return 2
async function startLookingForSymbolElems_observeCharacterDataMutationTest() {
    let time = CurrencySymbolFinder.gracePeriodForMutations;

    window.currencySymbolFinder = new CurrencySymbolFinder("$", "CAD");
    window.currencySymbolFinder.startLookingForSymbolElems();
    // Wait until first call in startLookingForSymbolElems() has expired
    await new Promise(resolve => setTimeout(resolve, time));

    window.findSymbolElemsAfterMutationCallCount = 0;

    // Patch the findSymbolElemsAfterMutation method to ensure observation is
    // happening correctly
    const original = window.currencySymbolFinder.findSymbolElemsAfterMutation;
    window.currencySymbolFinder.findSymbolElemsAfterMutation = function(...args) {
        window.findSymbolElemsAfterMutationCallCount++;
        return original.apply(this, args);
    };

    // Mutate character data
    let mutationElem = document.getElementById("mutate-character-data");
    mutationElem.innerText = "OOGA BOOGA 123";

    // Wait for the observer and debounce to fire
    await new Promise(resolve => setTimeout(resolve, 25));

    mutationElem.innerText = "BIG HITS 456";
    await new Promise(resolve => setTimeout(resolve, 25));

    return window.findSymbolElemsAfterMutationCallCount;
}

// Should return 1
async function startLookingForSymbolElems_observeNewElementMutationTest() {
    let time = CurrencySymbolFinder.gracePeriodForMutations;

    window.currencySymbolFinder = new CurrencySymbolFinder("$", "CAD");
    window.currencySymbolFinder.startLookingForSymbolElems();
    // Wait until first call in startLookingForSymbolElems() has expired
    await new Promise(resolve => setTimeout(resolve, time));

    window.findSymbolElemsAfterMutationCallCount = 0;

    // Patch the findSymbolElemsAfterMutation method to count how many times
    // it has been called
    const original = window.currencySymbolFinder.findSymbolElemsAfterMutation;
    window.currencySymbolFinder.findSymbolElemsAfterMutation = function(...args) {
        window.findSymbolElemsAfterMutationCallCount++;
        return original.apply(this, args);
    };

    // Create element to add to DOM
    let newElem = document.createElement("p");
    newElem.innerText = "This is a new element!";
    document.body.appendChild(newElem);

    // Wait for the observer and debounce to fire
    await new Promise(resolve => setTimeout(resolve, 25));

    return window.findSymbolElemsAfterMutationCallCount;
}

// Should return 1
async function findSymbolElemsAfterMutation_gracePreiodForSymbolElemResultsUpdateTest() {
    let time = CurrencySymbolFinder.gracePeriodForMutations;

    window.currencySymbolFinder = new CurrencySymbolFinder("$", "CAD");
    window.currencySymbolFinder.startLookingForSymbolElems();
    //Wait for findSymbolElemsAfterMutation to run in the constructor
    await new Promise(resolve => setTimeout(resolve, time));

    window.updateSymbolElemResultsCallCount = 0;

    // Patch the updateSymbolElemResults method to count how many times
    // it has been called
    const original = window.currencySymbolFinder.updateSymbolElemResults;
    window.currencySymbolFinder.updateSymbolElemResults = function(...args) {
        window.updateSymbolElemResultsCallCount++;
        return original.apply(this, args);
    };

    window.currencySymbolFinder.findSymbolElemsAfterMutation();
    // Wait for 3/4 of the grace time
    await new Promise(resolve => setTimeout(resolve, time * 0.75));

    window.currencySymbolFinder.findSymbolElemsAfterMutation();
    // Let it run completely
    await new Promise(resolve => setTimeout(resolve, time));

    return window.updateSymbolElemResultsCallCount;
}

//should return 5, or same as processElems.length
async function filterSymbolElemResults_resultsAreFilteredTest() {
    // Get all $ elements on page
    let ignoredElems = document.getElementsByClassName("should-be-ignored-$");
    let processElems = document.getElementsByClassName("should-be-processed-$");

    // Combine the ignored and processed elements
    let ignoredElemsArray = Array.from(ignoredElems);
    let processElemsArray = Array.from(processElems);

    let testElemsArray = ignoredElemsArray.concat(processElemsArray);

    let filteredElems = CurrencySymbolFinder
        .filterSymbolElemResults(testElemsArray);
    
    return filteredElems.length;
}

// Should throw a TypeError
async function filterSymbolElemResults_nonElementArrayThrowsErrorTest() {
    let nonElementArray = [1, 2, 3, 4];
    let filteredNonElems = CurrencySymbolFinder
        .filterSymbolElemResults(nonElementArray);
    
    return filteredNonElems.length;
}

// Should return 5, or the number of elements on the page that
// contain the $ symbol
function updateSymbolElemResults_returnsDollarElemsTest() {
    let currencySymbolFinder = new CurrencySymbolFinder("$");
    currencySymbolFinder.updateSymbolElemResults();

    return currencySymbolFinder.symbolElemResults.getValue().length;
}

// Should return 1, or the number of elements on the page that
// contain the £ symbol
function updateSymbolElemResults_returnsPoundElemsTest() {
    let currencySymbolFinder = new CurrencySymbolFinder("£");
    currencySymbolFinder.updateSymbolElemResults();

    return currencySymbolFinder.symbolElemResults.getValue().length;
}

// Should return 1, or the number of elements on the page that
// contain the € symbol
function updateSymbolElemResults_returnsEuroElemsTest() {
    let currencySymbolFinder = new CurrencySymbolFinder("€");
    currencySymbolFinder.updateSymbolElemResults();

    return currencySymbolFinder.symbolElemResults.getValue().length;
}

// Should return 1, or the number of elements on the page that
// contain the ₹ symbol
function updateSymbolElemResults_returnsRupeeElemsTest() {
    let currencySymbolFinder = new CurrencySymbolFinder("₹");
    currencySymbolFinder.updateSymbolElemResults();

    return currencySymbolFinder.symbolElemResults.getValue().length;
}