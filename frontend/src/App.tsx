import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { ScrollToTop } from './app/ScrollToTop';
import { RouteFallback } from './app/RouteFallback';
import { AppRoutes } from './app/AppRoutes';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Suspense fallback={<RouteFallback />}>
              <AppRoutes />
            </Suspense>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
