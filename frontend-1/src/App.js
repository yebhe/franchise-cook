import { BrowserRouter } from 'react-router-dom'; 
import './App.css'; 
import MainRoute from './MainRoute'; 
import { useEffect } from 'react'; 
import useAuthStore from './store/authStore';
import Footer from './components/Footer';

function App() { 
  const { tokens, refreshTokenMthod, isLoading } = useAuthStore();

  useEffect(() => {
    // Si on a un refresh token, essayer de le rafraîchir automatiquement
    if (tokens.refresh && !tokens.access) {
      refreshTokenMthod();
    }
  }, []);

  // Attendre que le refresh soit terminé si en cours
  if (isLoading && tokens.refresh && !tokens.access) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="">
        {/* <Navigation/> */}
        <MainRoute/>
      </div>
      <Footer/>
    </BrowserRouter>
  ); 
}

export default App;