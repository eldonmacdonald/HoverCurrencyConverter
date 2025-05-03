function getStartSibling(parentId) {
    return document.getElementById(parentId)
        .querySelector(".start-sibling");
}

// Should return an empty array
function getSiblingsThatMatchRegex_spanIntegerNoMatchesTest() {
    let elem = getStartSibling("span-integer-no-matches");
    let regex = /[\d]/;
    return getSiblingsThatMatchRegex(elem, regex);
}

// Should return array with one element with innerText 14.99
function getSiblingsThatMatchRegex_spanFullAmountTest() {
    let elem = getStartSibling("span-full-amount-14.99");
    let regex = /^\s*[\d]+\.[\d]+\s*$/;
    return getSiblingsThatMatchRegex(elem, regex);
}

//Should return array with one element with innerText 14.99
function getSiblingsThatMatchRegex_divFullAmountTest() {
    let elem = getStartSibling("div-full-amount-14.99");
    let regex = /^\s*[\d]+\.[\d]+\s*$/;
    return getSiblingsThatMatchRegex(elem, regex);
}

//Should return array with one element with innerText 14.99
function getSiblingsThatMatchRegex_spanFullAmountTextNodeTest() {
    let elem = getStartSibling("span-full-amount-14.99-text-node");
    let regex = /^\s*[\d]+\.[\d]+\s*$/;
    return getSiblingsThatMatchRegex(elem, regex);
}

//Should return empty array
function getSiblingsThatMatchRegex_sectionIntegerNoMatchesIntegersParentSiblingsTest() {
    let elem = getStartSibling("section-integer-no-matches-integers-parent-siblings");
    let regex = /[\d]/;
    return getSiblingsThatMatchRegex(elem, regex);
}

//should return an array with 2 elements with innertexts 249 and 99
function getSiblingsThatMatchRegex_sectionIntegersNestedWithNoiseTextNode() {
    let elem = getStartSibling("section-2-integers-249-99-nested-with-noise-text-node");
    let regex = /[\d]/;
    return getSiblingsThatMatchRegex(elem, regex);
}