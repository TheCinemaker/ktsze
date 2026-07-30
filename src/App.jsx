import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { RequireAuth } from './components/auth/RequireAuth';
import { AuthCallback } from './components/auth/AuthCallback';
import { LoadingBlock } from './components/ui';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton';
import { CookieBanner } from './components/ui/CookieBanner';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { MembershipPage } from './pages/MembershipPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { WorkgroupsPage } from './pages/WorkgroupsPage';
import { WorkgroupDetailPage } from './pages/WorkgroupDetailPage';

// Biztonságos lusta betöltés: ha új deployment miatt a böngésző 404-es hibát kap az régebbi JS chunkra, automatikusan frissíti az oldalt.
const safeLazy = (importFn) =>
  lazy(() =>
    importFn().catch((error) => {
      console.warn('[App] Modul betöltési hiba (új verzió élesítve?), oldal újratöltése…', error);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      throw error;
    })
  );

const MemberDashboardPage = safeLazy(() =>
  import('./pages/MemberDashboardPage').then((m) => ({ default: m.MemberDashboardPage }))
);
const AdminDashboardPage = safeLazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

import { useAuth } from './context/AuthContext';
import { trackPageView } from './lib/analytics';

/** Oldalváltásnál ugorjunk a lap tetejére ÉS rögzítsük az analitikai látogatást. */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    trackPageView(pathname, null, user?.email || null);
  }, [pathname, user]);

  return null;
};

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {/* Az e-mail linkekről érkező tokent feldolgozza és eltünteti a címsorból */}
      <AuthCallback />
      <Navbar />

      <main id="main" className="flex-1">
        <Routes>
          {/* Publikus */}
          <Route path="/" element={<HomePage />} />
          <Route path="/egyesulet" element={<AboutPage />} />
          <Route path="/munkacsoportok" element={<WorkgroupsPage />} />
          <Route path="/munkacsoportok/:slug" element={<WorkgroupDetailPage />} />
          <Route path="/hirek" element={<NewsPage />} />
          <Route path="/hirek/:slug" element={<NewsDetailPage />} />
          <Route path="/dokumentumok" element={<DocumentsPage />} />
          <Route path="/tagsag" element={<MembershipPage />} />
          <Route path="/kapcsolat" element={<ContactPage />} />
          <Route path="/belepes" element={<LoginPage />} />
          <Route path="/adatvedelem" element={<PrivacyPolicyPage />} />

          {/* Hibakeresés: megmutatja, mit lát az alkalmazás a jogosultságaidról */}
          <Route path="/diagnosztika" element={<DiagnosticsPage />} />

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
      <ScrollToTopButton />
      <CookieBanner />
    </div>
  );
}
