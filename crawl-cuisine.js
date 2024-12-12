import puppeteer from "puppeteer";
import fs from "fs/promises";

const crawlCuisine = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new', slowMo: 50
        });

        const hungerStationPage = await browser.newPage();
        await hungerStationPage.setCacheEnabled(true);
        await hungerStationPage.goto('https://hungerstation.com/sa-en/restaurants/riyadh/al-ulaya');

        console.log("===================Start Get all cuisine ===================")
        const cuisines = await hungerStationPage.$$eval('#__next > main > aside > div > div > div:nth-child(1) > div > div.overflow-scroll-y a', cuisines => {
            return cuisines.map(cuisine => {
                const href = cuisine.href;
                const name = cuisine.querySelector('h2')?.innerText.trim();

                return {href, name}
            })
        })
        await hungerStationPage.close()


        for (const cuisine of cuisines) {
            console.log(`=================== ${cuisine.href} ===================`)
            const restaurant = await browser.newPage();
            await restaurant.goto(cuisine.href)
            let page = 1;

            while (true) {
                const selectorPaginate = await restaurant.$$("#__next > main > section > footer > div a")
                const lastLink = selectorPaginate[selectorPaginate.length - 1];
                const prevLink = selectorPaginate.length > 1 ? selectorPaginate[selectorPaginate.length - 2] : null;

                if (selectorPaginate.length === 0) {
                    break;
                }

                const lastPageHref = await lastLink.evaluate(el => el.getAttribute("href"));
                const lastPage = parseInt(new URLSearchParams(lastPageHref.split("?")[1]).get("page"), 10);

                let prevPage = null;
                if (prevLink) {
                    const prevPageHref = await prevLink.evaluate(el => el.getAttribute("href"));
                    prevPage = parseInt(new URLSearchParams(prevPageHref.split("?")[1]).get("page"), 10);
                }

                if (!prevPage) {
                    break;
                }

                if (lastPage === prevPage) {
                    page = prevPage
                    break
                } else {
                    await lastLink.click()
                    await restaurant.waitForNavigation()
                }

            }
            await restaurant.close()
            cuisine.page = page
        }
        await browser.close()
        await fs.writeFile("cuisine.json", JSON.stringify(cuisines, null, 2), "utf-8");
        console.log("Data written to cuisine.json successfully!");
    } catch (e) {
        console.log(e)
    }
}

crawlCuisine()