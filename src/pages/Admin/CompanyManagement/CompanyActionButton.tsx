import { FC } from 'react';
import { HStack, IconButton } from '@chakra-ui/react';

import { useDeleteCompany } from '@/hooks/useDeleteCompany';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user/userSelectors';
import { Company } from '@/types/common';

import EditCompany from './EditCompany';
import ViewCompanyDetails from './ViewCompanyDetails';
import { BsTrash } from 'react-icons/bs';
import { USER_ROLE } from '@/constants';

interface IActionModalButton {
  data: Company;
  isSubsidiary?: boolean;
  onSubsidiaryDeleted?: () => void;
}

const CompanyActionButton: FC<IActionModalButton> = ({ data, isSubsidiary = false, onSubsidiaryDeleted }) => {
  const handleDeleteCompany = useDeleteCompany();
  const userInfo = useAppSelector(selectUser);

  return (
    <HStack justifyContent={'center'}>
      <ViewCompanyDetails company={data} />

      {userInfo?.roleId !== 4 && userInfo?.roleId !== 1 && (
        <EditCompany company={data} />
      )}
      
      {userInfo?.role === USER_ROLE.ADMIN && <IconButton
        color="red"
        variant="ghost"
        icon={<BsTrash fontSize={'1.2rem'} />}
        size="sm"
        bg={'gray.50'}
        _hover={{ bg: 'gray.200' }}
        aria-label="Delete"
        onClick={() =>
          handleDeleteCompany(data.id, data.name, isSubsidiary, undefined, () => {
            if (isSubsidiary && onSubsidiaryDeleted) {
              onSubsidiaryDeleted();
            }
          })
        } />}
    </HStack>
  );
};

export default CompanyActionButton;
