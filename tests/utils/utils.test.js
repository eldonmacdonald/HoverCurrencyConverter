beforeEach(async () => {
    await page.goto("file://"+__dirname+"/utilsTests.html");
})

describe('Utils.js', () => {
    it('getSiblingsThatMatchRegex_spanIntegerNoMatchesTest', async () => {
        let siblings = await page.evaluate(() => {
            return getSiblingsThatMatchRegex_spanIntegerNoMatchesTest()
        })
        expect(siblings).toEqual([]);
    })

    it('getSiblingsThatMatchRegex_spanFullAmountTest', async () => {
        let siblingsInnerText = await page.evaluate(async () => {
            return getSiblingsThatMatchRegex_spanFullAmountTest()
                .map(elem => {
                    return elem.nodeValue.trim();
                });
        })
        expect(siblingsInnerText.length).toEqual(1);
        expect(siblingsInnerText[0]).toEqual("14.99");
    })

    it('getSiblingsThatMatchRegex_divFullAmountTest', async () => {
        let siblingsInnerText = await page.evaluate(async () => {
            return getSiblingsThatMatchRegex_divFullAmountTest()
                .map(elem => {
                    return elem.nodeValue.trim();
                });
        })
        expect(siblingsInnerText.length).toEqual(1);
        expect(siblingsInnerText[0]).toEqual("14.99");
    })

    it('getSiblingsThatMatchRegex_spanFullAmountTextNodeTest', async () => {
        let siblingsInnerText = await page.evaluate(async () => {
            return getSiblingsThatMatchRegex_spanFullAmountTextNodeTest()
                .map(elem => {
                    return elem.nodeValue.trim();
                });
        })
        expect(siblingsInnerText.length).toEqual(1);
        expect(siblingsInnerText[0]).toEqual("14.99");
    })

    it('getSiblingsThatMatchRegex_sectionIntegerNoMatchesIntegersParentSiblingsTest', async () => {
        let siblings = await page.evaluate(() => {
            return getSiblingsThatMatchRegex_sectionIntegerNoMatchesIntegersParentSiblingsTest()
        })
        expect(siblings).toEqual([]);
    })

    it('getSiblingsThatMatchRegex_sectionIntegersNestedWithNoiseTextNode', async () => {
        let siblingsInnerText = await page.evaluate(async () => {
            return getSiblingsThatMatchRegex_sectionIntegersNestedWithNoiseTextNode()
                .map(elem => {
                    return elem.nodeValue.trim();
                });
        })
        expect(siblingsInnerText.length).toEqual(2);
        expect(siblingsInnerText[0]).toEqual("249");
        expect(siblingsInnerText[1]).toEqual("99");
    })
})