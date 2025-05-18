beforeEach(async () => {
    await page.goto("file://" + __dirname + "/RegexPriceElementFinderTests.html");
})

describe('RegexPriceElementFinder.js', () => {
    it('getNodesWithTextInRange_allSameLevelDecimalTest', async () => {
        const ret = await page.evaluate(() => {
            return getNodesWithTextInRange_allSameLevelDecimalTest();
        })

        expect(ret).toBeDefined();
        expect(ret[0]).toEqual('$');
        expect(ret[1]).toEqual('14');
        expect(ret[2]).toEqual(',');
        expect(ret[3]).toEqual('000');
        expect(ret[4]).toEqual('.99');
    })

    it('getNodesWithTextInRange_allSameLevelDecimalNoiseTest', async () => {
        const ret = await page.evaluate(() => {
            return getNodesWithTextInRange_allSameLevelDecimalNoiseTest();
        })

        expect(ret).toBeDefined();
        expect(ret.length).toEqual(5);
        expect(ret[0]).toEqual('$');
        expect(ret[1]).toEqual('14');
        expect(ret[2]).toEqual(',');
        expect(ret[3]).toEqual('000');
        expect(ret[4]).toEqual('.99');
    })

    it('getNodesWithTextInRange_errorOnNodesWithChildren', async () => {
        const ret = await page.evaluate(() => {
            try {
                return getNodesWithTextInRange_errorOnNodesWithChildren();
            } catch(e) {
                return e.message;
            }
        })

        expect(ret).toMatch(/nodes array must contain only nodes with no child nodes/);
    })

    it('getRegexRangeInNodeArray_twoElementsWithNoiseTest', async () => {
        const ret = await page.evaluate(() => {
            return getRegexRangeInNodeArray_twoElementsWithNoiseTest();
        })

        expect(ret).toBeDefined();
        expect(ret.startNodeText).toEqual('abra $14.99 $200.00a')
        expect(ret.endNodeText).toEqual('abra $14.99 $200.00a')
        expect(ret.startOffset).toEqual(5)
        expect(ret.endOffset).toEqual(11)
    })

    it('getRegexRangeInNodeArray_allSameLevelDecimalNoiseTest', async () => {
        const ret = await page.evaluate(() => {
            return getRegexRangeInNodeArray_allSameLevelDecimalNoiseTest();
        })

        expect(ret).toBeDefined();
        expect(ret.startNodeText).toEqual('$')
        expect(ret.endNodeText).toEqual('.99')
        expect(ret.startOffset).toEqual(0)
        expect(ret.endOffset).toEqual(3)
    })
    
    it('getPriceElementsTextAndRange_twoElementsWithDecimalNoiseTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceElementsTextAndRange_twoElementsWithDecimalNoiseTest();
        })

        expect(ret.length).toEqual(2);
        expect(ret[0].text).toEqual('$14.99 ')
        expect(ret[1].text).toEqual('$200.00');
    })

    it('getPriceElementsTextAndRange_twoElementsSamePriceTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceElementsTextAndRange_twoElementsSamePriceTest();
        })

        expect(ret.length).toEqual(2);
        expect(ret[0].text).toEqual('$20.00')
        expect(ret[1].text).toEqual('$20.00');
    })

    it('getPriceElementsTextAndRange_allSameLevelNoDecimalTest', async () => {
        const ret = await page.evaluate(() => {
            return getPriceElementsTextAndRange_allSameLevelNoDecimalTest();
        })

        expect(ret.length).toEqual(1);
        expect(ret[0].text).toMatch(/\s*\$\s*1400/)
    })
})