import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { RequireAuth } from './components/auth/RequireAuth';
import { LoadingBlock } from './components/ui';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { MembershipPage } from './pages/MembershipPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

// A zárt felületek külön csomagban töltődnek be. Egy látogatónak, aki csak a
// nyilvános oldalakat nézi, nem kell letöltenie az elnökségi felület kódját.
const MemberDashboardPage = lazy(() =>
  import('./pages/MemberDashboardPage').then((m) => ({ default: m.MemberDashboardPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

/** Oldalváltásnál ugorjunk a lap tetejére — a router ezt nem teszi meg magától. */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />

      <main id="main" className="flex-1">
        <Routes>
          {/* Publikus */}
          <Route path="/" element={<HomePage />} />
          <Route path="/egyesulet" element={<AboutPage />} />
          <Route path="/hirek" element={<NewsPage />} />
          <Route path="/hirek/:slug" element={<NewsDetailPage />} />
          <Route path="/dokumentumok" element={<DocumentsPage />} />
          <Route path="/tagsag" element={<MembershipPage />} />
          <Route path="/kapcsolat" element={<ContactPage />} />
          <Route path="/belepes" element={<LoginPage />} />

          {/* Zárt felületek */}
          <Route
            path="/tagi"
            element={
              <RequireAuth>
                <Suspense fallback={<LoadingBlock label="Tagi portál betöltése…" />}>
                  <MemberDashboardPage />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/elnokseg"
            element={
              <RequireAuth permission="admin.access">
                <Suspense fallback={<LoadingBlock label="Elnökségi felület betöltése…" />}>
                  <AdminDashboardPage />
                </Suspense>
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
