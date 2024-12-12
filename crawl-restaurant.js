import puppeteer from "puppeteer";
import { readFile } from 'fs/promises';
import fs from "fs/promises";

const crawlRestaurant = async () => {
    try {
        let restaurantDetails = [];
        const browser = await puppeteer.launch({
            headless: 'new',
        });

        const data = await readFile('./cuisine.json', 'utf8'); // Read the file
        const cuisines = JSON.parse(data);
        console.log("=================== Start Get all restaurant ===================")
        for (const cuisine of cuisines) {
            for (let page = 1; page <= cuisine.page; page++) {
                const url = cuisine.href + `&page=${page}`
                console.log(`=================== ${url} ===================`)
                const restaurantEachPage = await browser.newPage()
                await restaurantEachPage.setCacheEnabled(true)
                await restaurantEachPage.goto(url)
                // await restaurantEachPage.waitForNavigation()

                const currentRestaurants = await restaurantEachPage.$$eval('main.grid a', links => {
                    return links.map(link => {
                        const href = link.href;
                        const name = link.querySelector('h1.text-base.text-typography')?.innerText.trim();
                        const tag = link.querySelector('p.text-xs.font-hsLight.text-typography')?.innerText.trim();
                        const rate = link.querySelector('span.text-xs.text-typography')?.innerText.trim();
                        return {
                            "name": name,
                            "tag": tag,
                            "rate": rate,
                            "hrefRestaurant": href,
                        };
                    });
                });
                await restaurantEachPage.close()

                currentRestaurants.forEach(restaurant => {
                    restaurant.cuisineName = cuisine.name;
                });

                restaurantDetails = [...restaurantDetails, ...currentRestaurants]
            }

        }
        await browser.close()
        await fs.writeFile("restaurantDetails.json", JSON.stringify(restaurantDetails, null, 2), "utf-8");
        console.log("Data written to restaurantDetails.json successfully!");
    } catch (e) {
        console.log(e)
    }
}

crawlRestaurant()