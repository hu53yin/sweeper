import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EthGasStationService {
  constructor() {}

  async getGasPrice(): Promise<bigint> {
    const response = await axios.get(
      'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
    );

    const prices = response.data.result;

    return BigInt(prices.FastGasPrice) * BigInt(1e9);
  }
}
