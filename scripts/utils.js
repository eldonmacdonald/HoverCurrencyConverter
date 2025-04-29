function getSiblingsThatMatchRegex(element, regex) {
    const siblings = Array.from(element.parentNode.childNodes); // Include all child nodes (elements + text nodes)
    return siblings.filter((sibling) => {
        if (sibling === element) {
            return false; // Skip the element itself
        }

        if (sibling.nodeType === Node.TEXT_NODE) {
            // Check if the text node matches the regex
            return regex.test(sibling.nodeValue.trim());
        } else if (sibling.nodeType === Node.ELEMENT_NODE) {
            // Check if the element's text content matches the regex
            return regex.test(sibling.textContent.trim());
        }

        return false; // Ignore other node types
    });
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