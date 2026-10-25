import { 
  createContext, 
  useContext, 
  useState 
} from "react";

interface AppContextType {
  user: any;
  setUser: (value: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }:{ children : any }) => {
  const [user, setUser] = useState({ name: "SoftMena", loggedIn: true });

  return (
    <AppContext.Provider value={{ 
      user, 
      setUser 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
