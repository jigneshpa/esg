import { Box, Text, Spinner, Button, Collapse, Input, Checkbox } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import NotificationDrawer from './NotificationDrawer';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { selectUserId } from '@/store/slices/user/userSelectors';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { useAppSelector } from '@/store/hooks';
import axios from 'axios';
import { mediaApi } from '@/store/api/media/mediaApi';
import { EyeIcon } from 'lucide-react';
import ListItemAnswer from '@/components/ReportingStatus/ListItemAnswer';
import { MdCloudUpload } from 'react-icons/md';
import RejectionModal from '../../pages/User/survey-list/RejectionModal';
import { Icon } from '@chakra-ui/react';
import { FaRobot } from 'react-icons/fa';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { Flex, IconButton } from '@chakra-ui/react';
import { FaMagic } from 'react-icons/fa';

interface ListItemProps {
  companyName: string;
  esgStandard: string;
  department: string;
  country: string;
  manager: string;
  year: string;
  submissionDate: string;
  question: string;
  answer: any;
  answerType: 'textBox' | 'dropDown' | 'checkbox' | 'table' | 'radio';
  status: 'approved' | 'rejected' | 'pendingSubmission' | 'pendingReview'; // Add status prop
  questionId: string;
  companyId: number;
  userQuestionnaireId: string;
  submissionId: string;
  refetch: () => void; // Add refetch prop
  assignedToUserData: any;
  hasAttachment: boolean;
  hasRemarks: boolean;
  isNotQuestion: boolean;
  attachmentFiles: { name: string, key: string, contentType: string, size: number }[] | null;
  remarks: string;
  questionContent: any;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  reviewRemarks: string | null;
  previousAnswer: string | null;
  parentQuestion: { id: string, title: string } | null;
  aiGeneratedAnswer: string | null;
}

