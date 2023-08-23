import { Test, TestingModule } from '@nestjs/testing';
import { SweepService } from './sweep.service';
import { EthGasStationService } from '../eth-gas-station/eth-gas-station.service';
import { WalletService } from '../wallet/wallet.service';
import { ProviderService } from '../provider/provider.service';

jest.mock('../eth-gas-station/eth-gas-station.service');
jest.mock('../wallet/wallet.service');
jest.mock('../provider/provider.service');

describe('SweepService', () => {
  let service: SweepService;

  const mockWalletService = {
    wallet: {
      signTransaction: jest.fn().mockResolvedValue({
        rawTransaction: '0x',
      }),
    },
  };

  const mockProviderService = {
    getBalance: jest.fn(),
    provider: {
      eth: {
        estimateGas: jest.fn().mockResolvedValue('100n'),
        sendSignedTransaction: jest.fn(),
      },
    },
    getGasPrice: jest.fn(),
    getTokenContract: jest.fn().mockReturnValue({
      methods: {
        balanceOf: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('0'),
        }),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: WalletService, useValue: mockWalletService },
        { provide: ProviderService, useValue: mockProviderService },
        EthGasStationService,
        SweepService,
      ],
    }).compile();

    service = module.get<SweepService>(SweepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sweepTokens', () => {
    const dto = {
      depositAddresses: ['depositAddress1'],
      destinationAddress: 'destinationAddress',
      erc20Addresses: ['erc20Address1'],
    };

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should not sweep ERC20 tokens when token balance is 0', async () => {
      const mockTokenContract = {
        methods: {
          balanceOf: jest
            .fn()
            .mockReturnValue({ call: jest.fn().mockResolvedValue(0n) }),
          transfer: jest.fn(),
        },
      } as any;

      mockProviderService.getTokenContract.mockReturnValue(mockTokenContract);

      await service.sweepTokens(dto);

      expect(mockTokenContract.methods.transfer).not.toHaveBeenCalled();
      expect(mockWalletService.wallet.signTransaction).not.toHaveBeenCalled();
    });
  });
});
