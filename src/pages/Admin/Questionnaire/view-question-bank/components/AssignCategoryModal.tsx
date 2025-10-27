import { useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalContent,
  ModalOverlay,
  Select,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
  Wrap,
  WrapItem
} from '@chakra-ui/react';

import CustomModalHeader from '@/components/CustomModalHeader/CustomModalHeader';
import CustomTabs from '@/components/CustomTabs';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { departmentApi } from '@/store/api/department/departmentApi';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';

interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredUsers: Array<{
    id: string,
    name: string,
    email: string,
    department?: string
  }>;
  isLoading: boolean;
  questions?: any;
  questionBankId?: number;
  companyId?: number;
  year?: number;
}

const AssignCategoryModal = ({
  isOpen,
  onClose,
  filteredUsers,
  isLoading,
  questions,
  questionBankId,
  companyId,
  year
}: AssignCategoryModalProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isAssigningDepartment, setIsAssigningDepartment] = useState(false);
  const [isAssigningUsers, setIsAssigningUsers] = useState(false);
  const { notify } = useAppContext();

  const [assignUsers] = questionnaireApi.useAssignUsersMutation();
  const [generateQuestionnaire] = questionnaireApi.useGenerateQuestionnaireMutation();

  // Fetch departments using the API
  const { data: departmentData, isLoading: isDepartmentsLoading } = departmentApi.useGetAlldepartmentsQuery({
    page: 1,
    max_results: 100
  });

  const handleDepartmentAssign = async () => {
    setIsAssigningDepartment(true);
    try {
      // Get users from the selected department
      const selectedDeptUsers = filteredUsers.filter(
        user =>
          user.department ===
          departmentData?.data?.results.find((dept: Department) => dept.id.toString() === selectedDepartment)?.name
      );

      const userIds = selectedDeptUsers.map(user => parseInt(user.id));
      const questionIdArray = questions.map((question: any) => question.id);

      if (userIds.length === 0) {
        notify({
          type: STATUS.WARNING,
          message: MESSAGE.SOMEHING_WENT_WRONG,
          description: 'No users found in the selected department'
        });
        return;
      }

      const promiseArray: any[] = [];
      questionIdArray.forEach(async (questionId: number) => {
        promiseArray.push(
          assignUsers({
            questionId,
            users: userIds,
            year: year // <-- add this line
          })
        );
        promiseArray.push(
          generateQuestionnaire({
            question_bank_id: questionBankId?.toString() || '',
            company_id: companyId,
            question_id: questionId,
            reportingAnswerYear: year // <-- add this line
          })
        );
      });

      await Promise.all(promiseArray);

      notify({
        type: STATUS.SUCCESS,
        message: `${selectedDeptUsers.length === 1 ? 'User' : 'Users'} assigned successfully`,
        description: ""
      });

      onClose();
    } catch (error) {
      console.error('Error in department assignment:', error);
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.SOMEHING_WENT_WRONG,
        description: 'Failed to assign users to department'
      });
    } finally {
      setIsAssigningDepartment(false);
    }
  };

  const handleUsersAssign = async () => {
    setIsAssigningUsers(true);
    const questionIdArray = questions.map((question: any) => question.id);
    try {
      const promiseArray: any[] = [];
      questionIdArray.forEach(async (questionId: number) => {
        promiseArray.push(
          assignUsers({
            questionId,
            users: selectedUsers.map(id => parseInt(id)),
            year: year // <-- add this line
          })
        );
        promiseArray.push(
          generateQuestionnaire({
            question_bank_id: questionBankId?.toString() || '',
            company_id: companyId,
            question_id: questionId,
            // year: year // <-- add this line
            reportingAnswerYear: year
          })
        );
      });

      await Promise.all(promiseArray);

      notify({
        type: STATUS.SUCCESS,
        message: `${selectedUsers.length === 1 ? 'User' : 'Users'} assigned successfully`,
        description: ""
      });

      onClose();
    } catch (error) {
      console.error('Error in assignment process:', error);
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.SOMEHING_WENT_WRONG,
        description: 'Failed to assign users'
      });
    } finally {
      setIsAssigningUsers(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]));
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  // Use the actual filtered users directly
  const filteredUsersList = filteredUsers.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const selectedUsersList = filteredUsers.filter(user => selectedUsers.includes(user.id));

  const AssignDepartmentTab = () => (
    <Box p={4}>
      {isDepartmentsLoading ? (
        <Box textAlign="center" py={4}>
          <Spinner size="md" color="blue.500" />
        </Box>
      ) : (
        <>
          <Select
            placeholder="Select Department"
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            mb={4}
            isDisabled={isAssigningDepartment}
          >
            {departmentData?.data?.results.map((dept: Department) => (
              <option key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </option>
            ))}
          </Select>
          <Button
            colorScheme="blue"
            isDisabled={!selectedDepartment || isAssigningDepartment}
            onClick={handleDepartmentAssign}
            w="100%"
            isLoading={isAssigningDepartment}
            loadingText="Assigning..."
          >
            Assign Department
          </Button>
        </>
      )}
    </Box>
  );

  const AssignUsersTab = () => (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <BiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            ref={searchInputRef}
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            isDisabled={isAssigningUsers}
          />
        </InputGroup>

        {isLoading ? (
          <Box textAlign="center" py={4}>
            <Spinner size="md" color="blue.500" />
          </Box>
        ) : (
          <>
            {selectedUsers.length > 0 && (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Selected Users ({selectedUsers.length})
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => setSelectedUsers([])}
                    isDisabled={isAssigningUsers}
                  >
                    Clear all
                  </Button>
                </HStack>
                <Wrap spacing={2} mb={2}>
                  {selectedUsersList.map(user => (
                    <WrapItem key={`selected-${user.id}`}>
                      <Tag size="md" borderRadius="full" variant="subtle" colorScheme="blue">
                        <Avatar src="" name={user.name} size="xs" ml={-1} mr={2} />
                        <TagLabel>{user.name}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveUser(user.id)} isDisabled={isAssigningUsers} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
                <Divider />
              </Box>
            )}

            <Box>
              <Text fontSize="sm" color="gray.600" mb={2} fontWeight="medium">
                All Users
              </Text>
              <Box maxH="300px" overflowY="auto" borderWidth="1px" borderRadius="md" p={2}>
                <VStack align="stretch" spacing={1}>
                  {filteredUsersList.map(user => (
                    <Checkbox
                      key={user.id}
                      isChecked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      p={2}
                      borderRadius="md"
                      _hover={{ bg: 'gray.50' }}
                      isDisabled={isAssigningUsers}
                    >
                      <HStack spacing={3}>
                        <Avatar size="sm" name={`${user.name}`} />
                        <Box>
                          <Text fontWeight="medium">{`${user.name} (${user.department || ''})`}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {user.email}
                          </Text>
                        </Box>
                      </HStack>
                    </Checkbox>
                  ))}
                  {filteredUsersList.length === 0 && (
                    <Text color="gray.500" p={2} textAlign="center">
                      No users found
                    </Text>
                  )}
                </VStack>
              </Box>
            </Box>

            <Button
              colorScheme="blue"
              isDisabled={selectedUsers.length === 0 || isAssigningUsers}
              onClick={handleUsersAssign}
              w="100%"
              isLoading={isAssigningUsers}
              loadingText="Assigning..."
            >
              Assign User{selectedUsers?.length > 1 ? 's' : ''}
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white" minW="800px" maxH="90vh" overflowY="auto">
        <CustomModalHeader title="Assign Category" />
        <Box p={4}>
          <CustomTabs
            title={['Assign Department', 'Assign Users']}
            content={[<AssignDepartmentTab />, <AssignUsersTab />]}
            containerStyle={{ bg: 'white', p: 4, borderRadius: 'md' }}
            selectedTabStyle={{
              color: 'blue.500',
              borderBottom: '2px solid',
              borderColor: 'blue.500'
            }}
          />
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default AssignCategoryModal;
