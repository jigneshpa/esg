import { MdEdit } from 'react-icons/md';
import { RiMore2Fill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { Center, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';

import { URLS } from '@/constants';
import { useDeleteQuestionnaireBank } from '@/hooks/useDeleteQuestionnaireBank';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { replaceString } from '@/utils';

import { TbFileText } from 'react-icons/tb';
import { GrShare } from 'react-icons/gr';
import { BsTrash } from 'react-icons/bs';
import AssignStandard from './AssignStandard';
interface ActionModalButtonProps {
  data: any;
  companySelected: number | null; // Add companySelected prop
  isDisabled?: boolean;
  standardId?: number;
}
const ActionModalButton = ({ data, companySelected, isDisabled, standardId }: ActionModalButtonProps) => {
  const handleDeleteQuestionnaireBank = useDeleteQuestionnaireBank();
  const navigate = useNavigate();
  const userRole: any = useAppSelector(selectUserRole);

  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const onEdit = () => {
    const mapObj = { ':qbankId': data?.id };
    let redirectUrl = '';
    if (userRole === 'manager') {
      redirectUrl = replaceString(URLS.MANAGER_QUESTION_BANK, mapObj);
    } else {
      redirectUrl = replaceString(URLS.QUESTION_BANK, mapObj);
    }

    navigate(redirectUrl, { replace: true });
  };

  const redirectById = () => {
    if (!data?.id) return;
    const mapObj = {
      ':qbankId': data?.id,
      ':companySelected': companySelected !== null ? companySelected : ''
    };
    const viewUrl = URLS.ADMIN_QUESTION_BANK_VIEW.split('/').slice(0, 4).join('/');
    const redirectUrl = replaceString(viewUrl, mapObj);
    console.log('xyz-- redirectUrl', redirectUrl, viewUrl, mapObj);
    navigate(redirectUrl, { replace: true });
  };

  const handleAssignClick = () => {
    setIsAssignDrawerOpen(true);
  };

  const handleAssignSubmit = () => {
    // Add your assign logic here
    console.log('Assigning to:', selectedUser);
    setIsAssignDrawerOpen(false);
    setSelectedUser('');
  };

  const handleAssignClose = () => {
    setIsAssignDrawerOpen(false);
    setSelectedUser('');
  };

  // Determine if edit is allowed and if view should be shown
  const isEditAllowed = companySelected === 0;
  const isViewAllowed = companySelected !== 0; // Hide View when companySelected is 0

  // Custom trigger that changes color when disabled
  const customTrigger = (
    <Center>
      <RiMore2Fill
        color={isDisabled ? "#9CA3AF" : "#137E59"}
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          width: '28px',
          height: '28px'
        }}
      />
    </Center>
  );

  return (
    <>
      <HStack spacing={1} justifyContent={'center'}>
        {/* {isViewAllowed && ( */}
          <Tooltip label="View" placement="top">
            <IconButton
              color={'#459273'}
              variant="ghost"
              icon={<TbFileText fontSize={'1.2rem'} />}
              size="sm"
              bg={'gray.50'}
              _hover={{ bg: 'gray.200' }}
              onClick={redirectById}
              isDisabled={isDisabled}
              aria-label="View"
            />
          </Tooltip>
        {/* )} */}

        <Tooltip label="Edit" placement="top">
          <IconButton
            color={'#3182ce'}
            variant="ghost"
            icon={<MdEdit fontSize={'1.2rem'}/>}
            size="sm"
            bg={'gray.50'}
            _hover={{ bg: 'gray.200' }}
            onClick={onEdit}
            isDisabled={isDisabled}
            aria-label="Edit"
          />
        </Tooltip>

        <Tooltip label="Assign" placement="top">
          <IconButton
            color="orange"
            variant="ghost"
            icon={<GrShare fontSize={'1.2rem'} />}
            size="sm"
            bg={'gray.50'}
            _hover={{ bg: 'gray.200' }}
            onClick={handleAssignClick}
            isDisabled={isDisabled}
            aria-label="Assign"
          />
        </Tooltip>

        <Tooltip label="Delete" placement="top">
          <IconButton
            color="red"
            variant="ghost"
            icon={<BsTrash fontSize={'1.2rem'} />}
            size="sm"
            bg={'gray.50'}
            _hover={{ bg: 'gray.200' }}
            onClick={() => handleDeleteQuestionnaireBank(data.id)}
            isDisabled={isDisabled}
            aria-label="Delete"
          />
        </Tooltip>
      </HStack>
      <AssignStandard isModalOpen2={isAssignDrawerOpen} onClose={handleAssignClose} disableUploadDocsButton={true} isDisabled={false} questionBankId={standardId || 0} />
    </>
  );
};

export default ActionModalButton;
