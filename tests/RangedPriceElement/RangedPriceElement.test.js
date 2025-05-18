beforeEach(async () => {
    await page.goto("file://" + __dirname + "/RangedPriceElement.html");
})

describe('RangedPriceElement.js', () => {
    it('getBoundingClientRect_differentElementsTest', async () => {
        const ret = await page.evaluate(() => {
            return getBoundingClientRect_differentElementsTest();
        })

        expect(ret.length).toEqual(2)
        expect(ret[0]).toEqual(ret[1]);
    })

    it('getBoundingClientRect_sameElemTest', async () => {
        const ret = await page.evaluate(() => {
            return getBoundingClientRect_sameElemTest();
        })

        expect(ret.length).toEqual(2)
        expect(ret[0]).toEqual(100);
        expect(ret[1]).toEqual(100);
    })
}) 