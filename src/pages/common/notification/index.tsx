import { useEffect, useRef, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Box, Center, Flex, Hide, HStack, Icon, IconButton, Show, Spinner, Text, VStack } from '@chakra-ui/react';

import { Header, NotificationItem } from '@/components';
import HeaderMobile from '@/components/HeaderMobile';
import { useAppContext } from '@/context/AppContext';
import { useInAppNotificationContext } from '@/context/InAppNotificationContext';
import { useWindowSize } from '@uidotdev/usehooks';

const NotificationContainer = ({ isLoading, setIsLoading, data, setParams, setBoxShadow }: any) => {
  const endOfListRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true);
          const secondPage = 2;
          setParams((prev: any) => ({ ...prev, page: prev.page + 1 || secondPage }));
        }
      },
      { root: listContainerRef.current, threshold: 0.1 }
    );
    if (observer) {
      // @ts-ignore
      observer.observe(endOfListRef.current);
    }
    return () => {
      if (endOfListRef.current) {
        // @ts-ignore
        observer.unobserve(endOfListRef?.current);
      }
    };
  }, []);

  const handleScroll = () => {
    // @ts-ignore
    const listContainerPosition = listContainerRef?.current.getBoundingClientRect();
    // @ts-ignore
    const scrollPosition = scrollRef?.current.getBoundingClientRect();
    if (scrollPosition.y <= listContainerPosition.y) {
      setBoxShadow(true);
    } else {
      setBoxShadow(false);
    }
  };

  return (
    <Flex
      ref={listContainerRef}
      overflow={'auto'}
      position={'relative'}
      flex={1}
      bg={'grey.100'}
      p={{
        base: '0px 16px',
        md: '0px 32px',
        lg: '0px 40px'
      }}
      onScroll={handleScroll}
    >
      <Box
        flex={1}
        h={'100%'}
        py="24px"
        margin="0 auto"
        w="100%"
        maxW={{
          base: '100%',
          md: '90%',
          lg: '1080px'
        }}
        zIndex={1}
        position={'relative'}
      >
        <VStack>
          <VStack gap={'24px'} w={'100%'} maxW={'1080px'} ref={scrollRef}>
            {data?.length &&
              data.map((item: { id: number }) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  boxShadow={'0px 8px 11px -4px #2d364317'}
                  borderRadius={'5px'}
                  p={'14px 20px'}
                  _hover={{
                    outline: '1px solid',
                    outlineColor: 'border'
                  }}
                />
              ))}
          </VStack>
          <Box ref={endOfListRef} w={'100%'} minH={'5px'}>
            {isLoading && (
              <Center minH="30px" borderRadius={'10px'} bg={'white'}>
                <Spinner />
              </Center>
            )}
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

const Notification = () => {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const navigate = useNavigate();
  const size = useWindowSize();
  const { isLoading, setIsLoading, setParams, allNotifications, refreshNotificationList }: any =
    useInAppNotificationContext();

  const [boxShadow, setBoxShadow] = useState(false);

  useEffect(() => {
    setSideBarOpen(false);
  }, []);

  useEffect(() => {
    if (allNotifications.length === 0 && !isLoading) {
      refreshNotificationList();
    }
  }, [allNotifications, isLoading, refreshNotificationList]);

  return (
    <Flex h={`${size.height}px`} flexDir={'column'} bg={'grey.100'}>
      <Show above="lg">
        <Header notificationPage={true}/>
      </Show>
      <Hide above="lg">
        <HeaderMobile isOpen={sideBarOpen} setIsOpen={setSideBarOpen} />
      </Hide>
      <Center
        pt={'20px'}
        pb={'10px'}
        zIndex={11}
        sx={{
          transition: 'all 0.3s ease-in-out',
          borderBottom: '1px solid transparent',
          ...(boxShadow && {
            background: 'white',
            borderColor: 'border'
          })
        }}
      >
        <HStack
          w={'100%'}
          maxW={{
            base: '100%',
            md: '90%',
            lg: '1080px'
          }}
          position={'relative'}
          p={{
            base: '0px 16px',
            md: '0px 32px',
            lg: '0px 40px'
          }}
          justifyContent={{
            base: 'flex-start',
            md: 'center'
          }}
        >
          <IconButton
            variant={'unstyled'}
            w={'44px'}
            h={'44px'}
            borderRadius={'4px'}
            border={'1px solid'}
            borderColor={'border'}
            cursor={'pointer'}
            bg="white"
            _hover={{ bg: 'white' }}
            onClick={() => navigate(-1)}
            icon={<Icon h={'100%'} as={FiArrowLeft} fontSize={'20px'} />}
            position="absolute"
            left={0}
            display={{ base: 'none', md: 'flex' }}
            aria-label={''}
          />
          <Text
            fontSize={{
              base: '20px',
              md: '24px',
              lg: '26px'
            }}
            fontWeight={{
              base: 500,
              md: 700,
              lg: 700
            }}
            lineHeight={{
              base: 1.5,
              md: 2,
              lg: 2.4
            }}
            mr="70%"
          >
            Current notifications
          </Text>
        </HStack>
      </Center>

      {!allNotifications.length ? (
        <Flex
          flex={1}
          bg={'grey.100'}
          justifyContent={'center'}
          p={{
            base: '0px 16px',
            md: '0px 32px',
            lg: '0px 40px'
          }}
        >
          {isLoading ? (
            <Center>
              <Spinner />
            </Center>
          ) : (
            <Text color={'grey.500'}>(You have no notification)</Text>
          )}
        </Flex>
      ) : (
        <NotificationContainer
          data={allNotifications}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setParams={setParams}
          setBoxShadow={setBoxShadow}
        />
      )}
    </Flex>
  );
};

export default Notification;
