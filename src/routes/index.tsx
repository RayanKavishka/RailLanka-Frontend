import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PassengerLayout from "../layouts/PassengerLayout";
import PassengerDashboard from "../pages/passenger/PassengerDashboard";
import InspectorLayout from "../layouts/InspectorLayout";
import InspectorDashboard from "../pages/inspector/InspectorDashboard";
import RequireAuth from "./RequireAuth";
import Landing from "../pages/Landing";
import PublicRoute from "./PublicRoute";

const AppRouter = () => {
    return (
        <BrowserRouter>
        <Toaster position="top-right" richColors />

        <Routes>
            {/* Protected Routes */}

            {/* Admin */}
            <Route path="/admin" element={
                <RequireAuth roles={["ADMIN"]}>
                    <AdminLayout />
                </RequireAuth>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="stations" element />
                <Route path="payments" element />
                <Route path="routes" element />
                <Route path="passengers" element />
                <Route path="inspectors" element />
                <Route path="profile" element />
            </Route>


            {/* Passenger */}
            <Route path="/passenger" element={
                <RequireAuth roles={["PASSENGER"]}>
                    <PassengerLayout />
                </RequireAuth>
            }>
                <Route index element={<PassengerDashboard />} />
                <Route path="profile" element />
                <Route path="tickets" element />
                <Route path="trains" element />
                <Route path="routes" element />
            </Route>


            {/* Ticket Inspector */}
            <Route path="/inspector" element={
                <RequireAuth roles={["TICKET_INSPECTOR"]}>
                    <InspectorLayout />
                </RequireAuth>
            }>
                <Route index element={<InspectorDashboard />} />
                <Route path="profile" element />
                <Route path="scan-qr" element />
            </Route>

            {/* Public Routes */}
            <Route path="/" element={<PublicRoute />}>
                <Route index element={<Landing />}/>
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
            </Route>
        </Routes>
        </BrowserRouter>
  );
}



export default AppRouter;