import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout, ToastProvider } from './components';
import { AuthProvider } from './context';
import { ScrollToTop, RouteFallback, AppRoutes } from './app/index';

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
