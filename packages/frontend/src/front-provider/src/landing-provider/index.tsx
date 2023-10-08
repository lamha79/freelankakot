/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, ReactNode, useContext, useState } from 'react';
import { UserTypeEnum } from '../../../utility/src';

export type ViewType = UserTypeEnum;

type LandingContextInterface = {
  type: ViewType;
  currentView: string;
  signupModalOpen: boolean;
  activeAccountUser: boolean;
  hasScroll: boolean;
  setType: (user: ViewType) => void;
  setCurrentView: (view: string) => void;
  setSignupModalOpen: (open: boolean) => void;
  setActiveAccountUser: (open: boolean) => void;
  setHasScroll: (hasScroll: boolean) => void;
};

export const LandingContext = createContext<LandingContextInterface>({
  type: UserTypeEnum.Freelancer,
  currentView: '',
  signupModalOpen: false,
  activeAccountUser: false, 
  hasScroll: false,
  setType: () => {},
  setCurrentView: () => {},
  setSignupModalOpen: () => {},
  setActiveAccountUser: () => {},
  setHasScroll: () => {}
});

export const LandingProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<ViewType>(UserTypeEnum.Freelancer);
  const [currentView, setCurrentView] = useState<string>('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [activeAccountUser, setActiveAccountUser] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);

  return (
    <LandingContext.Provider
      value={{
        type,
        currentView,
        signupModalOpen,
        hasScroll,
        activeAccountUser, 
        setType,
        setCurrentView,
        setSignupModalOpen,
        setActiveAccountUser,
        setHasScroll
      }}
    >
      {children}
    </LandingContext.Provider>
  );
};

export function useLanding() {
  const {
    type,
    currentView,
    signupModalOpen,
    hasScroll,
    activeAccountUser, 
    setType,
    setCurrentView,
    setSignupModalOpen,
    setActiveAccountUser,
    setHasScroll
  } = useContext(LandingContext);

  const handleViewChange = (inView: boolean, entry: IntersectionObserverEntry) => {
    if (inView) {
      setCurrentView(entry.target.id);
    }
  };

  const handleScroll = (el: HTMLElement) => {
    if (el.scrollTop === 0) {
      setHasScroll(false);
    } else {
      setHasScroll(true);
    }
  };

  return {
    type,
    currentView,
    signupModalOpen,
    hasScroll,
    activeAccountUser, 
    setType,
    handleViewChange,
    setCurrentView,
    setSignupModalOpen,
    setActiveAccountUser, 
    handleScroll,
    setHasScroll
  };
}
