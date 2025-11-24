import { BrowserRouter, useLocation } from "react-router-dom";
import "./App.css";
import MainRoute from "./MainRoute";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import ThemeProvider from "./context/ThemeProvider";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

function AppContent() {
  const currentPath = useLocation();
  const isAdmin = currentPath.pathname.startsWith("/admin");
  const isFranchise = currentPath.pathname.startsWith("/franchise");

  return (
    <>
      {!isAdmin && !isFranchise && <Navigation/>}
      <MainRoute />
      {!isAdmin && !isFranchise && <Footer />}
    </>
  );
}

function App() {
  const { tokens, refreshTokenMthod, isLoading } = useAuthStore();

  useEffect(() => {
    if (tokens?.refresh && !tokens?.access) {
      refreshTokenMthod();
    }
  }, [tokens, refreshTokenMthod, isLoading]);

  if (isLoading && tokens?.refresh && !tokens?.access) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
