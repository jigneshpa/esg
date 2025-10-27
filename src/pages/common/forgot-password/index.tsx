import { Box } from '@chakra-ui/react';

import ForgotPasswordForm from '@/components/Forms/ForgotPassword';
import AuthLayout from '@/layouts/auth-layout/index';

const ForgotPassword = () => {
  return (
    <AuthLayout>
      <Box
        w={{ base: '100%' }}
        maxW={{
          base: '360px',
          lg: '398px'
        }}
        m={'auto'}
      >
        <ForgotPasswordForm />
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;
