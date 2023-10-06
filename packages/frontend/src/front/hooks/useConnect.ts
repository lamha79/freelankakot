import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { API_URL } from '../../front-provider/src/api';
import { SiweMessage } from 'siwe';
import { getNonceApi, signInWithEthereumApi } from '../services/auth';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

interface LoginProps {
  address: `0x${string}`;
  chain: { id: number; unsupported?: boolean };
}

export function useConnect() {
  const {
    activeChain,
    switchActiveChain,
    connect,
    disconnect,
    isConnecting,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()
  const { pathname } = useRouter();

  const signIn = useCallback(
    async ({ address, chain }: LoginProps) => {
      if (chain.unsupported) return;
      if (address && chain && chain.unsupported === false && pathname === '/') {
        try {
          const nonce = await getNonceApi(address);
          const message = null;
          const user = null;
          return user;
        } catch (error: any) {
          disconnect;
          if (error.response) {
            return error.response.data.message;
          }
          if (error.message) {
            return error.message;
          }
        }
      }
    },
    [disconnect]
  );

  return { signIn };
}
