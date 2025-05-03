function getSiblingsThatMatchRegex(element, regex) {
    const siblings = Array.from(element.parentNode.childNodes); // Include all child nodes (elements + text nodes)
    
    let matchedElements = [];
    function recursiveCheckChildren(elemArr) {
        let tmpArr = Array.from(elemArr);
        tmpArr.forEach(elem => {
            if (elem.hasChildNodes()) {
                recursiveCheckChildren(elem.childNodes);
            } else if (regex.test(elem.nodeValue)) {
                matchedElements.push(elem);
            }
        })
    }

    recursiveCheckChildren(siblings);

    return matchedElements;
}

function isElementVisible(element) {

    const rect = element.getBoundingClientRect();
    if(rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
        rect.right > (window.innerWidth || document.documentElement.clientWidth) ||
        rect.left < 0 || rect.top < 0) {

        return false;
    }

    let currentElement = element;
    while (currentElement) {
        const computedStyle = window.getComputedStyle(currentElement);
        
        if(computedStyle.clip == "rect(0px, 0px, 0px, 0px)") {
            return false;
        }

        const opacity = parseFloat(computedStyle.opacity);
        if (opacity === 0) {
            return false; // If any ancestor has opacity 0, the element is not visible
        }
        currentElement = currentElement.parentElement; // Move up the DOM tree
    }
    return true;
}