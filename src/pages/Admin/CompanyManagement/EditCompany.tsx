import { FC, useEffect, useRef, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton
} from '@chakra-ui/react';

import CompanyForm from '@/components/Forms/CompanyForm/CompanyForm';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { Company, ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface companyFormMethods {
  submitForm: (callback: (data: any) => Promise<void>) => void;
  resetForm: () => void;
}

interface IEditCompany {
  company: Company;
  modal?: boolean;
}

const EditCompany: FC<IEditCompany> = ({ company, modal }) => {
  const { notify, confirm } = useAppContext();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const companyFormRef = useRef<companyFormMethods | null>(null);

  const [updateCompany, { isLoading, isSuccess, isError, error }] = companyApi.useUpdateCompanyMutation();

  const handleFormSubmit = () => {
    confirm({
      title: 'Confirm Update',
      type: STATUS.APPROVED,
      message: 'Are you sure you want to update the company?',
      onOk: () => {
        companyFormRef.current?.submitForm(async (data: any) => {
          await updateCompany({ companyId: company.id, data: data }).unwrap();
        });
      }
    });
  };

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.UPDATE_COMPANY_SUCCESS
      });
      dispatch(setRefetchQuery({ queryKey: 'companyAll', value: true }));
      companyFormRef.current?.resetForm(); // Reset form on success
      setIsModalOpen(false); // Close modal on success
    } else if (isError && error) {
      console.error('UpdateCompany error:', error); // Log error for debugging
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, isError, error, notify, dispatch]);

  return (
    <>
      {modal ? (
        <Button onClick={() => setIsModalOpen(true)}>Edit</Button>
      ) : (
        <IconButton
          color="#004DA0"
          variant="ghost"
          icon={<MdEdit fontSize={'1.2rem'} />}
          size="sm"
          bg={'gray.50'}
          _hover={{ bg: 'gray.200' }}
          aria-label="Edit"
          onClick={() => setIsModalOpen(true)}
        />
      )}
      <Drawer isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent bgColor="#FFF" borderRadius={'16px 0 0 16px'}>
          <DrawerHeader
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgColor="#FFF"
            borderBottom="1px solid var(--day-5, #D9D9D9)"
            fontWeight="semibold"
          >
            Edit Subsidiary
            <DrawerCloseButton position={'static'} />
          </DrawerHeader>
          <DrawerBody bgColor="#FFF" p={6}>
            <CompanyForm key="company-form" ref={companyFormRef} company={company} />
          </DrawerBody>
          <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid var(--day-5, #D9D9D9)">
            <Button variant="ghost" mr={3} isDisabled={isLoading} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={isLoading} onClick={handleFormSubmit}>
              Update
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default EditCompany;
