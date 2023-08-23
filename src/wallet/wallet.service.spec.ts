import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import * as bip39 from 'bip39';
import * as ethereumjsWallet from 'ethereumjs-wallet';
import { ProviderService } from '../provider/provider.service';

jest.mock('bip39');
jest.mock('ethereumjs-wallet');

describe('WalletService', () => {
  let service: WalletService;
  let mockMnemonicToSeedSync: jest.Mock;
  let mockFromMasterSeed: jest.Mock;
  let mockDerivePath: jest.Mock;
  let mockGetWallet: jest.Mock;
  let mockPrivateKeyToAccount: jest.Mock;
  let mockProviderService: any;

  beforeEach(async () => {
    mockMnemonicToSeedSync = bip39.mnemonicToSeedSync as jest.Mock;
    mockFromMasterSeed = ethereumjsWallet.hdkey
      .fromMasterSeed as unknown as jest.Mock;
    mockDerivePath = jest.fn();
    mockGetWallet = jest.fn();

    mockFromMasterSeed.mockReturnValue({
      derivePath: mockDerivePath,
    });

    mockDerivePath.mockReturnValue({
      getWallet: mockGetWallet,
    });

    mockGetWallet.mockReturnValue({
      getPrivateKey: jest.fn(() => 'private-key'),
    });

    mockPrivateKeyToAccount = jest.fn();

    mockProviderService = {
      provider: {
        eth: {
          accounts: {
            privateKeyToAccount: mockPrivateKeyToAccount,
          },
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: ProviderService,
          useValue: mockProviderService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    delete process.env.ADMIN_WALLET_SEED;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set up Web3 wallet if seed is provided', () => {
    process.env.ADMIN_WALLET_SEED = 'test-seed';
    mockMnemonicToSeedSync.mockReturnValue(Buffer.from([]));

    service = new WalletService(mockProviderService);

    expect(mockMnemonicToSeedSync).toHaveBeenCalledWith('test-seed');
    expect(mockFromMasterSeed).toHaveBeenCalled();
    expect(mockDerivePath).toHaveBeenCalledWith("m/44'/60'/0'/0/0");
    expect(mockGetWallet).toHaveBeenCalled();
    expect(mockPrivateKeyToAccount).toHaveBeenCalledWith('0x' + 'private-key');
  });

  it('should not setup Web3 wallet if seed is not provided', () => {
    delete process.env.ADMIN_WALLET_SEED;

    service = new WalletService(mockProviderService);

    expect(mockMnemonicToSeedSync).not.toHaveBeenCalled();
    expect(mockFromMasterSeed).not.toHaveBeenCalled();
    expect(mockDerivePath).not.toHaveBeenCalled();
    expect(mockGetWallet).not.toHaveBeenCalled();
    expect(mockPrivateKeyToAccount).not.toHaveBeenCalled();
  });
});
