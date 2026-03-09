import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../axiosClient.js";
import { StateContext } from "./useStateContext.js";

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

        let isMounted = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        axiosClient.get("/me")
            .then(({ data }) => {
                if (isMounted) setUser(data.user ?? data);
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("Fetch /me failed:", err);
                    setToken(null);
                    setUser(null);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
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