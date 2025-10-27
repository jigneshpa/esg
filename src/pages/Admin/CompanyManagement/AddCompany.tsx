import { useEffect, useRef, useState } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { MdOutlineAdd } from 'react-icons/md';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Icon,
  Tooltip
} from '@chakra-ui/react';

import { CustomTabs, FileUpload } from '@/components';
import CompanyForm from '@/components/Forms/CompanyForm/CompanyForm';
import SubsidiaryForm from '@/components/Forms/SubsidiaryForm/SubsidiaryForm';
import { BULK_RECOMEDTIONS, MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import useUploadCompanies from '@/hooks/useUploadCompanies';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import CustomModalHeader from '../../../components/CustomModalHeader/CustomModalHeader';

export interface companyFormMethods {
  submitForm: (callback: (data: any) => Promise<void>) => void;
}

interface AddCompanyProps {
  companySelected: boolean;
  companies: any;
}

const AddCompany: React.FC<AddCompanyProps> = ({ companySelected, companies }) => {
  const { notify, confirm } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const userRole = useAppSelector(selectUserRole);
  const companyFormRef = useRef<companyFormMethods | null>(null);
  const subsidiaryFormRef = useRef<companyFormMethods | null>(null);

  const dispatch = useAppDispatch();
  const handleModal = () => setIsModalOpen(!isModalOpen);

  const {
    setParentId = companies?.companyId,
    setSelectedFiles,
    handleExportAndClose,
    isUploading
  } = useUploadCompanies(handleModal);

  const [createCompany, { isError: isCreateError, error: createError, isSuccess: isCreated, isLoading: isLoading }] =
    companyApi.useCreateCompanyMutation();

  useEffect(() => {
    if (companySelected) {
      setParentId(companies?.companyId);
    }
  }, [companySelected]);

  // useEffect(() => {
  //   if (isCreated) {
  //     notify({
  //       type: STATUS.SUCCESS,
  //       message: companySelected
  //         ? 'Subsidiary created successfully'
  //         : 'Company created successfully'
  //     });
  //     dispatch(setRefetchQuery({ queryKey: 'companyAll', value: true }));
  //   } else if (isCreateError) {
  //     console.error('CreateCompany error:', createError); // Log full error for debugging
  //     notify({
  //       type: STATUS.ERROR,
  //       message: ((createError as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.CREATE_USER_FAIL
  //     });
  //   }
  // }, [createError, dispatch, isCreateError, isCreated, notify, companySelected]);

  const handleCompanySubmit = async (formData: any) => {
    return await createCompany(formData);
  };

  const handleSubsidarySubmit = async () => {};

  const handleSaveClick = () => {
    if (companyFormRef?.current) {
      companyFormRef.current.submitForm(async (formData: any) => {
        confirm({
          title: activeTab === 0 ? 'Confirm Upload' : 'Are you sure you want to add this company?',
          type: STATUS.APPROVED,
          message: 'Please confirm',
          onOk: async () => {
            try {
              const isSuccess = await handleCompanySubmit(formData);

              // Check if the mutation was successful
              if (isSuccess && !('error' in isSuccess)) {
                notify({
                  type: STATUS.SUCCESS,
                  message: 'Company created successfully'
                });
                handleModal();
                // companyFormRef?.current?.resetForm();
                dispatch(setRefetchQuery({ queryKey: 'companyAll', value: true }));
              }
            } catch (error) {
              console.error(error);
              notify({
                type: STATUS.ERROR
                // message: (error as FetchBaseQueryError)?.data?.message || MESSAGE.CREATE_USER_FAIL,
              });
            }
          }
        });
      });
    } else if (subsidiaryFormRef?.current) {
      subsidiaryFormRef.current.submitForm(async (formData: any) => {
        confirm({
          title: activeTab === 0 ? 'Confirm Upload' : 'Are you sure you want to add this subsidiary?',
          type: STATUS.APPROVED,
          message: 'Please confirm',
          onOk: async () => {
            try {
              const isSuccess = await handleCompanySubmit(formData);

              // Check if the mutation was successful
              if (isSuccess && !('error' in isSuccess)) {
                notify({
                  type: STATUS.SUCCESS,
                  message: 'Subsidiary created successfully'
                });
                handleModal();
                // subsidiaryFormRef?.current?.resetForm();
                dispatch(setRefetchQuery({ queryKey: 'companyAll', value: true }));
              }
            } catch (error) {
              console.error(error);
              notify({
                type: STATUS.ERROR
              });
            }
          }
        });
      });
    }
  };

  // Remove or modify the useEffect to only handle errors
  useEffect(() => {
    if (isCreateError) {
      console.error('CreateCompany error:', createError); // Log full error for debugging
      notify({
        type: STATUS.ERROR,
        message: ((createError as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.CREATE_USER_FAIL
      });
    }
  }, [createError, isCreateError, notify]);

  const tabTitles = ['Bulk List', 'Single Entity'];
  const tabContents = [
    <>
      <FileUpload
        key="file-upload"
        setSelectedFiles={setSelectedFiles}
        acceptedFileTypes={{
          accept: {
            'text/xlsx': ['.xlsx'],
            'text/csv': ['.csv']
          }
        }}
        uploadInfo={{
          uploadname: '<Ad>',
          csv: import.meta.env.VITE_UPLOAD_COMPANY_CSV,
          xlsx: import.meta.env.VITE_UPLOAD_COMPANY_XLSX
        }}
        recomendations={BULK_RECOMEDTIONS.BULK_COMPANIES}
        multiple={true}
      />
    </>,
    !companySelected ? (
      <CompanyForm key="company-form" ref={companyFormRef} onSubmit={handleCompanySubmit} />
    ) : (
      <SubsidiaryForm
        currentCompany={companies}
        key="Subsidiary-form"
        ref={subsidiaryFormRef}
        onSubmit={handleSubsidarySubmit}
      />
    )
  ];

  return (
    <>
      {userRole !== 'user-admin' && (
        <Button
          fontSize={'0.9em'}
          fontWeight={700}
          w="auto"
          h="44px"
          leftIcon={<Icon as={MdOutlineAdd} fontSize={'20px'} />}
          bg="#137E59"
          isDisabled={companySelected}
          isLoading={isUploading}
          onClick={handleModal}
          _hover={{
            opacity: 0.8
          }}
        >
          Add Company
        </Button>
      )}

      <Tooltip label="Add a company to create a subsidiary" aria-label="A tooltip">
        <Button
          fontSize={'0.9em'}
          fontWeight={700}
          w="auto"
          h="44px"
          leftIcon={<Icon as={MdOutlineAdd} fontSize={'20px'} />}
          bg="#137E59"
          isDisabled={!companySelected}
          isLoading={isUploading}
          onClick={handleModal}
          _hover={{
            opacity: 0.8
          }}
        >
          Add Subsidiary/SPV  
          <i style={{ display: 'flex', alignItems: 'center' }}>
            <IoIosInformationCircleOutline />
          </i>
        </Button>
      </Tooltip>

      <Drawer isOpen={isModalOpen} onClose={handleModal} placement="right" size="lg">
        <DrawerOverlay />
        <DrawerContent bgColor="#FFF" borderRadius={'16px'}>
          <CustomModalHeader title={`Add ${companySelected ? 'Subsidiary' : 'Company'} `} />
          <DrawerBody bgColor="#FFF" minH="350px">
            <CustomTabs title={tabTitles} onChange={(index: number) => setActiveTab(index)} content={tabContents} />
          </DrawerBody>
          <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid var(--day-5, #D9D9D9)">
            <Button variant="ghost" mr={3} onClick={handleModal}>
              Cancel
            </Button>
            {activeTab === 0 ? (
              <Button onClick={handleExportAndClose}>{!companySelected ? 'Add Company' : 'Add Subsidiary'}</Button>
            ) : (
              <Button isLoading={isLoading} onClick={handleSaveClick}>
                Save
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddCompany;
