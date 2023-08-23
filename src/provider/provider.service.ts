import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import ERC20_ABI from './contracts/ABI';

@Injectable()
export class ProviderService {
  provider: Web3;

  constructor() {
    this.setupProvider();
  }

  private setupProvider() {
    const networkName = process.env.PROVIDER_ALCHEMY_ETHEREUM_SEPOLIA;

    this.provider = new Web3(new Web3.providers.HttpProvider(networkName));
  }

  async getGasPrice(): Promise<bigint> {
    return await this.provider.eth.getGasPrice();
  }

  async getBalance(address: string): Promise<bigint> {
    return await this.provider.eth.getBalance(address);
  }

  getTokenContract(address: string) {
    return new this.provider.eth.Contract(ERC20_ABI, address);
  }
}
