import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { NavLink } from 'react-router-dom';
import { Flex, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react';

import logoWhite from '@/assets/logo_white.svg';
import ReportingGraphics from '@/assets/ReportingGraphics.svg';
import { URLS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { useLogout } from '@/hooks/useLogout';
import { ArrowForwardIcon } from '@chakra-ui/icons';

import SideBarMenu from '../SideBarMenu';

const SideBarContainer = () => {
  const handleLogout = useLogout();
  const { isSideBarOpen }: any = useAppContext();

  const handleClickLogOut = () => {
    handleLogout().then(isSuccess => {
      if (isSuccess && import.meta.env.VITE_IS_CLIENT === 'false') {
        const url = import.meta.env.VITE_LAND_PAGE;
        window.location.href = url;
      }
    });
  };

  return (
    <Flex
      minW={isSideBarOpen ? '290px' : '90px'}
      maxW={isSideBarOpen ? '290px' : '90px'}
      h="100vh"
      bg="#3A4C46"
      direction="column"
      justifyContent="space-between"
      alignItems="center"
      position="sticky"
      top="0"
      transition="all 0.3s"
      display={{ base: 'none', md: 'flex' }}
      color="white"
    >
      <VStack spacing={isSideBarOpen ? 6 : 4} w="full" px={isSideBarOpen ? 4 : 2} pt={8}>
        <HStack w="full" justifyContent={isSideBarOpen ? 'flex-start' : 'center'} mb={4}>
          <Image src={logoWhite} alt="Greenfi" w={isSideBarOpen ? '138px' : '40px'} />
        </HStack>
        <HStack
          w="full"
          bg="#405649"
          p={isSideBarOpen ? 3 : 2}
          spacing={4}
          justifyContent={isSideBarOpen ? 'flex-start' : 'center'}
          borderRadius="md"
        >
          <Image src={ReportingGraphics} alt="Asset Emission" w="40px" h="40px" />
          {isSideBarOpen && (
            <VStack align="start" spacing={0} lineHeight="1">
              <Text fontSize="lg" fontWeight="semibold">
                ESG
              </Text>
              <Text fontSize="lg" fontWeight="semibold">
                REPORTING
              </Text>
            </VStack>
          )}
        </HStack>
        <SideBarMenu />
      </VStack>

      <VStack spacing={4} w="full">
        <VStack bg="#405649" py={4} px={isSideBarOpen ? 4 : 2} w="full" alignItems="flex-start">
          {isSideBarOpen ? (
            <VStack alignItems="flex-start" spacing={1} w="full">
              <HStack>
                <Icon as={AiOutlineQuestionCircle} boxSize={6} color="#767676" />
                <Text fontSize="md" fontWeight="medium" color="white">
                  Need any help?
                </Text>
              </HStack>
              <NavLink to={URLS.FAQ} style={{ width: '100%' }}>
                <HStack w="full" justifyContent="space-between" pl={8}>
                  <Text as="span" fontSize="md" fontWeight="bold" color="#14AE5C">
                    FAQ
                  </Text>
                  <Icon as={ArrowForwardIcon} color="#14AE5C" />
                </HStack>
              </NavLink>
              <NavLink to={URLS.SUPPORT} style={{ width: '100%' }}>
                <HStack w="full" justifyContent="space-between" pl={8}>
                  <Text as="span" fontSize="md" fontWeight="bold" color="#14AE5C">
                    Contact Support
                  </Text>
                  <Icon as={ArrowForwardIcon} color="#14AE5C" />
                </HStack>
              </NavLink>
            </VStack>
          ) : (
            <VStack w="full" spacing={2}>
              <NavLink to={URLS.FAQ}>
                <Icon as={AiOutlineQuestionCircle} boxSize={6} color="#767676" />
              </NavLink>
              <NavLink to={URLS.SUPPORT}>
                <Icon as={AiOutlineQuestionCircle} boxSize={6} color="#767676" />
              </NavLink>
            </VStack>
          )}
        </VStack>
      </VStack>
    </Flex>
  );
};

export default SideBarContainer;
