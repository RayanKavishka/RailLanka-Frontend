import { Navigate, Outlet } from "react-router-dom"
import useAuthContext from "../hooks/useAuth";

const PublicRoute = () => {

    const { activeRole } = useAuthContext();
    const accessToken = localStorage.getItem("ACCESS_TOKEN");

    if (accessToken) {
        let path = "/";

        if (activeRole === "ADMIN") {
            path = "/admin";

        } else if (activeRole == "PASSENGER") {
            path = "/passenger";

        } else if (activeRole === "TICKET_INSPECTOR") {
            path = "inspector";

        } else {
            path = "/";
        }

        return <Navigate to={path} replace />
    }

    return <Outlet />
}



export default PublicRoute