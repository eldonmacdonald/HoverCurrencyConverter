class CurrencyConverter {

    constructor(currency, convertToCurrency, exchangeRates, localeFormat) {
        this.currency = currency;
        this.exchangeRates = exchangeRates;
        this.convertToCurrency = convertToCurrency;
        this.localeFormat = localeFormat;
    }

    getConvertedString(amount) {
        let convertedAmount = amount / this.exchangeRates[this.currency];
        return convertedAmount.toLocaleString(this.localeFormat, 
            { style: 'currency', currency: this.convertToCurrency });
    }

    static async getExchangeRates(currency) {
        const apiUrl = `https://api.exchangerate-api.com/v4/latest/${currency}`; // Replace with your API URL
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.rates;
        } catch (error) {
            console.error("Failed to fetch exchange rate:", error);
            return null;
        }
    }
}