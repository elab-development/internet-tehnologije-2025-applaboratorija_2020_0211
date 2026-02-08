import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../axiosClient.js";

const StateContext = createContext({
    user: null,
    token: null,
    loading: false,
    setUser: () => {},
    setToken: () => {},
});

export const ContextProvider = ({ children }) => {
    const [user, _setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [loading, setLoading] = useState(!!localStorage.getItem("ACCESS_TOKEN"));
    const setToken = useCallback((token) => {
        _setToken(token);
        if (token) localStorage.setItem("ACCESS_TOKEN", token);
        else localStorage.removeItem("ACCESS_TOKEN");
    }, []);

    const setUser = useCallback((user) => {
        _setUser(user);
    }, []);

    useEffect(() => {
        if (!token) return;

        setLoading(true);
        axiosClient.get("/me")
            .then(({ data }) => {
                setUser(data.user ?? data);
            })
            .catch((err) => {
                console.error("Fetch /me failed:", err);
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [token, setUser, setToken]);

    return (
        <StateContext.Provider value={{
            user,
            setUser,
            token,
            setToken,
            loading
        }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);