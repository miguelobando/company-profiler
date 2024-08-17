import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getWebsite from './getWebsite'; 
import type { Browser, Page } from 'puppeteer';

vi.mock('puppeteer');

vi.spyOn(console, 'log').mockImplementation(() => {});

describe('getWebsite', () => {
  let mockBrowser: Browser;
  let mockPage: Page;

  beforeEach(() => {
    mockPage = {
      goto: vi.fn(),
      type: vi.fn(),
      click: vi.fn(),
      waitForNavigation: vi.fn(),
      waitForSelector: vi.fn(),
      evaluate: vi.fn(),
      close: vi.fn(),
    } as unknown as Page;

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
    } as unknown as Browser;

    // Reset environment variables
    process.env.LINKEDIN_EMAIL = undefined;
    process.env.LINKEDIN_PASSWORD = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the cleaned URL for a LinkedIn site', async () => {
    process.env.LINKEDIN_EMAIL = 'ciberaries64@gmail.com';
    process.env.LINKEDIN_PASSWORD = 'miguel123!';
  
    const url = 'https://www.linkedin.com/company/example';
    const websiteURL = 'https://www.example.com';
    
    (mockPage.evaluate as any).mockResolvedValue(websiteURL);
    (mockPage.goto as any).mockResolvedValue({ url: () => websiteURL });
  
    const result = await getWebsite(url, 'linkedin', mockBrowser);
  
    expect(result).toBe('www.example.com');
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(mockPage.goto).toHaveBeenCalledWith('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
    expect(mockPage.type).toHaveBeenCalledWith('#username', 'ciberaries64@gmail.com');
    expect(mockPage.type).toHaveBeenCalledWith('#password', 'miguel123!');
    expect(mockPage.click).toHaveBeenCalledWith('button.btn__primary--large.from__button--floating[data-litms-control-urn="login-submit"]');
    expect(mockPage.waitForNavigation).toHaveBeenCalledTimes(1);
    expect(mockPage.goto).toHaveBeenCalledWith(`${url}/about/`, { waitUntil: 'networkidle2' });
    expect(mockPage.waitForSelector).toHaveBeenCalledWith('.org-page-details-module__card-spacing a .link-without-visited-state');
    expect(mockPage.evaluate).toHaveBeenCalledTimes(1);
    expect(mockPage.goto).toHaveBeenCalledWith('https://www.linkedin.com/logout');
    expect(mockPage.goto).toHaveBeenCalledWith(websiteURL, { waitUntil: 'networkidle2' });
    expect(mockPage.close).toHaveBeenCalledTimes(1);
  });

  it('should use environment variables for LinkedIn credentials when provided', async () => {
    process.env.LINKEDIN_EMAIL = 'test@example.com';
    process.env.LINKEDIN_PASSWORD = 'testpassword';

    await getWebsite('https://www.linkedin.com/company/example', 'linkedin', mockBrowser);

    expect(mockPage.type).toHaveBeenCalledWith('#username', 'test@example.com');
    expect(mockPage.type).toHaveBeenCalledWith('#password', 'testpassword');
  });

  it('should return "No information available for this site" when non-LinkedIn sites', async () => {
    const result = await getWebsite('https://www.example.com', 'other', mockBrowser);

    expect(result).toBe('No information available for this site');
    expect(mockBrowser.newPage).not.toHaveBeenCalled();
  });

  it('should handle errors and return "No information available for this site" when no about page is found', async () => {
    (mockBrowser.newPage as any).mockRejectedValue(new Error('Test error'));

    const result = await getWebsite('https://www.linkedin.com/company/example', 'linkedin', mockBrowser);

    expect(result).toBe('No information available for this site');
    expect(console.log).toHaveBeenCalledWith('No about page found');
  });
});