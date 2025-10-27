import { useEffect, useRef, useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';

import ActionButton from '../../../components/common/ActionButton';
import UserForm from '../../../components/Forms/UserForm/UserForm';

export interface EditUserFormMethods {
  submitForm: (callback: (data: any) => Promise<void>) => void;
  resetForm: () => void;
}

const EditUser = ({ user }: any) => {
  const { notify } = useAppContext();
  const dispatch = useAppDispatch();
  const handleModal = () => setIsModalOpen(!isModalOpen);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const userFormRef = useRef<EditUserFormMethods | null>(null);

  const [updateUser, { isLoading, isSuccess, isError }] = userApi.useUpdateUserMutation();

  const handleFormSubmit = () => {
    userFormRef.current?.submitForm(async (data: any) => {
      try {
        await updateUser({ userId: user.id, data: data }).unwrap();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating asset:', error);
      }
    });
  };

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.UPDATE_USER_SUCCESS
      });
      dispatch(setRefetchQuery({ queryKey: 'usersAll', value: true }));
    } else if (isError) {
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.UPDATE_USER_FAIL
      });
    }
  }, [isSuccess, isError, notify, dispatch]);

  return (
    <>
      <ActionButton withBorder={false} leftIcon={<CiEdit />} onClick={handleModal}>
        Edit
      </ActionButton>
      <Drawer isOpen={isModalOpen} onClose={handleModal} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent bgColor="#FFF" maxW="704px" w="100%">
          <DrawerHeader
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            borderBottomWidth="1px"
            fontSize="18px"
            fontWeight={600}
          >
            Edit User
            <DrawerCloseButton position={'static'} />
          </DrawerHeader>
          <DrawerBody bgColor="#FFF" p="24px">
            <UserForm ref={userFormRef} user={user} />
          </DrawerBody>
          <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid var(--day-5, #D9D9D9)">
            <Button variant="ghost" mr={3} onClick={handleModal}>
              Cancel
            </Button>
            <Button isLoading={isLoading} onClick={handleFormSubmit}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default EditUser;
