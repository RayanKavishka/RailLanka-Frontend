import { createContext, useEffect, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { getMyDetails } from "../services/authService";

export interface IUser {
    fullName: string;
    email: string;
    roles: string[];    
}

type AuthContextTypes = {
    user: IUser | null,
    setUser: Dispatch<SetStateAction<IUser | null>>,
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextTypes | null>(null);

interface AuthProviderProps {
    children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {

    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem("ACCESS_TOKEN");
        if (accessToken) {
            setIsLoading(true);

            getMyDetails()
                .then((res) => {
                    if (res.data.body) {
                        setUser(res.data.body);
                    }
                })

                .catch((error) => {
                    console.error(error);
                    setUser(null);
                })

                .finally(() => {
                    setIsLoading(false);
                })

        } else {
            setIsLoading(false);
            setUser(null);
        }

    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}


export default AuthProvider;