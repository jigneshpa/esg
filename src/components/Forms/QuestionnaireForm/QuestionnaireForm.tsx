import { ForwardedRef, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';

import { useAppSelector } from '@/store/hooks';
import { selectCountryList } from '@/store/slices/country/countrySelectors';
import { userSchema } from '@/types/validation-schemas/user';
import { yupResolver } from '@hookform/resolvers/yup';

interface IEditQuestionnaireTypeFormProps {
  onSubmit?: (values: any) => void;
  questionnaire?: any;
}

interface IQuestionnaireTypeForm {}

interface ProcessedData {
  [key: string]: any;
}

// eslint-disable-next-line prettier/prettier
const QuestionnaireForm = forwardRef(
  ({ onSubmit, questionnaire }: IEditQuestionnaireTypeFormProps, ref: ForwardedRef<any>) => {
    const countries = useAppSelector(selectCountryList);

    const {
      control,
      handleSubmit,
      formState: { errors },
      reset
    } = useForm<IQuestionnaireTypeForm>({
      // @ts-ignore
      resolver: yupResolver(userSchema)
      // defaultValues: { ...user, country_id: user?.countryId }
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

      // processedData['roleId'] = RoleId[userRole]

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

    return (
      <form ref={ref} onSubmit={onSubmit && handleSubmit(onSubmit)}>
        {/*<Stack spacing={4} maxH="503px">*/}
        {/*  /!* First Row *!/*/}
        {/*  <Stack direction={['column', 'row']} spacing={4}>*/}
        {/*    <Controller*/}
        {/*      name="userName"*/}
        {/*      control={control}*/}
        {/*      render={({ field }) => (*/}
        {/*        <FormControl isInvalid={!!errors.userName} maxW="307px">*/}
        {/*          <FormLabel>Username</FormLabel>*/}
        {/*          <Input {...field} placeholder="Enter user name" />*/}
        {/*          <FormErrorMessage>{errors?.userName?.message}</FormErrorMessage>*/}
        {/*        </FormControl>*/}
        {/*      )}*/}
        {/*    />*/}
        {/*    <Controller*/}
        {/*      name="email"*/}
        {/*      control={control}*/}
        {/*      render={({ field }) => (*/}
        {/*        <FormControl isInvalid={!!errors.email}>*/}
        {/*          <FormLabel>Email ID</FormLabel>*/}
        {/*          <Input {...field} placeholder="Enter email" />*/}
        {/*          <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>*/}
        {/*        </FormControl>*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  </Stack>*/}

        {/*  <Stack direction={['column', 'row']} spacing={4}>*/}
        {/*    <Controller*/}
        {/*      name="country_id"*/}
        {/*      control={control}*/}
        {/*      render={({ field: { onChange, value } }) => (*/}
        {/*        <FormControl maxW="307px" isInvalid={!!errors?.country_id}>*/}
        {/*          <FormLabel>Country</FormLabel>*/}
        {/*          <DropDown*/}
        {/*            placeholder="Select asset country"*/}
        {/*            selection="single"*/}
        {/*            w="100%"*/}
        {/*            borderRadius="2px"*/}
        {/*            options={countries?.length ? countries : []}*/}
        {/*            value={value}*/}
        {/*            onChange={(val: string) => onChange(val ? Number(val) : '')}*/}
        {/*          />*/}
        {/*          <FormErrorMessage>{errors?.country_id?.message}</FormErrorMessage>*/}
        {/*        </FormControl>*/}
        {/*      )}*/}
        {/*    />*/}
        {/*    /!* Need to me changed Row *!/*/}
        {/*    <Controller*/}
        {/*      name="role"*/}
        {/*      control={control}*/}
        {/*      render={({ field: { onChange, value } }) => (*/}
        {/*        <FormControl maxW="307px" isInvalid={!!errors?.role}>*/}
        {/*          <FormLabel>Role</FormLabel>*/}
        {/*          <DropDown*/}
        {/*            placeholder="Select user role"*/}
        {/*            selection="single"*/}
        {/*            w="100%"*/}
        {/*            borderRadius="2px"*/}
        {/*            options={userRoles?.length ? userRoles : []}*/}
        {/*            value={value}*/}
        {/*            onChange={onChange}*/}
        {/*          />*/}
        {/*          <FormErrorMessage>{errors?.role?.message}</FormErrorMessage>*/}
        {/*        </FormControl>*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  </Stack>*/}
        {/*  <Controller*/}
        {/*    name="contactNumber"*/}
        {/*    control={control}*/}
        {/*    render={({ field }) => (*/}
        {/*      <FormControl isInvalid={!!errors.contactNumber} maxW="307px">*/}
        {/*        <FormLabel>Contact Number</FormLabel>*/}
        {/*        <Input {...field} placeholder="Enter phone number" />*/}
        {/*        <FormErrorMessage>{errors?.contactNumber?.message}</FormErrorMessage>*/}
        {/*      </FormControl>*/}
        {/*    )}*/}
        {/*  />*/}
        {/*</Stack>*/}
      </form>
    );
  }
);

QuestionnaireForm.displayName = 'QuestionnaireForm';
export default QuestionnaireForm;
