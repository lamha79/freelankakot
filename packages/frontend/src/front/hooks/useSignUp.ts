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
import { useCallback } from 'react';

interface SigupProps {
  address: `0x${string}`;
  chain: { id: number; unsupported?: boolean };
  email: string;
  firstname: string;
  lastname: string;
  currentUserType: string;
  agreeTOS: boolean;
  agreeDataTreatment: boolean;
}

export function useSignUp() {
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

  const signUp = useCallback(
    async ({
      address,
      chain,
      email,
      firstname,
      lastname,
      currentUserType,
      agreeTOS,
      agreeDataTreatment
    }: SigupProps): Promise<boolean | string> => {
      if (address && chain) {
        try {
          
        } catch (error: any) {
          return error.response.data.message;
        }
      }
      return 'Please link your wallet';
    },
    [disconnect]
  );

  return { signUp };
}
