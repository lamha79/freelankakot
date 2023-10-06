import { Button, Flex, IconButton, Text } from '@chakra-ui/react';
import { useCurrentUser, useLanding } from '../../../front-provider/src';
import { FC } from 'react';
import LoginButton from '../button/LoginButton';
import NotificationIcon from '../icons/NotificationIcon';
import MessageIcon from '../icons/MessageIcon';
import { shortHash } from '../../../utility/src';
import { useRouter } from 'next/router';
import { useResponsive } from '../../../front/hooks/useResponsive';

interface HeaderButtonProps {
  onCloseMenu?: () => void
}

const HeaderButton: FC<HeaderButtonProps> = ({onCloseMenu}) => {
  const { user, logout } = useCurrentUser();
  const { signupModalOpen, setSignupModalOpen } = useLanding();
  const { push, pathname } = useRouter();
  const {mobileDisplay} = useResponsive();

  const handleLogout = () => {
    if (mobileDisplay && onCloseMenu) {
      onCloseMenu();
    }
    logout();
  }

  const handleNavigate = () => {
    if (mobileDisplay && onCloseMenu) {
      onCloseMenu();
    }
    push('/dashboard/chat');
  };

  return (
    <Flex justifyContent={{base: 'center', lg: 'normal'}}>
      {!user && (
        <>
          <LoginButton signupModalOpen={signupModalOpen} mr={{base: 0, md: 4, xl: 8}}>
            Login
          </LoginButton>
          <Button backgroundColor={"#fdb81e"} borderRadius={"32"} variant="primary" ml={{base: 0, md: 4, xl: 8}} size="md" onClick={() => { if (mobileDisplay && onCloseMenu) {
      onCloseMenu();
    }
    setSignupModalOpen(true);}}>
            Sign up
          </Button>
        </>
      )}
      {user && (
        <Flex alignItems="center" columnGap={{base: 8, md: 4, xl: 8}} flexDir={{base: 'column', lg: 'row'}} rowGap={4}>
          <Flex display={{base: 'none', lg: 'flex'}} alignItems="center" columnGap={4}>
            <IconButton
              variant="icon"
              bgColor={pathname === '/dashboard/chat' ? 'brand.primary' : ''}
              transition="all ease-in-out 250ms"
              _hover={{
                color: pathname === '/dashboard/chat' ? 'brand.primary' : 'brand.primary',
                bgColor: pathname === '/dashboard/chat' ? 'neutral.dsDarkGray' : ''
              }}
              aria-label="Message Icon"
              icon={<MessageIcon />}
              onClick={handleNavigate}
            />
            <IconButton variant="icon" aria-label="Message Icon" icon={<NotificationIcon />} />
          </Flex>
          <Text fontFamily="Comfortaa" fontWeight="600" cursor="initial">
            {shortHash(user.wallet, { padLeft: 6, padRight: 4, separator: '...' })}
          </Text>
          <Button variant="outline" size="md" onClick={handleLogout}>
            Disconnect
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default HeaderButton;
