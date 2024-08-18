import * as cheerio from "cheerio";
import axiosWithRetries from "./common/axiosWithRetries";
import getWebsite from "./getWebsite";
import getBaseJobUrl from "./common/cleanURL";
import getRawInformation from "./getRawInformation";
import summarizeInformation from "./resumeValues";
import puppeteer from "puppeteer";

export default async function companyValues(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    const site = getSiteName(url);
    const baseJobUrl = getBaseJobUrl(url);

    if (site === "linkedin") {
      const response = await axiosWithRetries(baseJobUrl);

      const data = response?.data;
      const dom = cheerio.load(data);
      const companyNameDOM = dom(".topcard__org-name-link");
      const companyName = companyNameDOM?.text().trim();
      const companyLink = `https://www.linkedin.com/company/${companyName.toLocaleLowerCase()}`;
      console.log("Company Link COMPLETED", companyLink);
      const companyUrl = await getWebsite(companyLink, site, browser);
      console.log("Company URL COMPLETED", companyUrl);
      const rawInformation = await getRawInformation(companyUrl, browser);
      console.log("Raw Information COMPLETED");
      const summarizedInformation = await summarizeInformation(rawInformation);
      return summarizedInformation || "No information available for this site";
    }

    if (site === "other") {
      return "No information available for this site";
    }
  } catch (error) {
    console.error("Error fetching the company name: ", error.message);
    return "No information available for this site";
  } finally {
    browser.close();
  }
}

function getSiteName(url: string) {
  const domain = new URL(url).hostname;
  if (domain.includes("linkedin")) {
    return "linkedin";
  } else {
    return "other";
  }
}
