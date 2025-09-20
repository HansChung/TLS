import { DefaultLogger } from '../../src/utils/logger';

describe('DefaultLogger', () => {
  let logger: DefaultLogger;
  let consoleSpy: {
    debug: jest.SpyInstance;
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    logger = new DefaultLogger('debug');
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('Log Level Filtering', () => {
    it('should log all levels when set to debug', () => {
      logger.setLogLevel('debug');

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should filter debug messages when set to info', () => {
      logger.setLogLevel('info');

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should only log error messages when set to error', () => {
      logger.setLogLevel('error');

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message Formatting', () => {
    it('should format messages with timestamp and log level', () => {
      logger.info('test message');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: test message$/)
      );
    });

    it('should include additional arguments in the log message', () => {
      const testObject = { key: 'value' };
      logger.info('test message', testObject);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/INFO: test message \[{\"key\":\"value\"}\]$/)
      );
    });
  });

  describe('Log Level Management', () => {
    it('should return the current log level', () => {
      logger.setLogLevel('warn');
      expect(logger.getLogLevel()).toBe('warn');
    });

    it('should default to info log level', () => {
      const defaultLogger = new DefaultLogger();
      expect(defaultLogger.getLogLevel()).toBe('info');
    });
  });
});