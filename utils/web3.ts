import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';

const injected = injectedModule();

export const web3Onboard = init({
  wallets: [injected],
  chains: [{
    id: 2828,
    token: 'LYXt',
    label: 'LUKSO L16',
    rpcUrl: 'https://rpc.l16.lukso.network'
  }]
});