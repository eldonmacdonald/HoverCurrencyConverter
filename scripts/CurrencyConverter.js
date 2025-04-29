export class CurrencyConverter {

    constructor(currency) {
        this.currency = currency;
    }

    getConvertedString(amount) {
        let convertedAmount = amount / currencyExchangeRates[this.currency];
        return convertedAmount.toLocaleString('en-US', { style: 'currency', currency: convertToCurrency });
    }
}