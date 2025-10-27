import { BsSearch } from 'react-icons/bs';
import { AsyncPaginate } from 'react-select-async-paginate';
import {
  Box,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  Stack,
  Text
} from '@chakra-ui/react';

import { HeadingText } from '@/components';
import { CustomValueContainer } from '@/components/common/SortableHeader';
import useLoadOptions, { ApiType } from '@/hooks/useLoadOptions';
import useSearchAndSelect from '@/hooks/useSearchAndSelect';

import { customDraftInputStyles, InputOption, Placeholder } from '../../../../../components/common/InputOption';
import AddQuestionModal from '../components/AddQuestionModal';
import { QuestionFormSubmit } from '../components/QuestionForm';

const CreateQuestionBank = () => {
  const {
    institution,
    framework,
    industry,
    department,
    scope,
    handleSearchChange,
    handleInstitutionChange,
    handleFrameworkChange,
    handleIndustryChange,
    handleDepartmentChange,
    handleScopeChange
    //@ts-ignore
  } = useSearchAndSelect<QuestionFormSubmit>({});

  // const loadInstitutionOptions = useLoadOptions(ApiType.Institution);
  // const loadFrameworkOptions = useLoadOptions(ApiType.Framework);
  // const loadIndustryOptions = useLoadOptions(ApiType.Industry);
  // const loadDepartmentOptions = useLoadOptions(ApiType.Department);
  // const loadScopeOptions = useLoadOptions(ApiType.Scope);

  const { loadOptions: loadInstitutionOptions } = useLoadOptions(ApiType.Institution);
  const { loadOptions: loadFrameworkOptions } = useLoadOptions(ApiType.Framework);
  const { loadOptions: loadIndustryOptions } = useLoadOptions(ApiType.Industry);
  const { loadOptions: loadDepartmentOptions } = useLoadOptions(ApiType.Department);
  const { loadOptions: loadScopeOptions } = useLoadOptions(ApiType.Scope);

  return (
    <Box w="100%">
      <HStack justify="space-between" pt="20px" px="35px">
        <HeadingText>ESG Standard Name</HeadingText>
        <AddQuestionModal />
      </HStack>
      <HStack
        h="70px"
        borderRadius={'5px'}
        bgColor="#137E59"
        mx="35px"
        px="8px"
        mt="12px"
        mb="20px"
        justify="space-between"
      >
        <FormControl variant="floating">
          <InputGroup
            minW={'150px'}
            maxW={{
              base: '80%',
              xl: '280px'
            }}
            bg={'white'}
            borderRadius={'8px'}
          >
            <InputLeftElement>
              <Icon as={BsSearch} />
            </InputLeftElement>
            <Input onChange={handleSearchChange} placeholder="" />
            <FormLabel
              css={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
              }}
            >
              Search Question
            </FormLabel>
          </InputGroup>
        </FormControl>
        <HStack>
          <FormControl variant="floating">
            <InputGroup zIndex={5}>
              <AsyncPaginate
                placeholder=""
                styles={customDraftInputStyles}
                components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                debounceTimeout={800}
                loadOptions={loadScopeOptions}
                isMulti
                additional={{
                  page: 1
                }}
                onChange={handleScopeChange}
                hideSelectedOptions={false}
                value={scope}
                noOptionsMessage={() => 'No Scope Found'}
              />
              {/* @ts-ignore */}
              <Input placeholder="" value={scope} hidden />
              <FormLabel
                css={{
                  '@media (max-width: 1291px)': {
                    maxWidth: '70px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1160px)': {
                    maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1037px)': {
                    maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
                  }
                }}
              >
                Scope
              </FormLabel>
            </InputGroup>
          </FormControl>
          <FormControl variant="floating">
            <InputGroup zIndex={5}>
              <AsyncPaginate
                placeholder=""
                styles={customDraftInputStyles}
                components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                debounceTimeout={800}
                loadOptions={loadDepartmentOptions}
                isClearable
                isMulti
                additional={{
                  page: 1
                }}
                onChange={handleDepartmentChange}
                hideSelectedOptions={false}
                value={department}
                noOptionsMessage={() => 'No Department Found'}
              />
              {/* @ts-ignore */}
              <Input placeholder="" value={department} hidden />
              <FormLabel
                css={{
                  '@media (max-width: 1291px)': {
                    maxWidth: '70px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1160px)': {
                    maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1037px)': {
                    maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
                  }
                }}
              >
                Department
              </FormLabel>
            </InputGroup>
          </FormControl>
          <FormControl variant="floating">
            <InputGroup zIndex={5}>
              <AsyncPaginate
                placeholder=""
                styles={customDraftInputStyles}
                components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                debounceTimeout={800}
                loadOptions={loadInstitutionOptions}
                isClearable
                isMulti
                additional={{
                  page: 1
                }}
                onChange={handleInstitutionChange}
                hideSelectedOptions={false}
                value={institution}
                noOptionsMessage={() => 'No Institution Found'}
              />
              {/* @ts-ignore */}
              <Input placeholder=" " value={institution} hidden />
              <FormLabel
                css={{
                  '@media (max-width: 1291px)': {
                    maxWidth: '70px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1160px)': {
                    maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1037px)': {
                    maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
                  }
                }}
              >
                Institution
              </FormLabel>
            </InputGroup>
          </FormControl>

          <FormControl variant="floating">
            <InputGroup zIndex={5}>
              <AsyncPaginate
                placeholder=""
                debounceTimeout={800}
                styles={customDraftInputStyles}
                components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                isClearable
                isMulti
                value={framework}
                loadOptions={loadFrameworkOptions}
                additional={{
                  page: 1
                }}
                onChange={handleFrameworkChange}
                hideSelectedOptions={false}
                noOptionsMessage={() => 'No Framework Found'}
              />
              {/* @ts-ignore */}
              <Input placeholder="" value={framework} hidden />
              <FormLabel
                css={{
                  '@media (max-width: 1291px)': {
                    maxWidth: '70px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1160px)': {
                    maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1037px)': {
                    maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
                  }
                }}
              >
                ESG Standard
              </FormLabel>
            </InputGroup>
          </FormControl>

          <FormControl variant="floating">
            <InputGroup zIndex={5}>
              <AsyncPaginate
                placeholder=""
                debounceTimeout={800}
                styles={customDraftInputStyles}
                components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                isClearable
                isMulti
                value={industry}
                noOptionsMessage={() => 'No Industry Found'}
                loadOptions={loadIndustryOptions}
                additional={{
                  page: 1
                }}
                onChange={handleIndustryChange}
                hideSelectedOptions={false}
              />
              {/* @ts-ignore */}
              <Input placeholder="" value={industry} hidden />
              <FormLabel
                css={{
                  '@media (max-width: 1291px)': {
                    maxWidth: '70px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1160px)': {
                    maxWidth: '50px' // Reset maxWidth for viewport width less than 700px
                  },
                  '@media (max-width: 1037px)': {
                    maxWidth: '30px' // Reset maxWidth for viewport width less than 700px
                  }
                }}
              >
                Industry
              </FormLabel>
            </InputGroup>
          </FormControl>
        </HStack>
      </HStack>
      <List spacing={3} mt="20px" px="35px">
        <Stack spacing={10}>
          <Box padding="6" boxShadow="lg" bg="white">
            <Center mt="4">
              <Flex
                p={4}
                borderRadius="md"
                h="300px"
                alignItems="center"
                direction={'column'}
                justifyContent={'Center'}
              >
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  No questions added yet!
                </Text>
                <Text mb={4}>Please add new questions to continue.</Text>
                <AddQuestionModal />
              </Flex>
            </Center>
          </Box>
        </Stack>
      </List>
    </Box>
  );
};

export default CreateQuestionBank;
