import { ReactNode } from 'react';
import { logoGreen, UobLogo } from '@/assets'
import { useWindowSize } from '@uidotdev/usehooks';
import {
  Button,
  Center,
  Flex,
  Icon,
  Image,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  VStack,
} from '@chakra-ui/react';
import { BsQuestionCircle } from 'react-icons/bs';
import { URLS } from '@/constants';

const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const size = useWindowSize();

  const logoImage = import.meta.env.VITE_IS_CLIENT === 'false' ? logoGreen : UobLogo;

  return (
    <Flex w={'100%'} h={`${size.height}`} position={'relative'}>
      <Popover placement={'bottom-start'}>
        <PopoverTrigger>
          <Button h={'24px'} variant={'unstyled'} position={'absolute'} top={'10px'} right={'10px'}>
            <Icon
              as={BsQuestionCircle}
              color={'grey.600'}
              fontSize={'24px'}
              cursor={'pointer'}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent w={'120px'} bg={'white'}>
          <PopoverArrow />
          <PopoverBody h={'100%'} p={0}>
            <VStack h={'100%'} gap={0} fontSize={'0.9em'} fontWeight={500} align={'start'}>
              <Link
                display={'block'}
                href={URLS.FAQ}
                _hover={{ bg: 'grey.200' }}
                w={'100%'}
                flex={1}
                pl={'10px'}
                lineHeight={'35px'}>
                FAQ
              </Link>
              <Link
                display={'block'}
                href={URLS.SUPPORT}
                w={'100%'}
                flex={1}
                pl={'10px'}
                lineHeight={'35px'}
                _hover={{ bg: 'grey.200' }}>
                Support
              </Link>
              <Link
                // hide for now
                display={'none'}
                href={URLS.SUPPORT}
                w={'100%'}
                flex={1}
                pl={'10px'}
                lineHeight={'35px'}
                _hover={{ bg: 'grey.200' }}>
                Chat
              </Link>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Center
        flex={1}
        overflow={'hidden'}
        display={{
          base: 'none',
          lg: 'flex',
        }}>
        <Center>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '350px' }}>
              <Image src={logoImage} w={'100%'} />
            </div>
          </div>
        </Center>
      </Center>
      <Center flex={1} h={'100%'} overflow={'auto'} p={'20px'}>
        {children}
      </Center>
    </Flex>
  );
};

export default AuthLayout;
