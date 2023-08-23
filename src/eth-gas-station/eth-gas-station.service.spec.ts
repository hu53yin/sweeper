import { Test, TestingModule } from '@nestjs/testing';
import { EthGasStationService } from './eth-gas-station.service';
import axios from 'axios';

jest.mock('axios');

describe('EthGasStationService', () => {
  let service: EthGasStationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EthGasStationService],
    }).compile();

    service = module.get<EthGasStationService>(EthGasStationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct gas price in wei', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        result: {
          FastGasPrice: '100',
        },
      },
    });

    const expectedGasPriceInWei = BigInt(100) * BigInt(1e9);
    const gasPrice = await service.getGasPrice();

    expect(gasPrice).toEqual(expectedGasPriceInWei);
  });
});
