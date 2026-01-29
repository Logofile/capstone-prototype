import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import OpportunitiesListPage from './pages/public/OpportunitiesListPage';
import OpportunityDetailPage from './pages/public/OpportunityDetailPage';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import CreateOpportunityPage from './pages/provider/CreateOpportunityPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="opportunities" element={<OpportunitiesListPage />} />
          <Route path="opportunities/:id" element={<OpportunityDetailPage />} />

          {/* Provider Routes - to be protected later */}
          <Route path="provider/login" element={<LoginPage />} />
          <Route path="provider/dashboard" element={<ProviderDashboard />} />
          <Route path="provider/opportunities/new" element={<CreateOpportunityPage />} />
          <Route path="provider/opportunities/:id/edit" element={<CreateOpportunityPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
