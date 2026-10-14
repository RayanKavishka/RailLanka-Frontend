const Loading = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>

            <p className="animate-pulse text-sm font-medium text-gray-500">
                Loading...
            </p>
        </div>
    );
};

export default Loading;
