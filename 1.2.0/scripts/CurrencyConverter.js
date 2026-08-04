/**
 * The CurrencyConverter class is responsible for converting raw units of
 * one currency to another and formatting the result according to the
 * target currency's locale.
 * 
 * Github Copilot was used for some code snippets, comments and debugging in this
 * class.
 * 
 * @author Eldon MacDonald
 */
class CurrencyConverter {

    /**
     * 
     * @param {string} currency - the currency code of the currency that is to 
     * be converted 
     * @param {string} convertToCurrency - The currency code of the currency
     * that the currency is to be converted to
     * @param {Object} exchangeRates - An object that contains the price of the 
     * input currency in units of the output currency under a key that is the 
     * input currency's currency code
     * @param {string} localeFormat - The numerical string format to be used in 
     * the conversion
     */
    constructor(currency, convertToCurrency, exchangeRates, localeFormat) {
        this.currency = currency;
        this.exchangeRates = exchangeRates;
        this.convertToCurrency = convertToCurrency;
        this.localeFormat = localeFormat;

        if(!exchangeRates.hasOwnProperty(this.currency)) {
            throw new TypeError("currency argument is not a key in exchangeRates argument object");
        }

        if(!exchangeRates.hasOwnProperty(this.convertToCurrency)) {
            throw new TypeError("convertToCurrency argument is not a key in exchangeRates argument object");
        }

        //Make sure that localeFormat is a valid locale
        try {
            Intl.getCanonicalLocales(this.localeFormat)
        } catch (e) {
            throw new TypeError("localeFormat argument is not a valid locale")
        }
    }

    /**
     * 
     * @param {number} amount - the units of currency to be converted
     * @returns {string} the amount converted to the target currency and
     *                   formatted according to the target currency's locale
     * @throws {Error} If the amount is not a number, if the currency code is not
     *                supported, or if the conversion otherwise fails.
     */
    getConvertedString(amount) {
        let convertedAmount = amount / this.exchangeRates[this.currency];

        //Convert the amount to a string representing the target currency
        return convertedAmount.toLocaleString(this.localeFormat, 
            { style: 'currency', currency: this.convertToCurrency });
    }

    /**
     * Gives the exchange rates for a given currency
     * @param {string} currency - The currency code to fetch exchange rates for 
     *                            (e.g., "USD", "EUR").
     * @returns {Object} The cost of the specified currency in other currencies
     * @throws {Error} If an invalid currency code is provided or if the API request fails.
     */
    static async getExchangeRates(currency) {
        const apiUrl = `https://api.exchangerate-api.com/v4/latest/${currency}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.rates;
        } catch (error) {
            throw new Error(`Failed to fetch exchange rates: ${error.message}`);
        }
    }
}