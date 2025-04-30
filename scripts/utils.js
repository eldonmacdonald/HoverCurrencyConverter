function getSiblingsThatMatchRegex(element, regex) {
    const siblings = Array.from(element.parentNode.childNodes); // Include all child nodes (elements + text nodes)

    function matchesRegex(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return regex.test(node.nodeValue.trim());
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            return regex.test(node.textContent.trim());
        }
        return false;
    }

    function checkDescendants(node) {
        if (matchesRegex(node)) {
            return true;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            return Array.from(node.childNodes).some(checkDescendants);
        }
        return false;
    }

    let matchedSiblings = siblings.filter((sibling) => {
        if (sibling === element) {
            return false; // Skip the element itself
        }
        return checkDescendants(sibling);
    });

    return matchedSiblings;
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