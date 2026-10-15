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
    isLoading: boolean,
    activeRole: string,
    setActiveRole:  Dispatch<SetStateAction<string>>
}

export const AuthContext = createContext<AuthContextTypes | null>(null);

interface AuthProviderProps {
    children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {

    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeRole, setActiveRole] = useState("UNKNOWN");

    useEffect(() => {
        const accessToken = localStorage.getItem("ACCESS_TOKEN");
        if (accessToken) {
            setIsLoading(true);

            getMyDetails()
                .then((res) => {
                    const userData = res.data.body;

                    if (userData) {
                        setUser(userData);
                    }

                    if (userData?.roles.includes("ADMIN")) {
                        setActiveRole("ADMIN");

                    } else if (!userData?.roles.includes("ADMIN") && userData?.roles.includes("TICKET_INSPECTOR")) {
                        setActiveRole("TICKET_INSPECTOR");

                    } else if (!userData?.roles.includes("ADMIN") &&
                        !userData?.roles.includes("TICKET_INSPECTOR") &&
                        userData?.roles.includes("PASSENGER")) 
                    {
                        setActiveRole("PASSENGER");

                    } else {
                        setActiveRole("UNKNOWN");
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
            setActiveRole("UNKNOWN");
        }

    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, activeRole, setActiveRole }}>
            {children}
        </AuthContext.Provider>
    )
}


export default AuthProvider;