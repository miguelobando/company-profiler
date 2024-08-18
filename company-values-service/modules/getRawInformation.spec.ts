import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Browser, Page } from 'puppeteer';
import axios from 'axios';
import getRawInformation from './getRawInformation';

vi.mock('puppeteer');
vi.mock('axios');

describe('getRawInformation', () => {
  let mockBrowser: Browser;
  let mockPage: Page;

  // Just to avoid console.log in tests
  const consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    mockPage = {
      goto: vi.fn(),
      evaluate: vi.fn(),
      close: vi.fn(),
    } as unknown as Page;

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
    } as unknown as Browser;

    (axios.get as any).mockReset();
    (mockPage.goto as any).mockReset();
    (mockPage.evaluate as any).mockReset();
    (mockPage.close as any).mockReset();
  });

  afterEach(() => {
    consoleLogMock.mockClear();
  });

  it('should return an empty array when no valid routes are found', async () => {
    (axios.get as any).mockRejectedValue(new Error('Page not found'));

    const result = await getRawInformation('http://example.com', mockBrowser);

    expect(result).toEqual([]);
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.close).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled(); // Ensure logging occurred
  });

  it('should scrape content from valid routes', async () => {
    (axios.get as any)
      .mockResolvedValueOnce({ status: 200 })
      .mockResolvedValueOnce({ status: 404 });
    (mockPage.goto as any).mockResolvedValueOnce(undefined);
    (mockPage.evaluate as any).mockResolvedValueOnce('Page content');

    const result = await getRawInformation('http://example.com', mockBrowser);

    expect(result).toEqual(['Page content']);
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.goto).toHaveBeenCalledWith('http://example.com/about', {
      waitUntil: 'networkidle2',
    });
    expect(mockPage.evaluate).toHaveBeenCalled();
    expect(mockPage.close).toHaveBeenCalled();
  });

  it('should handle multiple valid routes', async () => {
    (axios.get as any)
      .mockResolvedValueOnce({ status: 200 })
      .mockResolvedValueOnce({ status: 200 });
    (mockPage.goto as any).mockResolvedValue(undefined);
    (mockPage.evaluate as any)
      .mockResolvedValueOnce('Page content 1')
      .mockResolvedValueOnce('Page content 2');

    const result = await getRawInformation('http://example.com', mockBrowser);

    expect(result).toEqual(['Page content 1', 'Page content 2']);
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.goto).toHaveBeenCalledWith('http://example.com/about', {
      waitUntil: 'networkidle2',
    });
    expect(mockPage.goto).toHaveBeenCalledWith('http://example.com/about-us', {
      waitUntil: 'networkidle2',
    });
    expect(mockPage.evaluate).toHaveBeenCalledTimes(2);
    expect(mockPage.close).toHaveBeenCalled();
  });
});