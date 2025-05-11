beforeEach(async () => {
    await page.goto("file://"+__dirname+"/PriceElementTests.html");
})

describe('PriceElement.js', () => {
    it('constructor_throwTypeErrorOnBadBoundingElemTypeTest', async () =>{
        const ret = await page.evaluate(() => {
            try {
                return constructor_throwTypeErrorOnBadBoundingElemTypeTest();
            } catch (e) {
                return e.message;
            }
        })

        expect(ret).toMatch(/boundingElem argument must be of type Element/);
    })

    it('isVisible_parent2LevelsVisibilityHiddenTest', async () => {
        const ret = await page.evaluate(() => {
            return isVisible_parent2LevelsVisibilityHiddenTest();
        })

        expect(ret).toBeFalsy();
    })

    it('isVisible_parent2LevelsOpacity0Test', async () => {
        const ret = await page.evaluate(() => {
            return isVisible_parent2LevelsOpacity0Test();
        })

        expect(ret).toBeFalsy();
    })

    it('isVisible_parent2LevelsClipTest', async () => {
        const ret = await page.evaluate(() => {
            return isVisible_parent2LevelsClipTest();
        })

        expect(ret).toBeFalsy();
    })

    it('isVisible_elementVisibleTest', async () => {
        const ret = await page.evaluate(() => {
            return isVisible_elementVisibleTest();
        })

        expect(ret).toBeTruthy();
    })

    it('getBoundingClientRect_getCorrectBoundingRect', async () => {
        const ret = await page.evaluate(() => {
            return getBoundingClientRect_getCorrectBoundingRect();
        })

        expect(ret[0]).toEqual(ret[1]);
    })

    it('isPointWithinElementBoundaries_pointIsWithinBoundariesTest', async () => {
        const ret = await page.evaluate(() => {
            return isPointWithinElementBoundaries_pointIsWithinBoundariesTest();
        })

        expect(ret).toBeTruthy();
    })

    it('getElementDistanceFromPoint_elementDistance5SE', async () => {
        const ret = await page.evaluate(() => {
            return getElementDistanceFromPoint_elementDistance5SE();
        })

        expect(ret).toEqual(5)
    })

    it('getElementDistanceFromPoint_elementDistance5NW', async () => {
        const ret = await page.evaluate(() => {
            return getElementDistanceFromPoint_elementDistance5NW();
        })

        expect(ret).toEqual(5)
    })
})