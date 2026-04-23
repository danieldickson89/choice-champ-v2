import { createContext } from "react";

// Create context is used to create a context object that can be used to pass data
// to components that are not direct children of the component that created the context
export const AuthContext = createContext({
    isLoggedIn: false,
    userId: null,
    username: null,
    userIdSetter: null,
    usernameSetter: null,
    login: () => {},
    logout: () => {}
});