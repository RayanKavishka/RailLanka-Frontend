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
import RoutePage from "../pages/admin/RoutePage";
import SearchedRoutesPage from "../pages/passenger/SearchedRoutesPage";
import ScrollToTop from "../components/ScrollToTop";
import BookingDetailsPage from "../pages/passenger/BookingDetailsPage";
import PaymentPage from "../pages/passenger/PaymentPage";
import TicketConfirmationPage from "../pages/passenger/TicketConfirmationPage";
import StationsPage from "../pages/admin/StationsPage";
import AdminsPage from "../pages/admin/AdminsPage";
import InspectorsPage from "../pages/admin/InspectorsPage";
import ScanPage from "../pages/inspector/ScanPage";
import PaymentsPage from "../pages/admin/PaymentsPage";

const AppRouter = () => {
    return (
        <BrowserRouter>
        <ScrollToTop />
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
                <Route path="stations" element={<StationsPage />} />
                <Route path="routes" element={<RoutePage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="admins" element={<AdminsPage />} />
                <Route path="inspectors" element={<InspectorsPage />} />
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
                <Route path="searched-routes" element={<SearchedRoutesPage />} />
                <Route path="booking" element={<BookingDetailsPage />} />
                <Route path="payment" element={<PaymentPage />}  />
                <Route path="payment-success" element={<TicketConfirmationPage />} />
                <Route path="payment-cancel" element={<TicketConfirmationPage cancelled />} />
            </Route>


            {/* Ticket Inspector */}
            <Route path="/inspector" element={
                <RequireAuth roles={["TICKET_INSPECTOR"]}>
                    <InspectorLayout />
                </RequireAuth>
            }>
                <Route index element={<InspectorDashboard />} />
                <Route path="profile" element />
                <Route path="scan" element={<ScanPage />} />
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