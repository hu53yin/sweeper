import { Test, TestingModule } from '@nestjs/testing';
import { ProviderService } from './provider.service';
import Web3 from 'web3';

jest.mock('web3');

const mockedWeb3 = Web3 as jest.Mocked<typeof Web3>;

describe('ProviderService', () => {
  let service: ProviderService;

  const mockGetGasPrice = jest.fn();
  const mockGetBalance = jest.fn();
  const mockContract = jest.fn();

  beforeEach(async () => {
    mockedWeb3.prototype.eth = {
      getGasPrice: mockGetGasPrice,
      getBalance: mockGetBalance,
      Contract: mockContract,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderService],
    }).compile();

    service = module.get<ProviderService>(ProviderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get gas price', async () => {
    const mockValue = '100n';
    mockGetGasPrice.mockResolvedValue(mockValue);

    const result = await service.getGasPrice();

    expect(result).toEqual(mockValue);
    expect(mockGetGasPrice).toHaveBeenCalled();
  });

  it('should get balance for an address', async () => {
    const mockAddress = '0x';
    const mockBalanceValue = '200n';
    mockGetBalance.mockResolvedValue(mockBalanceValue);

    const result = await service.getBalance(mockAddress);

    expect(result).toEqual(mockBalanceValue);
    expect(mockGetBalance).toHaveBeenCalledWith(mockAddress);
  });

  it('should get token contract', () => {
    const mockAddress = '0x';
    service.getTokenContract(mockAddress);

    expect(mockContract).toHaveBeenCalledWith(expect.anything(), mockAddress);
  });
});
