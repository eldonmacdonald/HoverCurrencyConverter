beforeEach(async () => {
    await page.goto("file://"+__dirname+"/CurrencySymbolRegexFinderTests.html");
})

describe('CurrencySymbolRegexFinder.js', () => {
    it('updateSymbolElemResults_bodyReturnsCorrectSymbolElementsTest', async () => {
        const ret = await page.evaluate(() => {
            return updateSymbolElemResults_bodyReturnsCorrectSymbolElementsTest();
        })

        expect(ret.length).toEqual(2);
        expect(ret[0]).toEqual(ret[1]);
    })

    it('getElementThatContainsBodyTextIndex_singleElementContainsIndex0To37Test', async () => {
        const ret = await page.evaluate(() => {
            return getElementThatContainsBodyTextIndex_singleElementContainsIndex0To37Test();
        })

        expect(ret.length).toEqual(2);
        expect(ret[0]).toEqual("single-element-contains-index-0-37");
        expect(ret[1]).toEqual("single-element-contains-index-0-37");
    })

    it('getElementThatContainsBodyTextIndex_multipleElementsTest1', async () => {
        const ret = await page.evaluate(() => {
            return getElementThatContainsBodyTextIndex_multipleElementsTest1();
        })

        expect(ret.length).toEqual(2);
        expect(ret[0]).toEqual("contains-index-61-80");
        expect(ret[1]).toEqual("contains-index-61-80");
    })

    it('getElementThatContainsBodyTextIndex_multipleElementsTest2', async () => {
        const ret = await page.evaluate(() => {
            return getElementThatContainsBodyTextIndex_multipleElementsTest2();
        })

        expect(ret.length).toEqual(2);
        expect(ret[0]).toEqual("contains-index-185-204");
        expect(ret[1]).toEqual("contains-index-185-204");
    })

    it('getElementThatContainsBodyTextIndex_multipleElementsTextNodeTest', async () => {
        const ret = await page.evaluate(() => {
            return getElementThatContainsBodyTextIndex_multipleElementsTextNodeTest();
        })

        expect(ret.length).toEqual(2);
        expect(ret[0]).toEqual("contains-index-257-266");
        expect(ret[1]).toEqual("contains-index-257-266");
    })
})