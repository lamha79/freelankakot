import { useCurrentUser } from '@workfreelankakot/front-provider';
import { User } from '@workfreelankakot/utils';
import { useCallback, useState } from 'react';
import { updateUserProfile } from '../services/user';

export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useCurrentUser();

  const updateProfile = useCallback(
    async (updatedUser: Partial<User>) => {
      setLoading(true);
      const res = await updateUserProfile(updatedUser);
      setUser(res);
      setLoading(false);
    },
    [setUser]
  );

  return { loading, updateProfile };
};
