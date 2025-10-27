import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { MESSAGE, STATUS, USER_ROLE } from '../constants';
import { useAppContext } from '../context/AppContext';
import RejectionModal from '../pages/User/survey-list/RejectionModal';
import { ErrorData } from '../types/common';

export const useReviewStatus = (submissionId: string | null, companyId: string | null) => {
  const { confirm, notify } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useAppSelector(selectUserRole);
  const [settedStatus, setSettedStatus] = useState<string | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  const [updateReviewStatus, { isSuccess, error, isLoading }] = questionnaireApi.useUpdateReviewStatusMutation();

  const hasPermissions = userRole === 'admin' || userRole === 'manager' || userRole === USER_ROLE.USER_ADMIN;

  useEffect(() => {
    if (isSuccess) {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set('status', 'Approved');
      window.location.search = queryParams.toString();
    } else if (error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, navigate, notify, error, userRole]);

  const handleReviewStatusChange = async (status: string) => {
    setSettedStatus(status);

    if (status === 'Rejected') {
      setIsRejectionModalOpen(true);
    } else {
      confirm({
        title: `Confirm Approval`,
        type: STATUS.APPROVED,
        message: `Please confirm`,
        onOk: async () => {
          try {
            await updateReviewStatus({
              reviews: [
                {
                  submission_id: Number(submissionId),
                  status
                }
              ]
            }).unwrap();
          } catch (error) {
            notify({
              type: STATUS.ERROR,
              message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
            });
          }
        }
      });
    }
  };

  const handleRejectionSubmit = async (data: any) => {
    setIsRejectionModalOpen(false);
    try {
      await updateReviewStatus({
        reviews: [
          {
            submission_id: Number(submissionId),
            status: 'Rejected',
            remarks: data.remarks
          }
        ]
      }).unwrap();
      notify({
        type: STATUS.SUCCESS,
        message: 'Submission rejected'
      });
    } catch (error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  };

  return {
    hasPermissions,
    handleReviewStatusChange,
    isChangingStatus: isLoading,
    status: settedStatus,
    RejectionModal: () => (
      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onSubmit={handleRejectionSubmit}
      />
    )
  };
};

export default useReviewStatus;
