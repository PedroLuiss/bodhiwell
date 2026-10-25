import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { useTranslation } from "react-i18next";
import "./App.css";
import "./config/i18n";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./assets/styles/styles.css";
import "./assets/styles/global.css";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import SelectionTypeAccount from './pages/auth/SelectionTypeAccount';
import ProfessionalDetailPage from "./pages/ProfessionalDetail/ProfessionalDetailPage";
import ProfessionalsList from "./pages/ProfessionalsList/ProfessionalsList";
import BookingPage from "./pages/Booking/BookingPage";
import ProfilePage from "./pages/Profile/profilePage";
import AvailabilityProfessionalPage from "./pages/AvailabilityProfessionalPage/AvailabilityProfessionalPage";
import ComingSoon from "./pages/ComingSoon/ComingSoon";
import PersonalInfoPage from "./pages/PersonalInfoPage/PersonalInfoPage";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/dashboard-layouts/DashboardLayout";
import BookingDetailsPage from "./pages/BookingDetailsPage/BookingDetailsPage";
import { NotificationProvider } from "./context/NotificationContext";
import { ReservationsPage } from "./pages/Reservations/ReservationsPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { BlogPage } from "./pages/Blog/BlogPage";
import ViewReservationReportPage from "./pages/ViewReservationReportPage/ViewReservationReportPage";
import { MyConsultationsPage } from "./pages/MyConsultationsPage/MyConsultationsPage";
import { PatientProfilePage } from "./pages/PatientProfilePage/PatientProfilePage";
import { HistoryConsultationPage } from "./pages/HistoryConsultationPage/HistoryConsultationPage";
import { PaymentListPage } from "./pages/PaymentListPage/PaymentListPage";
import { WalletPage } from "./pages/WalletPage/WalletPage";
import { WithdrawalListPage } from "./pages/WithdrawalListPage/WithdrawalListPage";
import { CreateReservationReportPage } from "./pages/CreateReservationReportPage/CreateReservationReportPage";
import { NotificationPage } from "./pages/NotificationPage/NotificationPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage/PrivacyPolicyPage";
import CookiesPolicyPage from "./pages/CookiesPolicyPage/CookiesPolicyPage";
import TermsConditionsPage from "./pages/TermsConditionsPage/TermsConditionsPage";
import CreateBlogPost from "./pages/Blog/CreateBlogPost/CreateBlogPost";
import EditBlogPost from "./pages/Blog/EditBlogPost/EditBlogPost";
import ProfessionalPreview from "./pages/ProfessionalPreview/ProfessionalPreview";

import { NotificationToast } from './components/ui/NotificationToast/NotificationToast';
import { PushNotificationProvider, usePushContext } from './context/PushNotificationContext';
import RouteTracker from './components/RouteTracker';
import ContactPage from './pages/ContactPage/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import AccessDeniedPage from './components/AccessDenied/AccessDeniedPage';
import { UserStatusProvider } from './context/UserStatusContext';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import { ProfileCompletionProvider } from './context/ProfileCompletionContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage/VerifyEmailPage';

import { SearchFiltersProvider } from './context/SearchFiltersContext';
import FaqsPage from './pages/FAQsPage/FaqsPage';

