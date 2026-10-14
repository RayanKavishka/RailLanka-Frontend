import AuthProvider from "./context/AuthContext";
import AppRouter from "./routes";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
