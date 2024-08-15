import { Test } from '@nestjs/testing';
import { LogService } from './log.service';

describe('LogService', () => {
  let service: LogService;
  let originalConsoleLog: typeof console.log;

  beforeAll(() => {
    // Save the original console.log
    originalConsoleLog = console.log;

    // Mock console.log to suppress output
    console.log = jest.fn();
  });

  afterAll(() => {
    // Restore the original console.log after all tests
    console.log = originalConsoleLog;
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LogService],
    }).compile();

    service = module.get<LogService>(LogService);
  });

  it('should log a message with format [timestamp] module - info - message when logMessage is called', () => {
    const mockDate = new Date('2023-10-10T16:40:00');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    const consoleLogSpy = jest.spyOn(console, 'log');

    const formattedDate = '10/10/2023, 16:40';
    service.logMessage('module', 'message');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `[${formattedDate}] module - info - message`,
    );
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should log an error message with format [timestamp] module - error - message when logError is called', () => {
    const mockDate = new Date('2023-10-10T16:40:00');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    const consoleLogSpy = jest.spyOn(console, 'log');

    const formattedDate = '10/10/2023, 16:40';
    service.logError('module', 'message');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `[${formattedDate}] module - error - message`,
    );
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });
});
