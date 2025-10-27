import { ForwardedRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CiCircleInfo } from 'react-icons/ci';
import Select from 'react-select';
import { Checkbox, FormControl, FormErrorMessage, FormLabel, Icon, Stack } from '@chakra-ui/react';

import { userApi } from '@/store/api/user/userApi';
import { ISelect } from '@/types/common';
import { User } from '@/types/user';
import { twoLevelApprovalSchema } from '@/types/validation-schemas/twoLevelApproval';
import { yupResolver } from '@hookform/resolvers/yup';

import { customStyles, InputOption, Placeholder } from '../../common/InputOption';

interface IEditTypeFormProps {
  onSubmit?: (values: any) => void;
  data?: any;
  companies?: Array<number>;
}

interface ITypeForm {
  reviewers?: string;
  hasTwoLevelApproval?: boolean;
  companies?: Array<number>;
}

interface ProcessedData {
  [key: string]: any;
}

// eslint-disable-next-line prettier/prettier
const TwoLevelApprovalForm = forwardRef(
  ({ onSubmit, data, companies = [] }: IEditTypeFormProps, ref: ForwardedRef<any>) => {
    const [isTwoLevelApproval, onChangeIsTwoLevelApproval] = useState<boolean>(false);
    const [selectedUsers, setSelectedUsers] = useState<ISelect[] | null>(null);
    const { data: { data: { items: usersList = [] } = {} } = {} } = userApi.useGetUserListQuery({
      page: 1,
      max_results: 999999,
      roles: ['Manager']
    });

    const {
      control,
      handleSubmit,
      formState: { errors },
      setValue,
      reset
    } = useForm<ITypeForm>({
      resolver: yupResolver(twoLevelApprovalSchema),
      // @ts-ignore
      defaultValues: {
        ...data,
        hasTwoLevelApproval: false,
        reviewers: data?.reviewers ? data.reviewers.map((assignee: any) => assignee.reviewer.userName).join(', ') : ''
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

      const reviewersArray = data.reviewers
        ? data.reviewers
            .split(',')
            .map((username: string) => username.trim())
            .filter(Boolean)
        : [];

      processedData['reviewers'] = Array.isArray(reviewersArray) ? reviewersArray : [reviewersArray];
      processedData['hasTwoLevelApproval'] = isTwoLevelApproval;
      processedData['companies'] = companies;

      return processedData;
    };

    useImperativeHandle(ref, () => ({
      submitForm: (callback: (processedData: ProcessedData) => Promise<void>) =>
        handleSubmit(async data => {
          const processedData = processData(data);
          await callback(processedData);
          setSelectedUsers(null);
        })(),
      resetForm: () => reset()
    }));

    const handleSelectChange = (selectedOptions: any) => {
      setSelectedUsers(selectedOptions);

      const usernames = selectedOptions?.map((option: ISelect) => option.label) || [];
      setValue('reviewers', usernames.join(', '));
    };

    return (
      <form ref={ref} onSubmit={onSubmit && handleSubmit(onSubmit)}>
        <Stack spacing={4} maxH="503px">
          <Stack direction={['row']} spacing={4}>
            <Controller
              name="reviewers"
              control={control}
              render={({ field }) => (
                <FormControl maxW="307px" isInvalid={!!errors?.reviewers}>
                  <FormLabel alignItems="center">
                    Assign Manager
                    <Icon as={CiCircleInfo} w="14px" h="14px" m="auto 4px" />
                    (optional)
                  </FormLabel>
                  <Select
                    id="user-select"
                    {...field}
                    isClearable
                    styles={customStyles}
                    placeholder={'Select User/s'}
                    noOptionsMessage={() => 'No Users Found'}
                    isMulti
                    value={selectedUsers}
                    onChange={handleSelectChange}
                    options={usersList?.map((user: User) => ({ label: user.userName, value: user.id }))}
                    components={{
                      Option: InputOption,
                      Placeholder: Placeholder
                    }}
                    hideSelectedOptions={false}
                    menuPosition="fixed"
                  />
                  {errors?.reviewers && <FormErrorMessage>{errors?.reviewers?.message}</FormErrorMessage>}
                </FormControl>
              )}
            />
          </Stack>
          <Stack direction={['row']} spacing={4}>
            <Checkbox
              isChecked={isTwoLevelApproval}
              onChange={() => onChangeIsTwoLevelApproval(!isTwoLevelApproval)}
              spacing="10px"
            >
              Two Level Approval
            </Checkbox>
          </Stack>
        </Stack>
      </form>
    );
  }
);

TwoLevelApprovalForm.displayName = 'TwoLevelApprovalForm';
export default TwoLevelApprovalForm;
