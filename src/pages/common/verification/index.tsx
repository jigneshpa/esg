import { Box } from '@chakra-ui/react';

import { VerificationCode } from '@/components/Forms';
import AuthLayout from '@/layouts/auth-layout';

const Verification = () => {
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
        <VerificationCode />
      </Box>
    </AuthLayout>
  );
};

export default Verification;