const ListItem: React.FC<ListItemProps> = ({ companyName, esgStandard, department, country, manager, year, submissionDate, question, answer, status, answerType, questionId, companyId, userQuestionnaireId, submissionId, refetch, assignedToUserData, hasAttachment, hasRemarks, isNotQuestion, attachmentFiles, remarks, questionContent, onSelect, isSelected, reviewRemarks, previousAnswer, parentQuestion, aiGeneratedAnswer }) => {
  const [showMore, setShowMore] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const [isRejectionLoading, setIsRejectionLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(answer);
  const [attachment, setAttachment] = useState({name: '', key: '', contentType: '', size: 0});
  const [answerRemarks, setAnswerRemarks] = useState(remarks || '');
  const userId = useAppSelector(selectUserId);
  const userRole = useAppSelector(selectUserRole);
  const [updateReviewStatus, { isSuccess: isReviewSuccess, error, isLoading }] = questionnaireApi.useUpdateReviewStatusMutation();
  const [createSubmission, { isSuccess }] = questionnaireApi.useCreateSubmissionMutation();
  const [deleteSubmissions, { isLoading: isDeleting, isSuccess: isDeleteSuccess }] = questionnaireApi.useDeleteSubmissionsMutation();
  const [updateSubmission, { isSuccess: isUpdateSuccess, isLoading: isUpdating }] = questionnaireApi.useUpdateSubmissionMutation();
  const [getMediaLink] = mediaApi.useLazyGetMediaLinkQuery();
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUpdatingSubmission, setIsUpdatingSubmission] = useState(false);
  const [isRejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [showAiAnswer, setShowAiAnswer] = useState(true);

  useEffect(() => {
    if (isSuccess || isReviewSuccess || isDeleteSuccess || isUpdateSuccess) {
      refetch();
    }
  }, [isSuccess, isReviewSuccess, isDeleteSuccess, isUpdateSuccess, refetch]);

  useEffect(() => {
    if (attachmentFiles && attachmentFiles.length > 0 && attachmentFiles[0].size > 0) {
      setAttachment(attachmentFiles[0]);
    }
  }, [attachmentFiles]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          const { isSuccess, data: { data: { key: fileKey = '', url: signedUrl = '' } = {} } = {} } =
            await getMediaLink({ name: file.name });
          let uploadedFile = {};
          if (isSuccess) {
            const result = await axios.put(signedUrl, file, {
              headers: { 'Content-Type': file.type }
            });
            if (result.status === 200) {
              uploadedFile = {
                name: file.name,
                key: fileKey,
                contentType: file.type,
                size: file.size
              };
            }
          }
          return uploadedFile;
        })
      );
      // @ts-ignore
      setAttachment(uploadedFiles[0]);
      console.log('Uploaded files:', uploadedFiles);

      let payloadAnswerContent = userAnswer;
      if (answerType === 'checkbox') {
        payloadAnswerContent = JSON.stringify({checkboxOptions: userAnswer});
      } else if (answerType === 'dropDown') {
        payloadAnswerContent = JSON.stringify({dropDownOptions: questionContent?.dropDownOptions});
      } else if (answerType === 'radio') {
        payloadAnswerContent = JSON.stringify({radioOptions: userAnswer});
      }
      const payload = {
        submissions: [
          {
            company_id: companyId, // Assuming companyId is available
            submitted_by_id: Number(userId || '0'), // Assuming assignedTo is the user ID
            answer: JSON.stringify([{ 
              id: questionId,
              title: question,
              type: answerType,
              scope: 1,
              is_required: false,
              has_attachment: false,
              has_remarks: false,
              answer: userAnswer,
              files: uploadedFiles,
              content: payloadAnswerContent,
              remarks: answerRemarks,
              is_not_question: false,
              theme: ''
            }]),
            user_questionnaire_id: String(userQuestionnaireId), // Assuming userQuestionnaireId is available
            question_id: Number(questionId || '0'),
            id: Number(submissionId || '0') || null
          }
        ]
      };
      console.log('Payload:', payload);
      await createSubmission(payload);
      console.log('Submitted:', companyName);
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubmissions({ userQuestionnaireIds: [userQuestionnaireId] });
      console.log('Deleted submission:', submissionId);
    } catch (error) {
      console.error('Error deleting submission:', error);
    } finally {
      // setLoading(false);
    }
  };

  const handleUpdateSubmission = async () => {
    setIsUpdatingSubmission(true);
    try {
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          const { isSuccess, data: { data: { key: fileKey = '', url: signedUrl = '' } = {} } = {} } =
            await getMediaLink({ name: file.name });
          let uploadedFile = {};
          if (isSuccess) {
            const result = await axios.put(signedUrl, file, {
              headers: { 'Content-Type': file.type }
            });
            if (result.status === 200) {
              uploadedFile = {
                name: file.name,
                key: fileKey,
                contentType: file.type,
                size: file.size
              };
            }
          }
          return uploadedFile;
        })
      );
      // @ts-ignore
      setAttachment(uploadedFiles[0]);
      console.log('Uploaded files:', uploadedFiles, attachmentFiles);
      let previousAnswer = null;
      if (answerType === 'checkbox') {
        previousAnswer = answer.filter((option: any) => option.isChecked).map((option: any) => option.text)?.join(',');
      } else if (answerType === 'dropDown' || answerType === 'textBox') {
        previousAnswer = answer;
      } else if (answerType === 'radio') {
        previousAnswer = answer.find((option: any) => option.isChecked)?.text;
      }
      console.log('Previous answer:', previousAnswer);
      const payload = {
        submissions: [
          {
            company_id: companyId,
            submitted_by_id: Number(userId || '0'),
            answer: JSON.stringify([{
              id: questionId, title: question, type: answerType, scope: 1, is_required: false,
              has_attachment: false, has_remarks: false, answer: userAnswer,
              files: uploadedFiles && uploadedFiles.length > 0 ? uploadedFiles : attachmentFiles, content: userAnswer, remarks: answerRemarks,
              is_not_question: false, theme: '',
              previousAnswer
            }]),
            user_questionnaire_id: String(userQuestionnaireId),
            question_id: Number(questionId || '0'),
            id: Number(submissionId || '0') || null,
          }
        ]
      };
      console.log('Update Payload:', payload);
      await updateSubmission(payload);
      console.log('Updated submission:', companyName);
    } catch (error) {
      console.error('Error updating submission:', error);
    } finally {
      setIsUpdatingSubmission(false);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'approved':
        return <Box display="flex" alignItems="center">{isDeleting ? <Spinner size="sm" mr={2} /> : <DeleteIcon mr={2} color="red.500" cursor="pointer" onClick={handleDelete} />} Delete</Box>;
      case 'rejected':
        return <Box display="flex" alignItems="center"><NotificationDrawer userQuestionnaireId={Number(userQuestionnaireId)} companyName={companyName} assignedTo={assignedToUserData?.id || '-'} /> {isDeleting ? <Spinner size="sm" mr={2} /> : <DeleteIcon mr={2} color="red.500" cursor="pointer" onClick={handleDelete} />} Delete</Box>;
      case 'pendingSubmission':
        return <Box display="flex" alignItems="center"><NotificationDrawer userQuestionnaireId={Number(userQuestionnaireId)} companyName={companyName} assignedTo={assignedToUserData?.id || '-'} /> {isDeleting ? <Spinner size="sm" mr={2} /> : <DeleteIcon mr={2} color="red.500" cursor="pointer" onClick={handleDelete} />} Delete</Box>;
      case 'pendingReview':
        return <Box display="flex" alignItems="center">{isDeleting ? <Spinner size="sm" mr={2} /> : <DeleteIcon mr={2} color="red.500" cursor="pointer" onClick={handleDelete} />} Delete</Box>;
      default:
        return null;
    }
  };

  const handleApprove = async () => {
    setIsApprovalLoading(true);
    try {
      await updateReviewStatus({ reviews: [{ status: 'Approved', submission_id: submissionId }]});
      console.log('Approved:', companyName);
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setIsApprovalLoading(false);
    }
  };

  const handleRejectClick = () => {
    setRejectionModalOpen(true);
  };

  const handleRejectionSubmit = (data: { remarks: string }) => {
    setRejectionModalOpen(false);
    handleReject(data.remarks);
  };

  const handleReject = async (remarks: string) => {
    setIsRejectionLoading(true);
    try {
      const review = {
        status: 'Rejected',
        submission_id: submissionId,
      };
      if (remarks) {
        // @ts-ignore
        review.remarks = remarks;
      }
      await updateReviewStatus({ reviews: [review] });
      console.log('Rejected:', companyName);
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setIsRejectionLoading(false);
    }
  };

  function LabelValue({ label, value }: { label: string, value: string }) {
    return (
      <Box p={1} borderRadius="md" flex="1 1 auto">
        <Text fontWeight="" fontSize="xs">{label}</Text>
        <Text color="green.500" fontWeight="bold">{value}</Text>
      </Box>
    )
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      try {
        const uploadedFiles = await Promise.all(
          Array.from(files).map(async (file) => {
            const { isSuccess, data: { data: { key: fileKey = '', url: signedUrl = '' } = {} } = {} } =
              await getMediaLink({ name: file.name });
            let uploadedFile = {};
            if (isSuccess) {
              const result = await axios.put(signedUrl, file, {
                headers: { 'Content-Type': file.type }
              });
              if (result.status === 200) {
                uploadedFile = {
                  name: file.name,
                  key: fileKey,
                  contentType: file.type,
                  size: file.size
                };
              }
            }
            return uploadedFile;
          })
        );
        // @ts-ignore
        setAttachment({ name: uploadedFiles[0].name, key: uploadedFiles[0].key, contentType: uploadedFiles[0].contentType, size: uploadedFiles[0].size });
        console.log('Uploaded files:', uploadedFiles);

        // Update state or handle uploaded files as needed
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleViewAttachment = async () => {
    setIsDownloading(true);
    try {
      const greenFiTokenStr = sessionStorage.getItem('greenFiToken') || localStorage.getItem('greenFiToken');
      const token = greenFiTokenStr ? JSON.parse(greenFiTokenStr).accessToken : null;
      const baseUrl = import.meta.env.VITE_GREENFI_API;
      const queryParams = new URLSearchParams({
        key: attachment.key,
        year: '2024'
      });

      const response = await axios.get(
        `${baseUrl}/v2/questionnaire/submission/${submissionId}?${queryParams.toString()}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to fetch signed URL');
      }

      const { url } = response.data.data;
      const newTab = window.open('', '_blank');
      if (newTab && url) {
        newTab.location.href = url;
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const truncateFileName = (name: string, length: number = 10) => {
    if (name.length <= length) return name;
    return name.substring(0, length) + '...';
  };

  if (question === 'Disclose how the organization identifies, assesses, and manages climate related risks.') { 
    console.log('attachmentFiles----', attachmentFiles, hasAttachment, status);
  }
  return (
    <Box display="flex" gap={2}>
      {status === 'pendingReview' && <Checkbox isChecked={isSelected} onChange={(e) => onSelect(e.target.checked)} style={{ flexShrink: 0 }} />}
      <Box flexGrow={1} borderWidth="3px" borderRadius="lg" overflow="hidden" mb={4} bg="white" borderColor={"gray.200"} >
        {/* <Box p={4} display="flex" justifyContent="space-between" alignItems="center" bg="gray.100">
          <Text fontWeight="bold" color="teal.600">{companyName}</Text>
          <Box display="flex" gap={2} alignItems="center">
            {getIcon()}
          </Box>
        </Box> */}

        {/* Adjusted Version 2: Single Line Layout without Background Colors */}
        <Box p={2} borderRadius="md">
          <Box display="flex" flexWrap="nowrap" gap={2} alignItems="center">
            <LabelValue label="Company" value={companyName} />
            <LabelValue label="Assigned To" value={assignedToUserData?.fullName || assignedToUserData?.firstName || '-'} />
            <LabelValue label="ESG Standard" value={esgStandard} />
            <LabelValue label="Department" value={department} />
            <LabelValue label="Country" value={country} />
            <LabelValue label="Manager" value={manager} />
            <LabelValue label="Year" value={year} />
            <LabelValue label="Submission Date" value={submissionDate} />
          </Box>
        </Box>
        <Box bg="gray.100">
          <Collapse in={showMore} animateOpacity>
            <Box p={2}>
              <Box mt={2}>
                <Box mb={4} fontSize={"sm"}>
                  {(status === 'rejected' || status === 'pendingReview') && reviewRemarks && <Box display="flex" alignItems="center" gap={2}><b style={{color: 'red.500'}}>Remarks:</b> <Text color="red.500" fontSize="sm">{reviewRemarks}</Text></Box>}
                  {(status === 'rejected' || status === 'pendingReview') && previousAnswer && typeof previousAnswer === 'string' && <Box display="flex" alignItems="center" gap={2}><b>Previous Answer:</b> <Text color="blue.500" fontSize="sm">{previousAnswer}</Text></Box>}
                </Box>
                {parentQuestion && <Box mb={1} display="flex" fontWeight={"bold"} fontSize={"lg"} alignItems="center" gap={2}><Text>{parentQuestion.title}</Text></Box>}
                <Text marginBottom={2} fontWeight="bold">Q. {question}</Text>
                {aiGeneratedAnswer && status !== 'approved' && (
                  <Box mb={4} borderRadius="md" overflow="hidden" borderWidth="1px" borderColor="blue.200">
                    <Flex justify="space-between" align="center" bg="blue.50" p={2} borderTopRadius="md">
                      <Flex align="center" gap={2}>
                        <Icon as={FaRobot} w={5} h={5} color="blue.500" />
                        <Text fontSize="md" color="blue.700" fontWeight="semibold">
                          Smart Suggestions
                          <Text as="span" fontSize="xs" color="blue.600" ml={2}>
                            Powered by AI
                          </Text>
                        </Text>
                      </Flex>
                      <IconButton
                        size="sm"
                        aria-label={showAiAnswer ? 'Hide AI answer' : 'Show AI answer'}
                        icon={showAiAnswer ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => setShowAiAnswer(!showAiAnswer)}
                      />
                    </Flex>
                    <Collapse in={showAiAnswer}>
                      <Box p={2} bg="white">
                        <Text fontSize="sm" color="gray.600" fontStyle="italic">
                          {aiGeneratedAnswer}
                        </Text>
                        {answerType === 'textBox' && <Button
                          mt={2}
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<FaMagic />}
                          onClick={() => setUserAnswer(aiGeneratedAnswer)}
                        >
                          Use This Answer
                        </Button>}
                      </Box>
                    </Collapse>
                  </Box>
                )}
                <ListItemAnswer
                  answer={ (status === 'pendingSubmission' || status === 'rejected') ? userAnswer : answer}
                  status={status}
                  answerType={answerType}
                  onAnswerChange={setUserAnswer}
                  questionContent={questionContent}
                />
                {
                  Boolean(hasRemarks) && (
                    <Box mt={2}>
                      {['pendingSubmission', 'rejected'].includes(status) ? (
                        <Input
                          value={answerRemarks}
                          onChange={(e) => setAnswerRemarks(e.target.value)}
                          placeholder="Enter remarks"
                        />
                      ) : (
                        answerRemarks && <Box display="flex" alignItems="center" gap={2}><b>Remarks:</b> <Text>{answerRemarks}</Text></Box>
                      )}
                    </Box>
                  )
                }
              </Box>
              {Boolean(hasAttachment) && (
                <Box mt={2} display="flex" alignItems="center" gap={2}>
                  {
                    (status === 'pendingSubmission' || status === 'rejected') && <>
                    <Button onClick={() => fileInputRef.current?.click()} colorScheme="teal" size="sm" leftIcon={<MdCloudUpload fontSize={25} />} isLoading={uploading}>
                    Upload Attachment
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  {(selectedFiles.length > 0) && (
                    <Text fontSize="sm" color="gray.600">{truncateFileName(selectedFiles[0].name)}</Text>
                  )}
                  </>
                  }
                  {(attachment && attachment.size > 0 && status !== 'pendingSubmission') && (
                    <Button colorScheme="blue" size="sm" leftIcon={<EyeIcon />} onClick={handleViewAttachment} isLoading={isDownloading}>
                      View Attachment
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center" cursor="pointer" bgGradient="linear(to-r, pink.100, orange.100)">
            <Box display="flex" alignItems="center" gap={2} onClick={() => setShowMore(!showMore)}>
              <Text color="blue.500" fontWeight="bold" cursor="pointer">
                {showMore ? 'Show Less' : 'Show More'}
              </Text>
              {showMore ? <ChevronUpIcon color="blue.500" /> : <ChevronDownIcon color="blue.500" />}
            </Box>
            <Box p={2} display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
              {status === 'pendingReview' && userRole !== 'user' && (
                <>
                  <Button leftIcon={<CheckIcon />} colorScheme="teal" onClick={handleApprove} isLoading={isApprovalLoading} variant="solid" minWidth="120px" px={4}>
                    Approve
                  </Button>
                  <Button leftIcon={<CloseIcon />} color="red.500" colorScheme="red" onClick={handleRejectClick} isLoading={isRejectionLoading} variant="outline" minWidth="120px" px={4}>
                    Reject
                  </Button>
                </>
              )}
              {status === 'pendingSubmission' && (
                <>
                  <Button leftIcon={<CheckIcon />} colorScheme="teal" onClick={handleSubmit} isLoading={isSubmitting} variant="solid" spinner={<Spinner size="sm" />} disabled={isSubmitting} minWidth="120px" px={4}>
                    Submit
                  </Button>
                </>
              )}
              {status === 'rejected' && (
                <Button leftIcon={<CheckIcon />} colorScheme="teal" onClick={handleUpdateSubmission} isLoading={isUpdatingSubmission} variant="solid" spinner={<Spinner size="sm" />} disabled={isUpdatingSubmission} minWidth="120px" px={4}>
                  Update
                </Button>
              )}
              {
                userRole !== 'user' && getIcon()
              }
          </Box>
          </Box>
          
        </Box>
      </Box>
      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        onSubmit={handleRejectionSubmit}
      />
    </Box>
  );
};

export default ListItem;