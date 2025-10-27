import { FC, useEffect, useRef, useState } from 'react';
import { MdOutlineAdd } from 'react-icons/md';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon
} from '@chakra-ui/react';

import { CustomTabs, FileUpload } from '@/components';
import { useAppContext } from '@/context/AppContext';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import UserForm from '../../../components/Forms/UserForm/UserForm';
import { BULK_RECOMEDTIONS, MESSAGE, STATUS } from '../../../constants';

export interface userFormMethods {
  submitForm: (callback: (data: any) => Promise<void>) => void;
}

const AddAssets: FC = () => {
  const { notify } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [_selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const userFormRef = useRef<userFormMethods | null>(null);
  const dispatch = useAppDispatch();
  const handleModal = () => setIsModalOpen(!isModalOpen);

  const [createUser, { isError: isCreateError, error: createError, isSuccess: isCreated, isLoading: isLoading }] =
    userApi.useCreateUserMutation();
  const [uploadUsers, { isError: isUploadError, isSuccess: isUploaded, isLoading: isUploading }] =
    userApi.useUploadUsersMutation();

  useEffect(() => {
    if (isCreated) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.CREATE_USER_SUCCESS
      });
      dispatch(setRefetchQuery({ queryKey: 'usersAll', value: true }));
    } else if (isCreateError) {
      notify({
        type: STATUS.ERROR,
        message: ((createError as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.CREATE_USER_FAIL
      });
    }
  }, [createError, isCreated, notify]);

  useEffect(() => {
    if (isUploaded) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.USERS_UPLOAD_SUCCESS
      });
      dispatch(setRefetchQuery({ queryKey: 'usersAll', value: true }));
    } else if (isUploadError) {
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.UPLOAD_FAIL
      });
    }
  }, [isUploadError, isUploaded, notify]);

  const handleExportAndClose = async () => {
    try {
      const formData = new FormData();

      if (_selectedFiles && _selectedFiles.length > 0) {
        formData.append('file', _selectedFiles[0]);

        await uploadUsers(formData);
        handleModal();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleUserSubmit = async (formData: any) => {
    return await createUser(formData);
  };

  const handleSaveClick = () => {
    if (userFormRef?.current) {
      userFormRef.current.submitForm(async (formData: any) => {
        const isSuccess = await handleUserSubmit(formData);

        //@ts-ignore
        if (!isSuccess?.error?.error) {
          handleModal();
          //@ts-ignore
          userFormRef?.current?.resetForm();
        }
      });
    }
  };

  return (
    <>
      <Button
        fontSize={'0.9em'}
        fontWeight={700}
        w="auto"
        h="44px"
        leftIcon={<Icon as={MdOutlineAdd} fontSize={'20px'} />}
        bg="#137E59"
        onClick={handleModal}
        _hover={{
          opacity: 0.8
        }}
      >
        Add Users
      </Button>
      <Drawer isOpen={isModalOpen} onClose={handleModal} placement="right" size="lg">
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
            Add Users
            <DrawerCloseButton position={'static'} />
          </DrawerHeader>
          <DrawerBody bgColor="#FFF" p="24px">
            <CustomTabs
              title={['Bulk Users', 'Single User']}
              onChange={(index: number) => setActiveTab(index)}
              content={[
                <FileUpload
                  key="file-upload"
                  setSelectedFiles={setSelectedFiles}
                  acceptedFileTypes={{
                    accept: {
                      'text/xlsx': ['.xlsx'],
                      'text/csv': ['.csv']
                    }
                  }}
                  recomendations={BULK_RECOMEDTIONS.BULK_USERS}
                  multiple={true}
                  uploadInfo={{
                    uploadname: 'user',
                    csv: import.meta.env.VITE_UPLOAD_USER_CSV,
                    xlsx: import.meta.env.VITE_UPLOAD_USER_XLSX
                  }}
                />,
                <UserForm key="user-form" activeTab={activeTab} ref={userFormRef} onSubmit={handleUserSubmit} />
              ]}
            />
          </DrawerBody>
          {activeTab !== 2 && (
            <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid var(--day-5, #D9D9D9)">
              <Button variant="ghost" mr={3} onClick={handleModal}>
                Cancel
              </Button>
              {activeTab === 0 ? (
                <Button isLoading={isUploading} onClick={handleExportAndClose}>
                  Add User
                </Button>
              ) : (
                <Button isLoading={isLoading} onClick={handleSaveClick}>
                  {' '}
                  Save
                </Button>
              )}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddAssets;
