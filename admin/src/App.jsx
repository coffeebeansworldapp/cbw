import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { CarouselPage } from './pages/CarouselPage';
import { PremiumBeansPage } from './pages/PremiumBeansPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/products/new"
              element={
                <ProtectedRoute roles={['OWNER', 'MANAGER']}>
                  <Layout>
                    <ProductFormPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute roles={['OWNER', 'MANAGER']}>
                  <Layout>
                    <ProductFormPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrdersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CustomersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['OWNER']}>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={['OWNER', 'MANAGER']}>
                  <Layout>
                    <AuditLogsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/carousel"
              element={
                <ProtectedRoute roles={['OWNER', 'MANAGER']}>
                  <Layout>
                    <CarouselPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/premium-beans"
              element={
                <ProtectedRoute roles={['OWNER', 'MANAGER']}>
                  <Layout>
                    <PremiumBeansPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
