import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout';
import { VerifyEmailForm } from '../../components/VerifyEmailForm/VerifyEmailForm';

const VerifyEmailPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <AuthLayout>
            <VerifyEmailForm
                title={t('verifyEmail.title', 'Verifica tu correo')}
                description={t('verifyEmail.instructionText', 'Hemos enviado un código a tu correo, por favor ingrésalo para completar tu registro.')}
            />
        </AuthLayout>
    );
};

export default VerifyEmailPage;