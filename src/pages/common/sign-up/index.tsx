import { Box } from '@chakra-ui/react';

import SignUpForm from '@/components/Forms/SignUp';
import AuthLayout from '@/layouts/auth-layout';

const SignUp = () => {
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
        <SignUpForm />
      </Box>
    </AuthLayout>
  );
};

export default SignUp;
