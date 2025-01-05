import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorServiceToken } from '@ecohatch/utils-api';

import { Health } from '../../types';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let mockTranslatorService: {
    t: jest.Mock;
  };
  let mockPrismaService: {
    ping: jest.Mock;
  };

  beforeEach(async () => {
    // Create mock translator service
    mockTranslatorService = {
      t: jest.fn(),
    };
    // Create mock prisma service
    mockPrismaService = {
      ping: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: TranslatorServiceToken,
          useValue: mockTranslatorService,
        },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(healthService).toBeDefined();
    });

    it('should have translator service injected', () => {
      expect(healthService['_translatorService']).toBeDefined();
      expect(healthService['_prismaService']).toBeDefined();
    });

    it('should throw error when translator service is not provided', async () => {
      await expect(
        Test.createTestingModule({
          providers: [HealthService], // No translator, prisma service provided
        }).compile()
      ).rejects.toThrow();
    });
  });

  describe('health', () => {
    it('should return correct health structure', async () => {
      mockTranslatorService.t.mockReturnValue('OK');
      mockPrismaService.ping.mockResolvedValue(true);

      const result = await healthService.health();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('database');
      expect(result.database).toHaveProperty('message');
      expect(result.database).toHaveProperty('status');
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });

    it('should use translator service for status', async () => {
      const expectedStatus = 'Translated OK';
      mockTranslatorService.t.mockReturnValue(expectedStatus);

      const result = await healthService.health();

      expect(mockTranslatorService.t).toHaveBeenCalledWith('common.success.ok');
      expect(result.status).toBe(expectedStatus);
    });

    it('should return consistent message format', async () => {
      mockTranslatorService.t.mockReturnValue('OK');

      const firstCall = await healthService.health();
      const secondCall = await healthService.health();

      expect(firstCall.message).toBe(secondCall.message);
    });

    it('should handle translator service returning empty string', async () => {
      mockTranslatorService.t.mockReturnValue('');

      const result = await healthService.health();

      expect(result.status).toBe('');
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });

    it('should handle translator service returning null', async () => {
      mockTranslatorService.t.mockReturnValue(null);

      const result = await healthService.health();

      expect(result.status).toBe(null);
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });

    it('should maintain Health type contract', async () => {
      mockTranslatorService.t.mockReturnValue('OK');

      const result = await healthService.health();

      const healthCheck: Health = result; // Type assertion should not fail
      expect(healthCheck).toEqual({
        message: 'health.success.Server_is_up_and_running',
        status: 'OK',
      });
    });
  });

  describe('error handling', () => {
    it('should handle translator service throwing error', () => {
      mockTranslatorService.t.mockImplementation(() => {
        throw new Error('Translation failed');
      });

      expect(() => healthService.health()).toThrow('Translation failed');
    });

    it('should handle translator service returning undefined', async () => {
      mockTranslatorService.t.mockReturnValue(undefined);

      const result = await healthService.health();

      expect(result.status).toBeUndefined();
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });
  });

  describe('service lifecycle', () => {
    it('should maintain singleton scope', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          HealthService,
          {
            provide: TranslatorServiceToken,
            useValue: mockTranslatorService,
          },
        ],
      }).compile();

      const service1 = module.get(HealthService);
      const service2 = module.get(HealthService);

      expect(service1).toBe(service2);
    });
  });
});
