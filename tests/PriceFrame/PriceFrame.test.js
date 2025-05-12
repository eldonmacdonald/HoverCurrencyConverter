const getExtensionId = async (browser) => {
    // Find the background page or service worker for your extension
    const targets = await browser.targets();
    const extensionTarget = targets.find(
    target =>
        target.type() === 'background_page' ||
        target.type() === 'service_worker'
    );
    if (!extensionTarget) throw new Error('Extension target not found');
    const extensionUrl = extensionTarget.url(); // e.g. chrome-extension://<ID>/_generated_background_page.html
    return extensionUrl.split('/')[2];
};

beforeEach(async () => {
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto("file://"+__dirname+"/PriceFrameTests.html", {
        waitUntil: 'load'
    });

    let gotExtensionDisabledMessage = await page.evaluate(() => {
        let element = document.head.querySelector("p");
        if(element && element.innerHTML == "Disabled extension") {
            return true;
        }
        return false;
    })

    if(!gotExtensionDisabledMessage) {
        throw new Error("Extension content scripts may not " + 
            "have been disabled");
    }
});

describe('PriceFrame.js', () => {

    it('createFrame_correctFrameCreatedTest', async () => {
        const frameStyles = await page.evaluate(() => {
            return createFrame_correctFrameCreatedTest();
        });

        expect(frameStyles).toBeDefined();
        expect(frameStyles[0]).toEqual("fixed");
        expect(frameStyles[1]).toEqual("none");
        expect(frameStyles[2]).toEqual("1200px");
        expect(frameStyles[3]).toEqual("800px");
        expect(frameStyles[4]).toEqual("0px");
        expect(frameStyles[5]).toEqual("0px");
        expect(frameStyles[6]).toEqual("9999");
        expect(frameStyles[7]).toEqual("light");
    });

    it('createFrame_changedDimensionsOnResizeTest', async () => {

        // Get dimensions of frame before resize
        const dimensionsBefore = await page.evaluate(() => {
            window.test_frame = PriceFrame.createFrame();

            return [window.test_frame.style.width, 
                window.test_frame.style.height];
        })

        expect(dimensionsBefore[0]).toEqual("1200px");
        expect(dimensionsBefore[1]).toEqual("800px");

        await page.setViewport({width: 2400, height: 1600});

        // Wait (with leeway), then get dimensions of frame after resize
        const dimensionsAfter = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 
                PriceFrame.resizeGracePeriod + 20));

            return [window.test_frame.style.width, 
                window.test_frame.style.height];
        })

        expect(dimensionsAfter[0]).toEqual("2400px");
        expect(dimensionsAfter[1]).toEqual("1600px");
    });

    it('createFrame_changedDimensionsOnResizeAfterTimeoutTest', async () => {
        // Get dimensions of frame before resize
        const dimensionsBefore = await page.evaluate(() => {
            window.test_frame = PriceFrame.createFrame();

            return [window.test_frame.style.width, 
                window.test_frame.style.height];
        })

        expect(dimensionsBefore[0]).toEqual("1200px");
        expect(dimensionsBefore[1]).toEqual("800px");

        await page.setViewport({width: 2400, height: 1600});

        // Wait half the grace period, then get dimensions of frame after resize
        let dimensionsAfter = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 
                PriceFrame.resizeGracePeriod / 2));

            return [window.test_frame.style.width, 
                window.test_frame.style.height];
        })

        expect(dimensionsAfter[0]).toEqual("1200px");
        expect(dimensionsAfter[1]).toEqual("800px");

        await page.setViewport({width: 4800, height: 3200});

        // Same thing
        dimensionsAfter = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 
                PriceFrame.resizeGracePeriod / 2));

            return [window.test_frame.style.width, 
                window.test_frame.style.height];
        })

        expect(dimensionsAfter[0]).toEqual("1200px");
        expect(dimensionsAfter[1]).toEqual("800px");

        await page.setViewport({width: 2400, height: 1600});

        // Wait full time now, plus some leeway
        dimensionsAfter = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 
                PriceFrame.resizeGracePeriod + 20));

            return [window.test_frame.style.width, 
                window.test_frame.style.height];
        })

        expect(dimensionsAfter[0]).toEqual("2400px");
        expect(dimensionsAfter[1]).toEqual("1600px");
    })

    it('initializeFrame_correctFrameContentUrlTest', async () => {
        const extensionId = await getExtensionId(browser);

        const srcDoc = await page.evaluate(async (extensionId) => {
            return await initializeFrame_correctFrameContentUrlTest(extensionId);
        }, extensionId)

        expect(srcDoc).toEqual("<body>Hello!</body>");
    });

    it('initializeFrame_errorOnBadURL', async () => {
        const extensionId = await getExtensionId(browser);

        const ret = await page.evaluate(async (extensionId) => {
            try {
                return await initializeFrame_errorOnBadURL(extensionId);
            } catch (e) {
                return e.message;
            }
        }, extensionId);

        expect(ret).toBeDefined();
        expect(ret).toMatch(/Fetching file at url /);
    })

    it('getPriceDiv_successWhenPriceDivExistsInFrame', async () => {
        const extensionId = await getExtensionId(browser);

        const ret = await page.evaluate(async (extensionId) => {
            return await getPriceDiv_successWhenPriceDivExistsInFrame(extensionId);
        }, extensionId)

        expect(ret).toEqual("This is the correct div!");
    })

    it('getPriceDiv_throwsErrorOnDivIdNotFound', async () => {
        const extensionId = await getExtensionId(browser);

        const ret = await page.evaluate(async (extensionId) => {
            try {
                return await getPriceDiv_throwsErrorOnDivIdNotFound(extensionId);
            } catch (e) {
                return e.message;
            }
        }, extensionId)

        expect(ret).toMatch(/did not match any elements in the frame document/);
    })

    it('getPriceDiv_throwsErrorOnFrameWithNoContent', async () => {
        const extensionId = await getExtensionId(browser);

        const ret = await page.evaluate(async (extensionId) => {
            try {
                return await getPriceDiv_throwsErrorOnFrameWithNoContent(extensionId);
            } catch (e) {
                return e.message;
            }
        }, extensionId)

        expect(ret).toMatch(/given iframe does not have any content/);
    })

    it('build_frameBuildsOnCorrectArguments', async () => {
        const extensionId = await getExtensionId(browser);

        const ret = await page.evaluate(async (extensionId) => {
            return await build_frameBuildsOnCorrectArguments(extensionId);
        }, extensionId)

        expect(ret).toBeDefined();
        expect(ret.frame).toBeDefined();
        expect(ret.priceDiv).toBeDefined();
    })
})