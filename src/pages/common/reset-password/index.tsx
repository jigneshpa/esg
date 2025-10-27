import { Box } from '@chakra-ui/react';

import ResetPasswordForm from '@/components/Forms/ResetPassword';
import AuthLayout from '@/layouts/auth-layout';

const ResetPassword = () => {
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
        <ResetPasswordForm />
      </Box>
    </AuthLayout>
  );
};

export default ResetPassword;
