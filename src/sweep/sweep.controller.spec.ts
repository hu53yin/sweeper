import { Test, TestingModule } from '@nestjs/testing';
import { SweepController } from './sweep.controller';
import { SweepService } from './sweep.service';
import { SweepTokensDto } from './dto/sweep-tokens.dto';

describe('SweepController', () => {
  let controller: SweepController;
  let mockSweepService;

  beforeEach(async () => {
    mockSweepService = {
      sweepTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SweepController],
      providers: [{ provide: SweepService, useValue: mockSweepService }],
    }).compile();

    controller = module.get<SweepController>(SweepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sweepTokens', () => {
    it('should successfully sweep tokens and return the result', async () => {
      const mockData = new SweepTokensDto();
      const mockResponse = 'Mocked response';

      mockSweepService.sweepTokens.mockResolvedValueOnce(mockResponse);

      const result = await controller.sweepTokens(mockData);
      expect(result).toBe(mockResponse);
      expect(mockSweepService.sweepTokens).toHaveBeenCalledWith(mockData);
    });

    it('should throw an error when the service fails', async () => {
      const mockData = new SweepTokensDto();
      const mockError = new Error('Failed to sweep');

      mockSweepService.sweepTokens.mockRejectedValueOnce(mockError);

      await expect(controller.sweepTokens(mockData)).rejects.toThrowError(
        'Failed to sweep',
      );
      expect(mockSweepService.sweepTokens).toHaveBeenCalledWith(mockData);
    });
  });
});
