import { useEffect, useMemo, useState } from 'react';
import { AiOutlineBell } from 'react-icons/ai';
import {
  Button,
  Flex,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  Icon,
  Link,
  Box,
  Heading
} from '@chakra-ui/react';
import { BsQuestionCircle } from 'react-icons/bs';
import { useInAppNotificationContext } from '../../context/InAppNotificationContext';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/user/userSelectors';
import InAppNotificationPopup from '../InAppNotificationPopup';
import { URLS } from '@/constants';
import { NavLink } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { useAppContext } from '@/context/AppContext';

const Header = ({notificationPage}:any) => {
  /*@ts-ignore */
  const { notificationsUnread, refreshNotificationList, getTotalNotificationUnread } = useInAppNotificationContext();
  const memoizedSelectUser = useMemo(() => selectUser, []);
  const user = useAppSelector(memoizedSelectUser);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const {sideMenuOpenAndClose}:any = useAppContext();
  useEffect(() => {
    if (user.id) {
      refreshNotificationList();
      getTotalNotificationUnread();
    }
  }, [user.id]);

  return (
    <Flex zIndex="8" bg='#E6F7FF' w="100%" h="60px" p="0 20px 0" justify="space-between" alignItems="center" gap="26px">
      <Flex align="center" gap="10px">
      <Box  zIndex={1} display={notificationPage&&'none'}>
        <Box bg={"#fff"} fontSize={"20px"} borderRadius={"50%"} padding={"5px"} cursor={"pointer"} onClick={sideMenuOpenAndClose}>
          <GiHamburgerMenu />
        </Box>
      </Box>
      <Box>
        <Heading as="h2" fontSize="30px" className="chakra-heading">
          ESG Reporting
        </Heading>
      </Box>
      </Flex>
      <HStack gap={0}>
        {user && (
          <Popover
            placement={'bottom'}
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
            onOpen={() => setNotificationOpen(true)}
          >
            <PopoverTrigger>
              <Button h={'24px'} variant={'unstyled'} position={'relative'}>
                <HStack gap={'5px'}>
                  <HStack gap={0}>
                    <AiOutlineBell color={"grey"}/>
                    <Text color={'grey.600'} fontWeight={500}>
                      Notifications
                    </Text>
                    {!!notificationsUnread && (
                      <Text
                        position={'relative'}
                        top={'-5px'}
                        minW={'10px'}
                        p={'0 3px'}
                        h={'15px'}
                        lineHeight={'15px'}
                        bg={'#FB002C'}
                        fontSize={'10px'}
                        color={'white'}
                        borderRadius={'10px'}
                        border={'2px solid white'}
                        boxSizing={'content-box'}
                      >
                        {notificationsUnread}
                      </Text>
                    )}
                  </HStack>
                </HStack>
              </Button>
            </PopoverTrigger>
            <PopoverContent bg={'white'} w={'400px'}>
              <PopoverArrow />
              <PopoverBody p={0} h={'80vh'} maxH={'600px'}>
                <InAppNotificationPopup onClose={() => setNotificationOpen(false)} />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )}
        <Popover placement={'bottom-start'}>
          <PopoverTrigger>
            <Button h={'24px'} variant={'unstyled'} ml={"10px"} fontSize={"medium"}>
              <HStack gap={'5px'}>
                <Icon
                  as={BsQuestionCircle}
                  color={'grey.600'}
                  fontSize={'1em'}
                  cursor={'pointer'}
                />
                <Text color={'grey.600'} fontWeight={500}>
                  Help
                </Text>
              </HStack>
            </Button>
          </PopoverTrigger>
          <PopoverContent w={'120px'} bg={'white'}>
            <PopoverArrow />
            <PopoverBody h={'100%'} p={0}>
              <VStack h={'100%'} gap={0} fontSize={'14px'} fontWeight={500} align={'start'}>
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
      </HStack>
    </Flex>
  );
};

export default Header;
