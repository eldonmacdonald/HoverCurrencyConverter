beforeEach(async () => {
    await page.goto("file://"+__dirname+"/CurrencySymbolFinderTests.html");
})

describe('CurrencySymbolFinder.js', () => {
    it('startLookingForSymbolElems_observeCharacterDataMutationTest', async () => {
        let count = await page.evaluate(async () => {
            return await startLookingForSymbolElems_observeCharacterDataMutationTest();
        })

        expect(count).toEqual(2);
    });

    it('startLookingForSymbolElems_observeNewElementMutationTest', async () => {
        let count = await page.evaluate(async () => {
            return await startLookingForSymbolElems_observeNewElementMutationTest();
        })

        expect(count).toEqual(1);
    });

    it('findSymbolElemsAfterMutation_gracePreiodForSymbolElemResultsUpdateTest', async () => {
        let count = await page.evaluate(async () => {
            return await findSymbolElemsAfterMutation_gracePreiodForSymbolElemResultsUpdateTest();
        })

        expect(count).toEqual(1);
    });

    it('filterSymbolElemResults_resultsAreFilteredTest', async () => {
        let count = await page.evaluate(async () => {
            return await filterSymbolElemResults_resultsAreFilteredTest();
        })

        expect(count).toEqual(5);
    });

    it('filterSymbolElemResults_nonElementArrayThrowsErrorTest', async () => {
        let result = await page.evaluate(async () => {
            try {
                return await 
                    filterSymbolElemResults_nonElementArrayThrowsErrorTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(result).toMatch
            (/at least one element in the symbolElemResults argument was not an HTML DOM element/);
    })

    it('updateSymbolElemResults_returnsDollarElemsTest', async () => {
        let count = await page.evaluate(() => {
            return updateSymbolElemResults_returnsDollarElemsTest();
        });

        expect(count).toEqual(5);
    });

    it('updateSymbolElemResults_returnsPoundElemsTest', async () => {
        let count = await page.evaluate(() => {
            return updateSymbolElemResults_returnsPoundElemsTest();
        });

        expect(count).toEqual(1);
    });

    it('updateSymbolElemResults_returnsEuroElemsTest', async () => {
        let count = await page.evaluate(() => {
            return updateSymbolElemResults_returnsEuroElemsTest();
        });

        expect(count).toEqual(1);
    });

    it('updateSymbolElemResults_returnsRupeeElemsTest', async () => {
        let count = await page.evaluate(() => {
            return updateSymbolElemResults_returnsRupeeElemsTest();
        });

        expect(count).toEqual(1);
    });
});