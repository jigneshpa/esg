import ListItem from '@/components/ReportingStatus/ListItem';
import SearchAndDropdowns from '@/components/ReportingStatus/SearchAndDropdowns';
import ReportingTabs from '@/components/ReportingStatus/Tabs';
import { useState, useMemo, useCallback } from 'react';
import { submissions } from '@/store/api/submissions/submissions';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { Spinner, Box, Text, Button, Checkbox } from '@chakra-ui/react';
import { selectUserCompanyId, selectUserId, selectUserRole } from '@/store/slices/user/userSelectors';
import { useAppSelector } from '@/store/hooks';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import RejectionModal from '../../User/survey-list/RejectionModal';

const CompanyReportingStatus = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [isBulkRejecting, setIsBulkRejecting] = useState(false);
  const { companyId } = useParams();
  const userCompanyId = useAppSelector(selectUserCompanyId);
  const userRole = useAppSelector(selectUserRole);
  const userId = useAppSelector(selectUserId);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [updateReviewStatus] = questionnaireApi.useUpdateReviewStatusMutation();
  const [isRejectionModalOpen, setRejectionModalOpen] = useState(false);

  const finalCompanyId: number = Number((userRole === 'user' || userRole === 'manager') ? userCompanyId : companyId);
  const { data: disclosureData, isLoading: disclosureLoading, refetch } = submissions.useGetAdminCompanyDisclosureListQuery({
    page: 1,
    max_results: 1000,
    companyIds: [finalCompanyId],
  });

  const filteredData = useMemo(() => {
    if (!disclosureData?.data?.items) return [];
    let dataItems = [...disclosureData?.data?.items];
    if (userRole === 'user') {
      dataItems = dataItems.filter((item: any) => item.submittedBy?.id === userId);
    }
    if (!searchTerm) return dataItems || [];
    return dataItems.filter((item: any) =>
      (item.questionData?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (item.questionBank?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (item?.submittedBy?.fullName || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      // (JSON.parse(item?.answer || '[]')[0]?.answer || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [disclosureData, searchTerm]);

  const segregatedData: {
    approved: any[];
    pendingSubmission: any[];
    pendingReview: any[];
    rejected: any[];
  } = {
    approved: [],
    pendingSubmission: [],
    pendingReview: [],
    rejected: []
  };

  filteredData.forEach((item: any) => {
    const files = JSON.parse(item?.answer || '[]')[0]?.files || null;
    const originalAnswer = item?.answer;
    const modifiedItem = {
      ...item,
      answer: JSON.parse(item?.answer || '[]')[0]?.answer || null,
      previousAnswer: JSON.parse(item?.answer || '[]')[0]?.previousAnswer || null,
      files: files && files.length > 0 ? files : null,
      remarks: JSON.parse(item?.answer || '[]')[0]?.remarks || null,
      originalAnswer: originalAnswer
    };
    switch (item.status) {
      case 'Approved':
        segregatedData.approved.push(modifiedItem);
        break;
      case 'Pending Submission':
        segregatedData.pendingSubmission.push(modifiedItem);
        break;
      case 'Pending Approval':
        segregatedData.pendingReview.push(modifiedItem);
        break;
      case 'Rejected':
        segregatedData.rejected.push(modifiedItem);
        break;
      default:
        break;
    }
  });


  const handleSelectItem = useCallback((id: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (selected) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback((selectAll: boolean) => {
    if (selectAll) {
      const allIds = segregatedData.pendingReview.map((item: any) => item.id);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  }, [segregatedData.pendingReview]);

  const handleBulkApprove = async () => {
    try {
      setIsBulkApproving(true);
      const reviews = Array.from(selectedItems).map(id => ({ status: 'Approved', submission_id: id }));
      await updateReviewStatus({ reviews });
      console.log('Bulk approved:', reviews);
      await refetch();
      setSelectedItems(new Set()); // Clear selection after action
    } catch (error) {
      console.error('Error in bulk approve:', error);
    } finally {
      setIsBulkApproving(false);
    }
  };

  const handleRejectClick = () => {
    setRejectionModalOpen(true);
  };

  const handleRejectionSubmit = (data: { remarks: string }) => {
    setRejectionModalOpen(false);
    handleBulkReject(data?.remarks);
  };

  const handleBulkReject = async (remarks: string) => {
    try {
      setIsBulkRejecting(true);
      const reviews = Array.from(selectedItems).map(id => {
        const review = {
          status: 'Rejected',
          submission_id: id,
        }
        if (remarks) {
          // @ts-ignore
          review.remarks = remarks;
        }
        return review;
      });
      await updateReviewStatus({ reviews });
      console.log('Bulk rejected:', reviews);
      await refetch();
      setSelectedItems(new Set()); // Clear selection after action
    } catch (error) {
      console.error('Error in bulk reject:', error);
    } finally {
      setIsBulkRejecting(false);
    }
  };

  console.log('Segregated Data:', segregatedData);
  console.log('Original Data:', disclosureData?.data?.items);

  const getListItem = (data: any, status: 'approved' | 'rejected' | 'pendingSubmission' | 'pendingReview') => {
    return <ListItem
      key={data?.userQuestionnaireId + data?.userQuestionnaireCreatedAt + data?.questionData?.id}
      companyId={finalCompanyId}
      submissionId={data?.id || ''}
      userQuestionnaireId={data?.userQuestionnaireId || ''}
      companyName={data?.company?.name || '-'}
      esgStandard={data?.questionBank?.name || '-'}
      department={data?.department?.name || '-'}
      country={data?.country?.name || '-'}
      manager={data?.manager?.name || '-'}
      // year={data?.year || '-'}
      year={data?.reportingAnswerYear || '-'}
      submissionDate={data?.userQuestionnaireUpdatedAt ? format(new Date(data.userQuestionnaireUpdatedAt), 'd MMMM yyyy') : '-'}
      question={data?.questionData?.title || '-'}
      questionId={data?.questionData?.id || ''}
      answer={data?.answer || ''}
      status={status} // Pass status prop
      answerType={data?.questionData?.type || 'textBox'}
      refetch={refetch}
      assignedToUserData={data?.submittedBy || {}}
      hasAttachment={data?.questionData?.has_attachment}
      hasRemarks={data?.questionData?.has_remarks}
      isNotQuestion={data?.questionData?.is_not_question}
      attachmentFiles={data?.files}
      remarks={data?.remarks}
      questionContent={JSON.parse(data?.questionData?.questionContent || '{}') || null}
      onSelect={(selected) => handleSelectItem(data.id, selected)}
      isSelected={selectedItems.has(data.id)}
      reviewRemarks={data?.reviewRemarks || null}
      previousAnswer={ (status === 'rejected' || status === 'pendingReview') ? data?.previousAnswer || null : null}
      parentQuestion={data?.parentQuestion || null}
      aiGeneratedAnswer={data?.aiGeneratedAnswer || null}
    />
  }

  const renderContent = () => {
    if (disclosureLoading) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Spinner size="xl" /></Box>;
    }
    if (activeTab === 'approved' && segregatedData.approved.length === 0) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Text>No Data Available</Text></Box>;
    } else if (activeTab === 'rejected' && segregatedData.rejected.length === 0) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Text>No Data Available</Text></Box>;
    } else if (activeTab === 'pendingSubmission' && segregatedData.pendingSubmission.length === 0) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Text>No Data Available</Text></Box>;
    } else if (activeTab === 'pendingReview' && segregatedData.pendingReview.length === 0) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><Text>No Data Available</Text></Box>;
    }
    switch (activeTab) {
      case 'approved':
        return (
          <>
            {segregatedData.approved.map((data, index) => (
              getListItem(data, 'approved')
            ))}
          </>
        );
      case 'rejected':
        return (
          <>
          {segregatedData.rejected.map((data, index) => (
              getListItem(data, 'rejected')
            ))}
          </>
        );
      case 'pendingSubmission':
        return (
          <>
            {segregatedData.pendingSubmission.map((data, index) => (
              getListItem(data, 'pendingSubmission')
            ))}
          </>
        );
      case 'pendingReview':
        return (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: '2rem' }}>
              <Checkbox onChange={(e) => handleSelectAll(e.target.checked)}>Select All</Checkbox>
              {selectedItems.size > 0 && userRole !== 'user' && (
                <Box display="flex" gap={2}>
                  <Button colorScheme="teal" leftIcon={<CheckIcon />} onClick={handleBulkApprove} variant="solid" minWidth="120px" px={4} isLoading={isBulkApproving}>Approve Selected</Button>
                  <Button color="red.500" colorScheme="red" leftIcon={<CloseIcon />} onClick={handleRejectClick} variant="outline" minWidth="120px" px={4} isLoading={isBulkRejecting}>Reject Selected</Button>
                </Box>
              )}
            </Box>
            {segregatedData.pendingReview.map((data, index) => (
              getListItem(data, 'pendingReview')
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', padding: '30px', position: 'relative' }}>
      <ReportingTabs onChange={setActiveTab} />
      <SearchAndDropdowns onSearch={setSearchTerm} />
      {renderContent()}
      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        onSubmit={handleRejectionSubmit}
      />
    </div>
  );
};

export default CompanyReportingStatus;
