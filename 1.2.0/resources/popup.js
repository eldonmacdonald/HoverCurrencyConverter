const reloadMessage = document.getElementById('reload-message');

const selectElement = document.getElementById('convert-to');
chrome.storage.local.get('hoverconverter_selectedCurrency').then((result) => {
    let previousSelectedCurrency = result.hoverconverter_selectedCurrency;
    if (previousSelectedCurrency) {
        selectElement.value = previousSelectedCurrency;
        console.log(`Previous selected currency: ${previousSelectedCurrency}`);
    }
});
selectElement.addEventListener('change', (event) => {
    const selectedCurrency = event.target.value;
    chrome.storage.local.set({ 'hoverconverter_selectedCurrency': selectedCurrency }, () => {
        console.log(`Selected currency set to: ${selectedCurrency}`);
    });
    reloadMessage.style.display = 'block';
});

const convertFromElem = document.getElementById('convert-from');
chrome.storage.local.get('hoverconverter_convertFrom').then((result) => {
    let previousSelectedCurrency = result.hoverconverter_convertFrom;
    if (previousSelectedCurrency) {
        convertFromElem.value = previousSelectedCurrency;
        console.log(`Previous selected currency: ${previousSelectedCurrency}`);
    }
});
convertFromElem.addEventListener('change', (event) => {
    const selectedCurrency = event.target.value;
    chrome.storage.local.set({ 'hoverconverter_convertFrom': selectedCurrency }, () => {
        console.log(`Selected currency set to: ${selectedCurrency}`);
    });
    reloadMessage.style.display = 'block';
});