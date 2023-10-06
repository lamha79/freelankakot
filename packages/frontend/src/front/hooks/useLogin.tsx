import { useToast, Text } from '@chakra-ui/react';
import { CurrentUserContext, useLanding } from '../../front-provider/src';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useConnect } from './useConnect';

export const useLogin = (signupModalOpen: boolean) => {
  const { signIn } = useConnect();
  const { setType } = useLanding();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  }, []);

  return { isLoading };
};
