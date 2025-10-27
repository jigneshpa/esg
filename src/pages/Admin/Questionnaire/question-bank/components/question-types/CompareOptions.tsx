import { FC, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { Box, Button, Checkbox, Flex, FormControl, FormErrorMessage, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import { comparisonOptions } from '@/constants/mock';
import { inputStyles } from '@/constants/styles/input';
import { FileUpload } from '@/components';

interface ICompareOptions {
  title: string;
  errors: any;
  question?: boolean;
  mode?: string;
  displayIndex: string;
  files?: {url?: string, name?: string};
  dwonloadUrl: () => void;
  handleView:()=>void;
}

const CompareOptions: FC<ICompareOptions> = ({ 
  title, 
  question, 
  errors, 
  mode, 
  displayIndex = '', 
  dwonloadUrl, 
  handleView,
  files 
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const { register, control, setValue } = useFormContext();
  const isAnswerMode = mode === 'answer' || mode === 'view';
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFiles,setSelectedFiles] = useState<File[]>([]);
  const labelStyles = useMemo(
    () => ({
      borderBottom: isAnswerMode ? '1px solid #DEDEDE' : undefined,
      height: isAnswerMode ? '100%' : undefined,
      backgroundColor: isAnswerMode ? '#FAFAFA' : undefined,
      fontSize: '16px',
      color: isAnswerMode ? '#1C3E57' : '#262626',
      opacity: '1 !important'
    }),
    [isAnswerMode]
  );

  useEffect(()=>{
    if(selectedFiles?.length){
      setValue('files', selectedFiles)
    }
  },[selectedFiles?.length])

  return (
    <VStack spacing={4} w="100%" justify="flex-start">
      <Box w="100%" fontSize="16px" color="#262626">
        <FormControl>
          {/*@ts-ignore*/}
          <FormLabel {...labelStyles} mx={isAnswerMode && '0'} onClick={() => setEditMode(true)}>
            {question && !isAnswerMode && editMode ? (
              <Input value={title} autoFocus {...register(`title`)} />
            ) : (
              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Text w="100%" p={isAnswerMode ? '20px' : ''}>{`${displayIndex}. ${title}`}</Text>
              {files?.url ? <Button onClick={dwonloadUrl} mr={'10px'} px={'20px'}>Dwonload Attchment</Button>: null}
            </Box>
            )}
          </FormLabel>
        </FormControl>
      </Box>
      <Flex alignItems="center" gap="15px" w="100%" px={isAnswerMode ? '20px' : '0'}>
        <FormControl w="100%" isInvalid={!!errors?.compare?.compareLeft}>
          <Input type="number" {...register('compare.compareLeft')} placeholder="Left value" />
          {errors?.compare?.compareLeft && <FormErrorMessage>{errors?.compare?.compareLeft?.message}</FormErrorMessage>}
        </FormControl>
        <Controller
          name="compare.comparisonType"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl w="250px" isInvalid={!!errors?.compare?.comparisonType}>
              <Select
                {...field}
                placeholder="Select compare"
                options={comparisonOptions}
                styles={inputStyles}
                value={comparisonOptions.find(option => option.value === value)}
                onChange={val => onChange(val?.value)}
              />
              {errors?.compare?.comparisonType && (
                <FormErrorMessage>{errors?.compare?.comparisonType?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <FormControl w="100%" isInvalid={!!errors?.compare?.compareRight}>
          <Input type="number" {...register('compare.compareRight')} placeholder="Right value" />
          {errors?.compare?.compareRight && (
            <FormErrorMessage>{errors?.compare?.compareRight?.message}</FormErrorMessage>
          )}
        </FormControl>
      </Flex>
      <Box px={isAnswerMode ? '20px' : '0'} w="100%">
        <Checkbox {...register(`compare.remarks`)}>Remarks</Checkbox>
      </Box>
      {mode == 'answer' && <Box display='flex' px={isAnswerMode ? '20px' : ''}>
          <Button
            fontSize="14px"
            mt='5px'
            fontWeight="400"
            justifyContent="center"
            h="40px"
            borderRadius="4px"
            border="1px solid #D9D9D9"
            bg="#FFF"
            color="#000"
            onClick={()=> setIsUpload(!isUpload)}
            // leftIcon={<Icon as={AiOutlineDownload} />}
            _hover={{ opacity: 0.8 }}
          >
            Add Attachment
          </Button>
          {isUpload && <VStack align="stretch" maxW="350px" ml="14px" mt='5px'>
            <FileUpload
            key="file-upload"
            setSelectedFiles={setSelectedFiles}
            acceptedFileTypes={{
              accept: {
                'image/png': ['.png'],
                'image/jpeg': ['.jpeg', '.jpg'],
                'application/pdf': ['.pdf']
              }
            }}
            mobile
            multiple={false}
            noShowDownload={true}
            isQuestion={true}
            // initialImageUrl={bill?.file?.url}
            // initialImageInfo={bill?.file}
                />
          </VStack>}
        </Box>}
    </VStack>
  );
};

export default CompareOptions;