const AppContent = () => {
  const { i18n } = useTranslation();
  const { user } = useAuthContext();
  const { lastNotification } = usePushContext();
  const [toastPayload, setToastPayload] = useState<any>(null);

  useEffect(() => {
    if (lastNotification) {
      setToastPayload(lastNotification);
    }
  }, [lastNotification]);

  return (
    <>
      <Router>
        <SearchFiltersProvider>
          <RouteTracker />
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
            <Route path="/faqs" element={<MainLayout><FaqsPage /></MainLayout>} />
            <Route path="/privacy-policy" element={<MainLayout mode="dark"><PrivacyPolicyPage /></MainLayout>} />
            <Route path="/cookies-policy" element={<MainLayout mode="dark"><CookiesPolicyPage /></MainLayout>} />
            <Route path="/terms-conditions" element={<MainLayout mode="dark"><TermsConditionsPage /></MainLayout>} />
            <Route path="/professionals" element={<MainLayout mode="dark"><ProfessionalsList /></MainLayout>} />
            <Route path="/professionals/:uid" element={<MainLayout mode="dark"><ProfessionalDetailPage /></MainLayout>} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/reservations" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.reservationsPage.title")}>
                  <ReservationsPage />
                </DashboardLayout>
              } />

              <Route path="/reservations/:uid/create-report" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.CreateReservationReportPage.title")}>
                  <CreateReservationReportPage />
                </DashboardLayout>
              } />

              <Route path="/my-consultation/:uid/details-consultation" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.ReservationReportDetails.title")}>
                  <ViewReservationReportPage />
                </DashboardLayout>
              } />

              <Route path="/my-consultation" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.myConsultationsPage.title")}>
                  <MyConsultationsPage />
                </DashboardLayout>
              } />

              <Route path="/blog" element={
                <DashboardLayout pageTitle="Blog">
                  <BlogPage />
                </DashboardLayout>
              } />

              <Route path="/blog/create" element={
                <DashboardLayout pageTitle={i18n.t('appAdmin.blog.titleHeader', 'Crear artículo')}>
                  <CreateBlogPost />
                </DashboardLayout>
              } />

              <Route path="/blog/edit/:id" element={
                <DashboardLayout pageTitle={i18n.t('appAdmin.blog.editBlog.title', 'Editar artículo')}>
                  <EditBlogPost />
                </DashboardLayout>
              } />

              <Route path="/payment-list" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.paymentListPage.titlePage")}>
                  <PaymentListPage />
                </DashboardLayout>
              } />

              <Route path="/wallet" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.walletPage.title")}>
                  <WalletPage />
                </DashboardLayout>
              } />
              <Route path="/dashboard" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.dashboard.dashboardTitle")}>
                  <DashboardPage />
                </DashboardLayout>
              } />
              <Route path="/profile" element={
                <DashboardLayout pageTitle={i18n.t(user?.type_account === 'professional' ? "appAdmin.EditProfessionalInfo.title" : "appAdmin.EditPersonalInfo.title")}>
                  <ProfilePage />
                </DashboardLayout>
              } />
              <Route path="/personal-info" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.EditPersonalInfo.title")}>
                  <PersonalInfoPage />
                </DashboardLayout>
              } />
              <Route path="/availability" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.AvailabilityTable.title")}>
                  <AvailabilityProfessionalPage />
                </DashboardLayout>
              } />
              <Route path="/withdrawals" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.withdrawalListPage.title")}>
                  <WithdrawalListPage />
                </DashboardLayout>
              } />
              <Route path="/notifications" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.NotificationPage.title")}>
                  <NotificationPage />
                </DashboardLayout>
              } />
              <Route path="/:uid/patient-profile" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.PatientProfilePage.title")}>
                  <PatientProfilePage />
                </DashboardLayout>
              } />
              <Route path="/patients/:uid/history-consultation" element={
                <DashboardLayout pageTitle={i18n.t("appAdmin.HistoryConsultationPage.title")}>
                  <HistoryConsultationPage />
                </DashboardLayout>
              } />
              <Route path="/selection-type-account" element={<SelectionTypeAccount />} />
              <Route path="/profile/preview" element={<MainLayout mode="dark"><ProfessionalPreview /></MainLayout>} />
              <Route path="/professionals/:uid/booking" element={<DashboardLayout pageTitle="Reserva"><BookingPage /></DashboardLayout>} />
              <Route path="/professionals/booking-details/:uid" element={<DashboardLayout pageTitle={i18n.t("appAdmin.BookingDetailsPage.title")}><BookingDetailsPage /></DashboardLayout>} />
            </Route>

            {/* Rutas de error */}
            <Route path="/access-denied" element={
              <DashboardLayout pageTitle={i18n.t('accessDenied.pageTitle', 'Acceso Denegado')}>
                <AccessDeniedPage />
              </DashboardLayout>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SearchFiltersProvider>
      </Router>

      <NotificationToast
        payload={toastPayload}
        onClose={() => setToastPayload(null)}
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <NotificationProvider>
          <PushNotificationProvider>
            <UserStatusProvider>
              <ProfileCompletionProvider>
                <AppContent />
              </ProfileCompletionProvider>
            </UserStatusProvider>
          </PushNotificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;