import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import resumeValues from './resumeValues'; 
import Groq from 'groq-sdk';

vi.mock('groq-sdk');

describe('resumeValues', () => {
  let mockGroq: any;

  beforeEach(() => {
    mockGroq = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };

    vi.mocked(Groq).mockImplementation(() => mockGroq);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should process data and return a summarized response', async () => {
    const testData = ['Test Company Info 1', 'Test Company Info 2'];
    const mockResponses = [
      { choices: [{ message: { content: 'Mock response 1' } }] },
      { choices: [{ message: { content: 'Mock response 2' } }] },
    ];
    const mockSummary = { choices: [{ message: { content: 'Final summary' } }] };

    mockGroq.chat.completions.create
      .mockResolvedValueOnce(mockResponses[0])
      .mockResolvedValueOnce(mockResponses[1])
      .mockResolvedValueOnce(mockSummary);

    const result = await resumeValues(testData);

    expect(result).toBe('Final summary');
    expect(mockGroq.chat.completions.create).toHaveBeenCalledTimes(3);
    expect(Groq).toHaveBeenCalledWith({
      apiKey: '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',
    });
  });

  it('should handle empty input data', async () => {
    const emptyData: string[] = [];
    const mockSummary = { choices: [{ message: { content: 'No information available' } }] };

    mockGroq.chat.completions.create.mockResolvedValue(mockSummary);

    const result = await resumeValues(emptyData);

    expect(result).toBe('No information available');
    expect(mockGroq.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    const testData = ['Test Company Info'];
    mockGroq.chat.completions.create.mockRejectedValue(new Error('API Error'));

    await expect(resumeValues(testData)).rejects.toThrow('API Error');
  });

  it('should use correct prompts for information scraping', async () => {
    const testData = ['Test Company Info'];
    const mockResponse = { choices: [{ message: { content: 'Mock response' } }] };
    const mockSummary = { choices: [{ message: { content: 'Final summary' } }] };

    mockGroq.chat.completions.create
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockSummary);

    await resumeValues(testData);

    const expectedPrompt = `Based on this information ${testData} 
            extract the following information if available:
            1. Company values
            2. Company mission
            3. Company culture
            No more than 280 characters or less thatn 100 words. If there is no information related, return "No information available `;

    expect(mockGroq.chat.completions.create).toHaveBeenCalledWith({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: expectedPrompt }],
      temperature: 0.5,
    });
  });

  it('should use correct prompt for summarizing answers', async () => {
    const testData = ['Test Company Info'];
    const mockResponse = { choices: [{ message: { content: 'Mock response' } }] };
    const mockSummary = { choices: [{ message: { content: 'Final summary' } }] };

    mockGroq.chat.completions.create
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockSummary);

    await resumeValues(testData);

    const expectedPrompt = `Based on this information Mock response,
    summarize the information in a single paragraph. 
    No more than 100 words.`;

    expect(mockGroq.chat.completions.create).toHaveBeenLastCalledWith({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: expectedPrompt }],
      temperature: 0.5,
    });
  });
});