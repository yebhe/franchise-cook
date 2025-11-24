import React from 'react'
import { Route, Routes, Navigate} from 'react-router-dom'
import Home from './pages/Home'
import Contact from './pages/Contact'
import AdminDashboard from './components/admin/AdminDashboard'
import FranchiseDashboard from './components/user/franchise/FranchiseDashboard'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ActivationResultPage from './pages/ActivationResultPage'
import PasswordResetPage from './pages/PasswordResetPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import GestionFranchises from './components/admin/franchises/GestionFranchises'
import GestionEntrepots from './components/admin/franchises/GestionEntrepots'
import GestionEmplacements from './components/admin/franchises/GestionEmplacements'
import GestionCamions from './components/admin/franchises/GestionCamions'
import GestionMaintenance from './components/admin/franchises/GestionMaintenance'
import GestionAffectations from './components/admin/franchises/GestionAffectations'
import GestionCategories from './components/admin/franchises/produits/GestionCategories'
import GestionProduits from './components/admin/franchises/produits/GestionProduits'
import GestionStocks from './components/admin/franchises/produits/GestionStocks'
import GestionCommandes from './components/admin/franchises/produits/GestionCommandes'
import MesCamions from './components/user/franchise/MesCamions'
import MesEmplacements from './components/user/franchise/MesEmplacements'
import MesAffectations from './components/user/franchise/MesAffectations'
import MesMaintenances from './components/user/franchise/MesMaintenances'
import MesVentes from './components/user/franchise/MesVentes'
import MesStocks from './components/user/franchise/MesStocks'
import MonProfile from './components/user/franchise/MonProfile'
import DevenirFranchise from './components/user/franchise/DevenirFranchise'
import MesCommandes from './components/user/franchise/MesCommandes'
import useAuthStore from './store/authStore'
import ProfileAdmin from './components/admin/franchises/ProfileAdmin'
import NosServices from './pages/NosServices'
import PaiementSucces from './components/common/PaiementSucces'
import PaiementAnnule from './components/common/PaiementAnnule'
import Page404 from './pages/Page404'


// Composant de protection des routes
const ProtectedRoute = ({ children, requiredAuth = true, requiredUserType = null, requiresFranchise = null }) => {
  // Utilisation de votre store Zustand
  const { 
    isAuthenticated, 
    getUserType, 
    getHasFranchise 
  } = useAuthStore()
  
  const userType = getUserType()
  const has_franchise = getHasFranchise()

  // Vérification de l'authentification
  if (requiredAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Vérification du type d'utilisateur
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/" replace />
  }

  // Vérification spécifique pour les franchises
  if (requiresFranchise === true && !has_franchise) {
    return <Navigate to="/devenir-franchise" replace />
  }
  
  if (requiresFranchise === false && has_franchise) {
    return <Navigate to="/franchise/dashboard" replace />
  }

  return children
}

// Configuration des routes avec leurs protections
const routeConfigs = [
  // Routes publiques (pas de protection)
  { path: "/", component: Home },
  { path: "/services", component: NosServices },
  { path: "/contact", component: Contact },
  { path: "/register", component: RegisterPage },
  { path: "/login", component: LoginPage },
  { path: "/activation/result", component: ActivationResultPage },
  { path: "/forgot-password", component: ForgotPasswordPage },
  { path: "/password-reset/:uidb64/:token", component: PasswordResetPage },

  { path: "/franchise/paiement/succes", component: PaiementSucces },
  { path: "/franchise/paiement/annule", component: PaiementAnnule },

  // Routes Admin
  { path: "/admin/dashboard", component: AdminDashboard, userType: "admin" },
  { path: "/admin/franchises", component: GestionFranchises, userType: "admin" },
  { path: "/admin/entrepots", component: GestionEntrepots, userType: "admin" },
  { path: "/admin/emplacements", component: GestionEmplacements, userType: "admin" },
  { path: "/admin/camions", component: GestionCamions, userType: "admin" },
  { path: "/admin/maintenances", component: GestionMaintenance, userType: "admin" },
  { path: "/admin/affectations", component: GestionAffectations, userType: "admin" },
  { path: "/admin/categories", component: GestionCategories, userType: "admin" },
  { path: "/admin/produits", component: GestionProduits, userType: "admin" },
  { path: "/admin/stocks", component: GestionStocks, userType: "admin" },
  { path: "/admin/commandes", component: GestionCommandes, userType: "admin" },
  { path: "/admin/Profile", component: ProfileAdmin, userType: "admin" },

  // Routes Franchise avec franchise
  { path: "/franchise/dashboard", component: FranchiseDashboard, userType: "franchise", requiresFranchise: true },
  { path: "/franchise/camions", component: MesCamions, userType: "franchise", requiresFranchise: true },
  { path: "/franchise/emplacements", component: MesEmplacements, userType: "franchise", requiresFranchise: true },
  { path: "/franchise/affectations", component: MesAffectations, userType: "franchise", requiresFranchise: true },
  { path: "/franchise/maintenances", component: MesMaintenances, userType: "franchise", requiresFranchise: true },

  // Routes User franchise sans franchise
  { path: "/devenir-franchise", component: DevenirFranchise, userType: "franchise", requiresFranchise: false },

  // Routes générales franchisés
  { path: "/ventes", component: MesVentes, userType: "franchise", requiresFranchise: true },
  { path: "/stocks", component: MesStocks, userType: "franchise", requiresFranchise: true },
  { path: "/profile", component: MonProfile, userType: "franchise", requiresFranchise: true },
  { path: "/commandes", component: MesCommandes, userType: "franchise", requiresFranchise: true },
]

function MainRoute() {
  return (
    <div>
      <Routes>
        {routeConfigs.map(({ path, component: Component, userType, requiresFranchise }, index) => (
          <Route 
            key={index}
            path={path} 
            element={
              userType ? (
                <ProtectedRoute 
                  requiredUserType={userType} 
                  requiresFranchise={requiresFranchise}
                >
                  <Component />
                </ProtectedRoute>
              ) : (
                <Component />
              )
            } 
          />
        ))}
        
        {/* Route 404 */}
        <Route path="*" element={<Page404/>} />  
      </Routes>
    </div>
  )
}

export default MainRoute