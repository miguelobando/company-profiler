import  { Browser } from "puppeteer";


export default async function getWebsite(url: string, site: 'linkedin' | 'other', browser: Browser) {

const LINKEDIN_EMAIL =  process.env.LINKEDIN_EMAIL !== undefined ? process.env.LINKEDIN_EMAIL : 'ciberaries64@gmail.com';
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD !== undefined ? process.env.LINKEDIN_PASSWORD : 'miguel123!';
    
const LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/login';

const LINKEDIN_LOG_OUT_URL = 'https://www.linkedin.com/logout';

   
    if (site === 'linkedin') {
        try {
        
            const page = await browser.newPage();
            await page.goto(LINKEDIN_LOGIN_URL, {
                waitUntil: 'networkidle2',
            });
            await page.type('#username', LINKEDIN_EMAIL);
            await page.type('#password', LINKEDIN_PASSWORD);
            await page.click('button.btn__primary--large.from__button--floating[data-litms-control-urn="login-submit"]');
            await page.waitForNavigation();
            await page.goto(`${url}/about/`, {
                waitUntil: 'networkidle2',
            });
            const WEBSITE_SELECTOR = '.org-page-details-module__card-spacing a .link-without-visited-state';

            await page.waitForSelector(WEBSITE_SELECTOR);


            const websiteURL = await page.evaluate(() => {
                const linkElement = document.querySelector('.org-page-details-module__card-spacing a .link-without-visited-state')?.textContent;
                return linkElement || '';
            });
            
            await page.goto(LINKEDIN_LOG_OUT_URL);

            const urlFromLinkedin = await page.goto(websiteURL.trim(), { waitUntil: 'networkidle2' });
            // Just to check if the URL is not messing with me 
            const destinationURL = urlFromLinkedin?.url() || '';
            const cleanedURL = new URL(destinationURL).hostname;

            await page.close();

            return cleanedURL;


           } catch (error) {
            console.log('No about page found');
            return 'No information available for this site';
        }

    } 
    if (site === 'other') {
        return 'No information available for this site';
    }
    return 'No information available for this site';
}