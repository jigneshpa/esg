import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MdError } from 'react-icons/md';
import Select from 'react-select';
import { FormControl, FormErrorMessage, FormLabel, Icon, Input, Stack, Text, VStack } from '@chakra-ui/react';

import { BasicSearchAndSelectI } from '@/hooks/useSearchAndSelect';
import { industryApi } from '@/store/api/industry/industryApi';
import { userApi } from '@/store/api/user/userApi';
import { useAppSelector } from '@/store/hooks';
import { selectCountryList } from '@/store/slices/country/countrySelectors';
import { companySchema } from '@/types/validation-schemas/company';
import { yupResolver } from '@hookform/resolvers/yup';

import { customStyles, Placeholder } from '../../common/InputOption';

interface IEditCompanyTypeFormProps {
  onSubmit?: (values: any) => void;
  company?: any;
  currentCompany?: any; // Replace 'any' with the actual type of the 'currentCompany' property
}

interface ICompanyTypeForm extends BasicSearchAndSelectI {
  companyname: string;
  name: string;
  country_id: number;
  industry_id: number;
  address: string;
  revenue: number;
  postal_code: number;
  assignees?: string;
  two_factor?: boolean;
  lei_id: string;
}

interface ProcessedData {
  [key: string]: any;
}

// eslint-disable-next-line prettier/prettier
const SubsidiaryForm = forwardRef(
  ({ onSubmit, company, currentCompany }: IEditCompanyTypeFormProps, ref: ForwardedRef<any>) => {
    const countries = useAppSelector(selectCountryList);

    const [industriesList, setIndustriesList] = useState<[]>([]);
    const [getAllIndustriesList] = industryApi.useLazyGetAllIndustriesListQuery();
    const { data: { data: { items: usersList = [] } = {} } = {} } = userApi.useGetUserListQuery({
      page: 1,
      max_results: 999999,
      roles: ['Manager']
    });

    const {
      control,
      handleSubmit,
      formState: { errors },
      reset
    } = useForm<ICompanyTypeForm>({
      // @ts-ignore
      resolver: yupResolver(companySchema),
      defaultValues: {
        ...company,
        country_id: company?.countryId,
        postal_code: company?.postalCode,
        lei_id: company?.leiId,
        industry_id: company?.industry.id,
        region: 'N/A'
      }
    });

    const processData = (data: any) => {
      const processedData: ProcessedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== '' || (key !== 'leaseId' && key !== 'floorArea')) {
          /*@ts-ignore */
          // Trim whitespace from string values
          acc[key] = typeof value === 'string' ? value.trim() : value;
        }
        return acc;
      }, {});

      processedData['parent_id'] = currentCompany.companyId;
      processedData['manager_ids'] = processedData['assignees'];
      // processedData['industry_id'] = processedData['industry_id'].toString();
      processedData['two_factor'] = data.two_factor || false;
      if (processedData['postal_code'] == null) {
        processedData['postal_code'] = '';
      } else {
        processedData['postal_code'] = processedData['postal_code'].toString();
      }
      processedData['lei_id'] = processedData['lei_id'];

      return processedData;
    };

    useImperativeHandle(ref, () => ({
      submitForm: (callback: (processedData: ProcessedData) => Promise<void>) =>
        handleSubmit(async data => {
          const processedData = processData(data);
          await callback(processedData);
        })(),
      resetForm: () => reset()
    }));

    const getIndustries = async () => {
      const industriesData = await getAllIndustriesList({});
      setIndustriesList(
        industriesData?.data?.data.map((item: { name: any, id: number }) => ({ label: item.name, value: item.id }))
      );
    };

    useEffect(() => {
      getIndustries();
    }, []);

    return (
      <form ref={ref} onSubmit={onSubmit && handleSubmit(onSubmit)}>
        <Stack spacing={4} maxH="465px">
          {/* First Row */}

          <Stack direction={['column', 'row']} spacing={4}>
            <Controller
              name="companyname"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.name} maxW="307px">
                  <FormLabel>
                    Company Name <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input {...field} value={currentCompany.name} readOnly />
                  <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.name} maxW="307px">
                  <FormLabel>
                    Subsidiary Name <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input {...field} placeholder="Enter subsidiary name" />
                  <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </Stack>
          <Stack direction={['column', 'row']} spacing={4}>
            <Controller
              name="industry_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl maxW="307px" isInvalid={!!errors?.industry}>
                  <FormLabel>Industry</FormLabel>
                  <Select
                    components={{ Placeholder }}
                    menuPortalTarget={document.body}
                    styles={{
                      ...customStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
                    }}
                    placeholder="Select Industry"
                    options={industriesList}
                    // @ts-ignore
                    value={industriesList.find(c => c.value === value)}
                    // @ts-ignore
                    onChange={option => onChange(option?.value)}
                    menuPosition="fixed"
                  />
                  <FormErrorMessage>{errors?.industry?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
            <Controller
              name="revenue"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.revenue} maxW="307px">
                  <FormLabel>Revenue</FormLabel>
                  <Input {...field} placeholder="Enter revenue" />
                  <FormErrorMessage>{errors?.revenue?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </Stack>
          <Stack direction={['column', 'row']} spacing={4}>
            <Controller
              name="country_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl maxW="307px" isInvalid={!!errors?.country_id}>
                  <FormLabel>
                    Country <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Select
                    components={{ Placeholder }}
                    menuPortalTarget={document.body}
                    styles={{
                      ...customStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
                    }}
                    placeholder="Select country"
                    options={countries}
                    value={countries.find(c => c.value === value)}
                    onChange={option => onChange(option?.value)}
                    menuPosition="fixed"
                  />
                  <FormErrorMessage>{errors?.country_id?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.address} maxW="307px">
                  <FormLabel>Address</FormLabel>
                  <Input {...field} placeholder="Enter Street address" />
                  <FormErrorMessage>{errors?.address?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </Stack>
          <Stack direction={['column', 'row']} spacing={4}>
            <Controller
              name="postal_code"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.postal_code} maxW="307px">
                  <FormLabel>Postal Code</FormLabel>
                  <Input {...field} placeholder="Enter postal code" />
                  <FormErrorMessage>{errors?.postal_code?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
            <Controller
              name="lei_id"
              control={control}
              render={({ field }) => (
                <FormControl maxW="307px" isInvalid={!!errors?.lei_id}>
                  <VStack gap={'8px'} align={'start'}>
                    <Text fontSize={'14px'} fontWeight={400} color={'#8c8c8c'}>
                      LEI ID / Registration number
                    </Text>
                    <Input {...field} placeholder="Ex: 199800RAH1207XYDCQ23" />
                    {errors?.lei_id && (
                      <FormErrorMessage>
                        <Icon as={MdError} /> {errors?.lei_id.message}
                      </FormErrorMessage>
                    )}
                  </VStack>
                </FormControl>
              )}
            />
          </Stack>
        </Stack>
      </form>
    );
  }
);

SubsidiaryForm.displayName = 'SubsidiaryForm';
export default SubsidiaryForm;
