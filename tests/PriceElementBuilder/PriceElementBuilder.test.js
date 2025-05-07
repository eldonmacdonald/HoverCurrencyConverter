beforeEach(async () => {
    await page.goto("file://"+__dirname+"/PriceElementBuilderTests.html");
})

describe('PriceElementBuilder.js', () => {
    it('findIndexOfElementTextInParentTextContent_indexAfterDistractionsTest', async () => {
        const ret = await page.evaluate(() => {
            return findIndexOfElementTextInParentTextContent_indexAfterDistractionsTest();
        });

        expect(ret).toEqual('$');
    })

    it('constructor_errorOnBadConverterTest', async () => {
        const ret = await page.evaluate(() => {
            try {
                return constructor_errorOnBadConverterTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(ret).toMatch(/converter argument must be of class CurrencyConverter/);
    })

    it('isPriceContainedInSingleElement_falseOnSymbolOnlyTest', async () => {
        const ret = await page.evaluate(() => {
            return isPriceContainedInSingleElement_falseOnSymbolOnlyTest();
        });

        expect(ret).toEqual(false);
    })

    it('isPriceContainedInSingleElement_trueWhenAmountInElemTest', async () => {
        const ret = await page.evaluate(() => {
            return isPriceContainedInSingleElement_trueWhenAmountInElemTest();
        });

        expect(ret).toEqual(true);
    })

    it('getPriceFromElementText_textNodeSingleElementTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromElementText_textNodeSingleElementTest();
        });

        expect(ret).toEqual(14.99);
    })

    it('getPriceFromElementText_singleElementWithDecimalTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromElementText_singleElementWithDecimalTest();
        });

        expect(ret).toEqual(14.99);
    })

    it('getPriceFromElementText_singleElementNoDecimalTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromElementText_singleElementNoDecimalTest();
        });

        expect(ret).toEqual(1400);
    })

    it('getPriceFromElementText_singleElementNoDecimalCommaTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromElementText_singleElementNoDecimalCommaTest();
        });

        expect(ret).toEqual(1400);
    })

    it('getPriceFromElementText_singleElementWithDecimalNoiseTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromElementText_singleElementWithDecimalNoiseTest();
        });

        expect(ret).toEqual(14.99);
    })

    it('getPriceFromElementText_singleElementNoDecimalNoiseTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromElementText_singleElementNoDecimalNoiseTest();
        });

        expect(ret).toEqual(1400);
    })

    it('getPriceFromElementText_throwErrorOnNoPriceMatchesTest', async () => {
        const ret = await page.evaluate(() => {
            try {
                return getPriceFromElementText_throwErrorOnNoPriceMatchesTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(ret).toMatch(/Tried to find the price associated with the following element text, but found no price regex matches/);
    })

    it('buildPriceElementFromSingleElement_singleElementWithDecimalTest', async () => {
        const ret = await page.evaluate(() => {
            return buildPriceElementFromSingleElement_singleElementWithDecimalTest();
        });

        expect(ret.displayPrice).toBeDefined();
        expect(ret.boundingElem).toBeDefined();

        expect(ret.displayPrice).toMatch(/£0.12/)
    })

    it('buildPriceElementFromSingleElement_returnNullOnNoPriceTest', async () => {
        const ret = await page.evaluate(() => {
            return buildPriceElementFromSingleElement_returnNullOnNoPriceTest();
        });

        expect(ret).toBeNull();
    })

    it('getPriceFromParentText_allSameLevelDecimalSeparatedTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromParentText_allSameLevelDecimalSeparatedTest();
        });

        expect(ret).toEqual(14.99);
    })

    it('getPriceFromParentText_allSameLevelDecimalSeparatedCommasTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromParentText_allSameLevelDecimalSeparatedCommasTest();
        });

        expect(ret).toEqual(14000.99);
    })

    it('getPriceFromParentText_allSameLevelDecimalSeparatedCommasNoiseTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromParentText_allSameLevelDecimalSeparatedCommasNoiseTest();
        });

        expect(ret).toEqual(14000.99);
    })

    it('getPriceFromParentText_allSameLevelFullAmountTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromParentText_allSameLevelFullAmountTest();
        });

        expect(ret).toEqual(14.99);
    })

    it('getPriceFromParentText_allSameLevelNoDecimalTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromParentText_allSameLevelNoDecimalTest();
        });

        expect(ret).toEqual(1400);
    })

    it('getPriceFromParentText_allDifferentLevelsNoDecimalSeparatedTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromParentText_allDifferentLevelsNoDecimalSeparatedTest();
        });

        expect(ret).toEqual(14.99);
    })

    it('getPriceFromParentText_allDifferentLevelsFullAmountTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceFromParentText_allDifferentLevelsFullAmountTest();
        });

        expect(ret).toEqual(14.99);
    })

    it('getPriceFromParentText_throwErrorOnNoPriceMatchesTest', async () => {
        const ret = await page.evaluate(() => {
            try {
                return getPriceFromParentText_throwErrorOnNoPriceMatchesTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(ret).toMatch(/Tried to find the price associated with the following parent text, but found no price regex matches:/);
    })

    it('buildPriceElementThroughParent_createPriceElementTest', async () => {
        const ret = await page.evaluate(() => {
            return buildPriceElementThroughParent_createPriceElementTest();
        });

        expect(ret.displayPrice).toBeDefined();
        expect(ret.boundingElem).toBeDefined();

        expect(ret.displayPrice).toMatch(/£0.12/)
    })

    it('buildPriceElementThroughParent_nullOnNoPriceTest', async () => {
        const ret = await page.evaluate(() => {
            return buildPriceElementThroughParent_nullOnNoPriceTest();
        });

        expect(ret).toBeNull();
    })

    it('buildPriceElementsFromCurrencySymbolElementArray_validArrayTest', async () => {
        const ret = await page.evaluate(() => {
            return buildPriceElementsFromCurrencySymbolElementArray_validArrayTest();
        });

        expect(ret).toBeDefined();
        expect(ret.length).toEqual(14);

        ret.forEach(item => {
            expect(item.displayPrice).not.toBeNaN();
            expect(item.boundingElem).toBeDefined();
        })
    })

    it('buildPriceElementsFromCurrencySymbolElementArray_throwErrorOnInvalidArrayTest', async () => {
        const ret = await page.evaluate(() => {
            try {
                return buildPriceElementsFromCurrencySymbolElementArray_throwErrorOnInvalidArrayTest();
            } catch (e) {
                return e.message;
            }
        });

        expect(ret).toMatch(/all elements in currencySymbolElementArray argument must be of class Element/);
    })
})