import puppeteer, { Browser, Page } from "puppeteer";
import axios from "axios";

export default async function getRawInformation(url: string, browser: Browser) {
    try {

            const page = await browser.newPage();
            const validRoutes = await getValidRoutes(url);
            const rawInformation = await scrapePages(validRoutes, page);
            page.close();
            return rawInformation;

    } catch (error) {
        console.error('Error fetching the company values: ', error.message);
        return [];
    }
}

const getValidRoutes = async (url: string) => {
    const validPages: string[] = [];
    const commonRoutes = [
        '/about',
        '/about-us',
        '/company',
        '/our-company',
        '/team',
        '/our-team',
        '/history',
        '/our-history',
        '/mission',
        '/our-mission',
        '/values',
        '/our-values',
        '/who-we-are',
        '/leadership',
        '/executive-team',
        '/philosophy',
        '/our-philosophy',
        '/sustainability',
        '/csr',
    ];

    for (const route of commonRoutes) {
        try {
            console.log(`route used: ${url}${route}`);
            const response = await axios.get(`${url}${route}`);
            if (response.status === 200) {
                validPages.push(`${url}${route}`);
            }
        } catch (error) {
            console.log(`Message: ${error.message}`);
            console.log(`Page not found at route: ${route}`);
        }
    }
    return validPages;
}

const scrapePages = async (validRoutes: string[], page: Page) =>{
    const rawInformation: string[] = [];
    if (validRoutes.length > 0) {
        for (const validUrl of validRoutes) {
           await page.goto(validUrl, {
               waitUntil: 'networkidle2',
           });

           const pageContent = await page.evaluate(() => {
               const header = document.querySelector('header');
               const footer = document.querySelector('footer');
           
               if (header) {
                   header.remove();
               }
               if (footer) {
                   footer.remove();
               }                
               return document.body.innerText.trim();
           });
           rawInformation.push(pageContent);
         
        }
        return rawInformation;
}
    return rawInformation;
}