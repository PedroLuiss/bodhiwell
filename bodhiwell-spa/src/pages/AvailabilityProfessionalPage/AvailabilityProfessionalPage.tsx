import React from "react";
import { Link } from "react-router-dom";
import styles from './AvailabilityProfessionalPage.module.scss';
import AvailabilityCalendar from '../../components/Availability/AvailabilityCalendar/AvailabilityCalendar';
import AvailabilityTable from '../../components/Availability/AvailabilityTable/AvailabilityTable';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import Loading from "../../components/ui/Loading/Loading";
import { Box, Button } from "@mui/material";
import { UnsavedChangesModal } from "../../components/EditProfileProfessional/UnsavedChangesModal/UnsavedChangesModal";
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import { useAvailabilityProfessional } from "./hooks/useAvailabilityProfessional";


const AvailabilityProfessionalPage = () => {
  const {
    t,
    selectedDates, setSelectedDates,
    notAvailable, setNotAvailable,
    blocksByDate, setBlocksByDate,
    reservationsByDate,
    activeDate, setActiveDate,
    originalData,
    loading,
    profileLoading,
    error,
    isSaving,
    lastSaved,
    hasChanges,
    showUnsavedModal,
    userStatus,
    profileIsComplete,
    isAwaitingApproval,
    tableRef,
    handleSave,
    handleSaveSuccess,
    handleExitClick,
    handleConfirmExitWithoutSaving,
    handleConfirmSaveAndExit,
    handleCloseUnsavedModal,
    handleScrollToDateCard
  } = useAvailabilityProfessional();

  if (profileLoading) {
    return <Loading fullscreen text={t("appAdmin.availabilityProfessionalPage.loading", "Cargando perfil...")} />;
  }

  if (!profileIsComplete) {
    return (
      <div className={styles['incompleteProfileContainer']}>
        <div className={styles['incompleteProfileCard']}>
          <div className={`${styles['iconContainer']} ${isAwaitingApproval ? styles['iconReview'] : ''}`}>
            {isAwaitingApproval ? <HourglassTopOutlinedIcon fontSize="inherit" /> : <AssignmentIndOutlinedIcon fontSize="inherit" />}
          </div>
          <h2>
            {isAwaitingApproval
              ? t('appAdmin.AvailabilityProfessionalPage.pendingApprovalTitle', 'Tu perfil está en proceso de revisión')
              : t('appAdmin.AvailabilityProfessionalPage.incompleteProfileTitle', '¡Un paso más para comenzar!')}
          </h2>
          <p>
            {isAwaitingApproval
              ? t('appAdmin.AvailabilityProfessionalPage.pendingApprovalDescription', 'Nuestro equipo está validando tus datos...')
              : t('appAdmin.AvailabilityProfessionalPage.incompleteProfileDescription', 'Para gestionar tu disponibilidad, completa tu información.')}
          </p>
          <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginTop: '20px' 
          }}>
            
            <Button
              variant="outlined"
              component={Link}
              to="/dashboard"
              startIcon={<HomeOutlined />}
              sx={{
                color: '#7A9E7E',
                borderColor: '#7A9E7E',
                '&:hover': {
                  borderColor: '#688a6c',
                  backgroundColor: 'rgba(122, 158, 126, 0.08)',
                },
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '12px 24px',
                borderRadius: '8px',
              }}
            >
              {t('appAdmin.AvailabilityProfessionalPage.goHomeButton', 'Ir a inicio')}
            </Button>

            {!isAwaitingApproval && userStatus === 'pending_completion' && (
              <Button
                variant="contained"
                component={Link}
                to="/personal-info"
                startIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: '#7A9E7E',
                  '&:hover': {
                    backgroundColor: '#688a6c',
                  },
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                }}
              >
                {t('appAdmin.AvailabilityProfessionalPage.completeProfileButton', 'Completar mi perfil')}
              </Button>
            )}
          </Box>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>{t('appAdmin.AvailabilityProfessionalPage.errorLoadingAvailability')}</div>;
  }

  return (
    <>
      <div className={styles['professional-availability']}>
        {loading && (<Loading fullscreen text={t('appAdmin.AvailabilityProfessionalPage.loadingAvailability')} />)}
        
        <main className={styles['availability-main']}>
          <div className={styles['hero']}>
            <div className={styles['hero-mark']}>✦</div>
            <h1>{t('appAdmin.AvailabilityCalendar.title', 'Disponibilidad')}</h1>
          </div>

          <div className={styles['content-grid']}>
            <section className={styles['calendar-zone']}>
              <AvailabilityCalendar
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                notAvailable={notAvailable}
                setNotAvailable={setNotAvailable}
                blocksByDate={blocksByDate}
                setBlocksByDate={setBlocksByDate}
                onDateSelect={handleScrollToDateCard}
                reservationsByDate={reservationsByDate}
                activeDate={activeDate}
                hasChanges={hasChanges}
                isDirty={hasChanges}
                lastSaved={lastSaved}
                onSave={handleSave}
                onBack={handleExitClick}
                isSaving={isSaving}
              />
            </section>

            <AvailabilityTable
              ref={tableRef}
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
              notAvailable={notAvailable}
              setNotAvailable={setNotAvailable}
              blocksByDate={blocksByDate}
              setBlocksByDate={setBlocksByDate}
              onBackClick={handleExitClick}
              initialData={originalData}
              onSaveSuccess={handleSaveSuccess}
              reservationsByDate={reservationsByDate}
              activeDate={activeDate}
              onSetActiveDate={setActiveDate}
              t={t}
            />
          </div>
        </main>
      </div>

      <UnsavedChangesModal 
        open={showUnsavedModal}
        onClose={handleCloseUnsavedModal}
        onExitWithoutSaving={handleConfirmExitWithoutSaving}
        onSaveAndExit={handleConfirmSaveAndExit}
      />
    </>
  );
}

export default AvailabilityProfessionalPage;