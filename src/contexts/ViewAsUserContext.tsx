import React, { createContext, useContext, useState, useCallback } from "react";

interface ViewAsUserContextType {
  isViewingAsUser: boolean;
  enableViewAsUser: () => void;
  disableViewAsUser: () => void;
  toggleViewAsUser: () => void;
}

const ViewAsUserContext = createContext<ViewAsUserContextType>({
  isViewingAsUser: false,
  enableViewAsUser: () => {},
  disableViewAsUser: () => {},
  toggleViewAsUser: () => {},
});

export const ViewAsUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isViewingAsUser, setIsViewingAsUser] = useState(false);

  const enableViewAsUser = useCallback(() => {
    setIsViewingAsUser(true);
  }, []);

  const disableViewAsUser = useCallback(() => {
    setIsViewingAsUser(false);
  }, []);

  const toggleViewAsUser = useCallback(() => {
    setIsViewingAsUser(prev => !prev);
  }, []);

  return (
    <ViewAsUserContext.Provider value={{ 
      isViewingAsUser, 
      enableViewAsUser, 
      disableViewAsUser,
      toggleViewAsUser 
    }}>
      {children}
    </ViewAsUserContext.Provider>
  );
};

export const useViewAsUser = () => useContext(ViewAsUserContext);
