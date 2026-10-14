import { ShieldX } from "lucide-react";

const AccessDenied = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <ShieldX className="h-10 w-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Access Denied
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                Sorry, you don't have permission to access this page.
                Please contact your administrator if you believe this is a mistake.
            </p>
        </div>
    );
};

export default AccessDenied;
