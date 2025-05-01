beforeEach(async () => {
    await page.goto("file://"+__dirname+"/CurrencyConverterTests.html");
});

describe('CurrencyConverter', () => {

    it('getExchangeRates_GetRatesForINRTest()', async () => {
        let rates = await page.evaluate(async () => {
            return await getExchangeRates_GetRatesForINRTest();
        })

        expect(rates).toBeDefined();
        expect(rates).toHaveProperty("USD");
        expect(rates).toHaveProperty("EUR");
        expect(rates).toHaveProperty("GBP");
    });

    it('getExchangeRates_ErrorOnInvalidCurrencyTest()', async () => {
        let error = await page.evaluate(async () => {
            try {
                return await getExchangeRates_ErrorOnInvalidCurrencyTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(error).toBeDefined();
        expect(error).toMatch(/Failed to fetch exchange rates: HTTP error! status: 404/);
    });

    it('getConvertedString_ConvertUSDToINRInINLocaleTest()', async () => {
        let convertedString = await page.evaluate(async () => {
            return getConvertedString_ConvertUSDToINRInINLocaleTest();
        });

        expect(convertedString).toBeDefined();
        expect(convertedString).toMatch(/₹1,00,000.00/);
    });

    it('getConvertedString_ConvertINRToGBPInUKLocaleTest()', async () => {
        let convertedString = await page.evaluate(async () => {
            return getConvertedString_ConvertINRToGBPInUKLocaleTest();
        });

        expect(convertedString).toBeDefined();
        expect(convertedString).toMatch(/£1/);
    });

    it('constructor_ErrorOnCurrencyArgumentNotInExchangeRatesTest()', async () => {
        let error = await page.evaluate(() => {
            try {
                return constructor_ErrorOnCurrencyArgumentNotInExchangeRatesTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(error).toBeDefined();
        expect(error).toMatch(/currency argument is not a key in exchangeRates argument object/);
    });

    it('constructor_ErrorOnCurrencyToConvertArgumentNotInExchangeRatesTest()', async () => {
        let error = await page.evaluate(() => {
            try {
                return constructor_ErrorOnCurrencyToConvertArgumentNotInExchangeRatesTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(error).toBeDefined();
        expect(error).toMatch(/convertToCurrency argument is not a key in exchangeRates argument object/);
    });

    it('constructor_ErrorOnInvalidLocaleTest()', async () => {
        let error = await page.evaluate(() => {
            try {
                return constructor_ErrorOnInvalidLocaleTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(error).toBeDefined();
        expect(error).toMatch(/localeFormat argument is not a valid locale/);
    })
});