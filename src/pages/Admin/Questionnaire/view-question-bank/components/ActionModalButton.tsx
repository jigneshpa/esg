import { CiEdit, CiViewBoard } from 'react-icons/ci';
import { MdDeleteOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { URLS } from '@/constants';
import { useDeleteQuestionnaireBank } from '@/hooks/useDeleteQuestionnaireBank';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { replaceString } from '@/utils';

import ActionButton from '../../../../../components/common/ActionButton';
import ActionPopover from '../../../../../components/common/ActionPopover';

const ActionModalButton = ({ data }: any) => {
  const handleDeleteQuestionnaireBank = useDeleteQuestionnaireBank();
  const navigate = useNavigate();
  const userRole: any = useAppSelector(selectUserRole);

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
    const mapObj = { ':qbankId': data?.id };
    let redirectUrl = '';
    if (userRole === 'manager') {
      redirectUrl = replaceString(URLS.MANAGER_QUESTION_BANK_VIEW, mapObj);
    } else {
      redirectUrl = replaceString(URLS.ADMIN_QUESTION_BANK_VIEW, mapObj);
    }

    navigate(redirectUrl, { replace: true });
  };

  return (
    <ActionPopover>
      <ActionButton onClick={redirectById} leftIcon={<CiViewBoard />}>
        View
      </ActionButton>
      <ActionButton onClick={onEdit} leftIcon={<CiEdit />}>
        Edit
      </ActionButton>
      <ActionButton
        color={'red'}
        withBorder={false}
        leftIcon={<MdDeleteOutline />}
        onClick={() => handleDeleteQuestionnaireBank(data.id)}
      >
        Delete
      </ActionButton>
    </ActionPopover>
  );
};

export default ActionModalButton;
