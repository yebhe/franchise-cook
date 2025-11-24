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
import HighOrderComponent from './components/layout/HighOrderComponent'


const ProtectedRoute = ({ children, requiredAuth = true, requiredUserType = null, requiresFranchise = null }) => {
  const { 
    isAuthenticated, 
    getUserType, 
    getHasFranchise 
  } = useAuthStore()
  
  const userType = getUserType()
  const has_franchise = getHasFranchise()

  if (requiredAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/" replace />
  }

  if (requiresFranchise === true && !has_franchise) {
    return <Navigate to="/devenir-franchise" replace />
  }
  
  if (requiresFranchise === false && has_franchise) {
    return <Navigate to="/franchise/dashboard" replace />
  }

  return children
}

function MainRoute() {
  return (
    <div>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<NosServices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activation/result" element={<ActivationResultPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/password-reset/:uidb64/:token" element={<PasswordResetPage />} />
        <Route path="/franchise/paiement/succes" element={<PaiementSucces />} />
        <Route path="/franchise/paiement/annule" element={<PaiementAnnule />} />

        {/* Routes Admin */}
        <Route 
          element={
            <ProtectedRoute requiredUserType="admin">
              <HighOrderComponent />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/franchises" element={<GestionFranchises />} />
          <Route path="/admin/entrepots" element={<GestionEntrepots />} />
          <Route path="/admin/emplacements" element={<GestionEmplacements />} />
          <Route path="/admin/camions" element={<GestionCamions />} />
          <Route path="/admin/maintenances" element={<GestionMaintenance />} />
          <Route path="/admin/affectations" element={<GestionAffectations />} />
          <Route path="/admin/categories" element={<GestionCategories />} />
          <Route path="/admin/produits" element={<GestionProduits />} />
          <Route path="/admin/stocks" element={<GestionStocks />} />
          <Route path="/admin/commandes" element={<GestionCommandes />} />
          <Route path="/admin/Profile" element={<ProfileAdmin />} />
        </Route>

        {/* Routes Franchise */}
        <Route 
          element={
            <ProtectedRoute requiredUserType="franchise" requiresFranchise={true}>
              <HighOrderComponent />
            </ProtectedRoute>
          }
        >
          <Route path="/franchise/dashboard" element={<FranchiseDashboard />} />
          <Route path="/franchise/camions" element={<MesCamions />} />
          <Route path="/franchise/emplacements" element={<MesEmplacements />} />
          <Route path="/franchise/affectations" element={<MesAffectations />} />
          <Route path="/franchise/maintenances" element={<MesMaintenances />} />
          <Route path="/franchise/ventes" element={<MesVentes />} />
          <Route path="/franchise/stocks" element={<MesStocks />} />
          <Route path="/franchise/profile" element={<MonProfile />} />
          <Route path="/franchise/commandes" element={<MesCommandes />} />
        </Route>

        {/* Route Devenir Franchise */}
        <Route 
          path="/devenir-franchise" 
          element={
            <ProtectedRoute requiredUserType="franchise" requiresFranchise={false}>
              <DevenirFranchise />
            </ProtectedRoute>
          } 
        />
        
        {/* Route 404 */}
        <Route path="*" element={<Page404 />} />  
      </Routes>
    </div>
  )
}

export default MainRoute