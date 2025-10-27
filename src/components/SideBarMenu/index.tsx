// import { useEffect } from 'react';
// import { setUser } from '@/store/slices/user/userSlice';
// import { userApi } from '@/store/api/user/userApi';
import { AiOutlineFileSearch, AiOutlineThunderbolt } from 'react-icons/ai';
import { CiUser } from 'react-icons/ci';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { MdOutlineVerifiedUser } from 'react-icons/md';
import { NavLink, useLocation } from 'react-router-dom';
import { HStack, Icon, Text, VStack } from '@chakra-ui/react';

import { URLS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user/userSelectors';

type MenuItem = {
  key: string,
  label: string,
  icon: JSX.Element,
  href: string,
  activeHref?: string[]
};

type Menu = {
  user: MenuItem[],
  manager: MenuItem[],
  'manager-l2': MenuItem[],
  admin: MenuItem[],
  'user-admin': MenuItem[]
};

const SideBarMenu = ({ onClickMenu }: { onClickMenu?: () => void }) => {
  // const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  // const [refetch] = userApi.useGetUserInfoMutation();
  const { isSideBarOpen }: any = useAppContext();
  const menu: Menu = {
    user: [
      {
        key: 'userView',
        label: 'Questionnaire',
        icon: <Icon as={AiOutlineThunderbolt} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.USER
      }
    ],
    admin: [
      {
        key: 'asset-management',
        label: 'Company/Subsidiaries',
        icon: <Icon as={HiOutlineOfficeBuilding} fontSize="20px" width="auto" height="auto" />,
        href: URLS.ADMIN_ASSET_MANAGEMENT,
        activeHref: [URLS.ADMIN_ASSET_MANAGEMENT]
      },
      {
        key: 'questionnaire',
        label: 'ESG Standards',
        icon: <Icon as={MdOutlineVerifiedUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.ADMIN_QUESTIONNAIRE
      },
      {
        key: 'reporting-status',
        label: 'User Submissions',
        icon: <Icon as={AiOutlineFileSearch} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.ADMIN_REPORTING_STATUS
      },

      {
        key: 'user-management',
        label: 'User Management',
        icon: <Icon as={CiUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.ADMIN_USER_MANAGEMENT
      }
    ],
    manager: [
      {
        key: 'questionnaire',
        label: 'ESG Standards',
        icon: <Icon as={MdOutlineVerifiedUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.MANAGER_QUESTIONNAIRE
      },
      {
        key: 'reporting-status',
        label: 'Reporting Status',
        icon: <Icon as={AiOutlineFileSearch} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.MANAGER_REPORTING_STATUS
      },
      {
        key: 'user-management',
        label: 'User Management',
        icon: <Icon as={CiUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.MANAGER_USER_MANAGEMENT
      }
    ],
    'manager-l2': [
      {
        key: 'questionnaire',
        label: 'ESG Standards',
        icon: <Icon as={MdOutlineVerifiedUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.MANAGER_QUESTIONNAIRE
      },
      {
        key: 'reporting-status',
        label: 'Reporting Status',
        icon: <Icon as={AiOutlineFileSearch} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.MANAGER_REPORTING_STATUS
      },
      {
        key: 'user-management',
        label: 'User Management',
        icon: <Icon as={CiUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.MANAGER_USER_MANAGEMENT
      }
    ],
    'user-admin': [
      {
        key: 'asset-management',
        label: 'Company/Subsidiaries',
        icon: <Icon as={HiOutlineOfficeBuilding} fontSize="20px" width="auto" height="auto" />,
        href: URLS.ADMIN_ASSET_MANAGEMENT,
        activeHref: [URLS.ADMIN_ASSET_MANAGEMENT]
      },
      {
        key: 'questionnaire',
        label: 'ESG Standards',
        icon: <Icon as={MdOutlineVerifiedUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.ADMIN_QUESTIONNAIRE
      },
      {
        key: 'reporting-status',
        label: 'User Submissions',
        icon: <Icon as={AiOutlineFileSearch} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.ADMIN_REPORTING_STATUS
      },

      {
        key: 'user-management',
        label: 'User Management',
        icon: <Icon as={CiUser} fontSize="20px" width={'auto'} height={'auto'} />,
        href: URLS.ADMIN_USER_MANAGEMENT
      }
    ]
  };

  return (
    <VStack w="full" pt={4}>
      {user?.role &&
        menu[user.role as keyof Menu].map(item => {
          const isActive =
            location.pathname === item.href ||
            item?.activeHref?.includes(location.pathname) ||
            item?.key === 'userView';

          return (
            <NavLink key={item.key} to={item.href} style={{ width: '100%' }} onClick={onClickMenu}>
              <HStack
                w={'100%'}
                p="12px 16px"
                gap={'16px'}
                boxSizing={'border-box'}
                fontWeight={500}
                sx={
                  isActive
                    ? { bg: '#405649', color: '#009951', borderLeft: '4px solid #14AE5C', paddingLeft: '12px' }
                    : { bg: 'transparent', color: 'white' }
                }
                _hover={{ bg: '#405649', color: '#009951' }}
                fontSize="medium"
                borderRadius="md"
              >
                {item.icon}
                {isSideBarOpen ? <Text fontSize="14px">{item.label}</Text> : null}
              </HStack>
            </NavLink>
          );
        })}
    </VStack>
  );
};

export default SideBarMenu;
