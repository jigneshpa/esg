import { MdDeleteOutline } from 'react-icons/md';

import { useDeleteUser } from '@/hooks/useDeleteUser';

import ActionButton from '../../../components/common/ActionButton';
import ActionPopover from '../../../components/common/ActionPopover';
import EditUser from './EditUser';

const ActionModalButton = ({ data }: any) => {
  const handleDeleteUser = useDeleteUser();

  return (
    <ActionPopover>
      <EditUser user={data} />
      <ActionButton
        withBorder={false}
        color="red"
        leftIcon={<MdDeleteOutline />}
        onClick={() => handleDeleteUser(data.id)}
      >
        Delete
      </ActionButton>
    </ActionPopover>
  );
};

export default ActionModalButton;
