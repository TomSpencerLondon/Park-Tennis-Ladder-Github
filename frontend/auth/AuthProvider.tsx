import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookie from 'js-cookie'
import fetch from 'isomorphic-fetch'
import {logout} from '../lib/auth'

type AuthType = {
  user?: any;  // @TODO fix any
  idToken?: string; 
  isAuthenticated: boolean;
  setUser?: React.Dispatch<any>; 
  logout?: any;
}

export const AuthContext = createContext<AuthType>({ isAuthenticated: false });

export default function AuthProvider({ children }: any) {

  const [user, setUser] = useState(null);

  useEffect(() => {
    // grab token value from cookie
    const token = Cookie.get("token");
    if (token) {
      // authenticate the token on the server and place set user object
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        // if res comes back not valid, token is not valid
        // delete the token and log the user out on client
        if (!res.ok) {
          Cookie.remove("token")
          setUser(null)
          return null
        }
        const user = await res.json()
        setUser(user)
      });
    }
  }, []);

  function handleLogout() {
    logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setUser,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (value === undefined) {
    throw new Error('Expected context value to be set');
  }
  return value;
}