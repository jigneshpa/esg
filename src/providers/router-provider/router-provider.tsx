import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';

import { routes } from './routes';

export const CustomRouterProvider = () => (
  <Suspense
    fallback={
      <Center h={'100vh'}>
        <Spinner size={'xl'} thickness={'4px'} color={'grey.800'} />
      </Center>
    }
  >
    <RouterProvider router={createBrowserRouter(routes)} />
  </Suspense>
);
