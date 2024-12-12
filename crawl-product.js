import puppeteer from "puppeteer";
import fs, { readFile } from "fs/promises";
import { parse } from "json2csv";

const scrapeData = async () => {
    try {
        const data = await readFile('./restaurantDetails.json', 'utf8'); // Read the file
        const restaurantDetails = JSON.parse(data);
        const browser = await puppeteer.launch({
            headless: 'new',
        });

        for (const restaurant of restaurantDetails) {
            const { hrefRestaurant } = restaurant;
            const restaurantPage = await browser.newPage();
            console.log(`=================== Process link ${hrefRestaurant} ===================`);

            await restaurantPage.goto(hrefRestaurant);
            restaurant.menuSections = await restaurantPage.evaluate(() => {
                const menuSections = [];
                const sections = document.querySelectorAll('section[data-role="item-category"]');

                sections.forEach(section => {
                    const sectionName = section.querySelector('h1')?.innerText.trim();
                    const items = Array.from(section.querySelectorAll('div .menu-item')).map(item => {
                        const title = item.querySelector('h2.menu-item-title')?.innerText.trim();
                        const description = item.querySelector('p.menu-item-description')?.innerText.trim();
                        const price = item.querySelector('div p.text-greenBadge')?.innerText.trim();
                        const calories = item.querySelector('div p.text-secondary')?.innerText.trim() ?? null;
                        return { title, description, price, calories };
                    });
                    menuSections.push({ sectionName, items });
                });

                return menuSections;
            });

            await restaurantPage.close();
        }
        await browser.close();

        const csvData = [];
        for (const restaurant of restaurantDetails) {
            const { name, cuisineName, rate, menuSections } = restaurant;
            for (const section of menuSections) {
                const { sectionName, items } = section;
                for (const item of items) {
                    const { title, price } = item;
                    csvData.push({
                        "Restaurant Name": name,
                        Cuisine: cuisineName,
                        Rating: rate,
                        "Dish Name": title,
                        Price: price,
                        Category: sectionName,
                    });
                }
            }
        }

        // Convert to CSV
        const fields = ["Restaurant Name", "Cuisine", "Rating", "Dish Name", "Price", "Category"];
        const csv = parse(csvData, { fields });

        // Write CSV to file
        await fs.writeFile("restaurant_data.csv", csv, "utf-8");
        console.log("Data written to restaurant_data.csv successfully!");

    } catch (error) {
        console.error("Error:", error);
    }
};

scrapeData();