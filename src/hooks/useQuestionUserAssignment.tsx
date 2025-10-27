import { useEffect, useRef, useState } from 'react';

import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { Question } from '@/types/question';
import { setUnassignOperationActive } from '@/utils/unassignTracker';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { MESSAGE, STATUS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectUserRole } from '../store/slices/user/userSelectors';
import { ErrorData } from '../types/common';

interface UseQuestionUserAssignmentProps {
  questionId: number;
  setIsEditMode: (value: boolean) => void;
  bankId?: string;
  year?: number;
}

interface QuestionBankResponse {
  data: {
    questions: Question[]
  };
}

const useQuestionUserAssignment = ({ questionId, setIsEditMode, bankId, year }: UseQuestionUserAssignmentProps) => {
  const { notify, confirm } = useAppContext();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(selectUserRole);
  const [currentAction, setCurrentAction] = useState<'assign' | 'unassign' | null>(null);
  const processingResponseRef = useRef<boolean>(false);
  const previousStateRef = useRef<any>(null);
  const blockGenerateQuestionnaireRef = useRef<boolean>(false);
  const processedResponseIds = useRef<Set<string>>(new Set());
  const [assignUsers, { isLoading, isSuccess, error, data: assignUsersData }] =
    questionnaireApi.useAssignUsersMutation();
  const [generateQuestionnaire] = questionnaireApi.useGenerateQuestionnaireMutation();

  // Get the current question bank data from the store
  const currentQuestionBank = useAppSelector(
    state => questionnaireApi.endpoints.getQuestionBankListById.select({ bankId: Number(bankId) })(state).data
  ) as QuestionBankResponse;

  useEffect(() => {
    if (isSuccess && assignUsersData?.data) {
      // Create stable response ID based on operation content, not changing state
      const operationContent = {
        questionId: assignUsersData.data.questionId,
        userIds: assignUsersData.data.assignedUsers?.map((u: any) => u.userId).sort(),
        // Use a hash of the full response data instead of currentAction which can change
        responseHash: JSON.stringify(assignUsersData.data).substring(0, 20)
      };
      const responseId = `${operationContent.questionId}-${operationContent.userIds?.join(',')}-${
        operationContent.responseHash
      }`;

      // Check if we've already processed this specific operation
      if (processingResponseRef.current || processedResponseIds.current.has(responseId)) {
        console.log('⏭️ SKIPPING duplicate operation processing for:', responseId);
        return;
      }

      // Mark this operation as being processed
      processingResponseRef.current = true;
      processedResponseIds.current.add(responseId);
      console.log('🔄 PROCESSING operation:', responseId);
      console.log('🔍 Operation details:', {
        questionId: operationContent.questionId,
        userIds: operationContent.userIds,
        currentAction,
        responseHash: operationContent.responseHash
      });

      console.log('🔍 API Response Analysis:', {
        fullResponse: assignUsersData,
        responseData: assignUsersData.data,
        currentAction: currentAction
      });

      // Primary check: if response has unassignedUsers, it's definitely an unassign action
      const hasUnassignedUsers = !!(
        assignUsersData.data.unassignedUsers && assignUsersData.data.unassignedUsers.length > 0
      );
      // Secondary check: explicit action field in response
      const responseActionIsUnassign = assignUsersData.data.action === 'unassign';
      // Tertiary check: current action state - THIS IS THE MOST RELIABLE
      const currentActionIsUnassign = currentAction === 'unassign';

      console.log('🧪 Unassign Detection:', {
        hasUnassignedUsers,
        responseActionIsUnassign,
        currentActionIsUnassign,
        unassignedUsersInResponse: assignUsersData.data.unassignedUsers,
        actionInResponse: assignUsersData.data.action
      });

      // HARDCODED FIX: If blockGenerateQuestionnaireRef is true, this is definitely an unassign operation
      const isUnassignAction =
        blockGenerateQuestionnaireRef.current ||
        currentActionIsUnassign ||
        hasUnassignedUsers ||
        responseActionIsUnassign;
      console.log(
        '✅ Final determination - isUnassignAction:',
        isUnassignAction,
        '(blockFlag:',
        blockGenerateQuestionnaireRef.current,
        ')'
      );

      const message = isUnassignAction
        ? 'Users unassigned successfully'
        : 'Users assigned successfully';

      notify({
        type: STATUS.SUCCESS,
        message: message
      });
      setIsEditMode(false);

      // Process the response and trigger generateQuestionnaire (only for assign operations)
      // DOUBLE CHECK: Never call generateQuestionnaire if this was an unassign operation
      console.log('🔍 EVALUATING generateQuestionnaire condition:', {
        bankId: !!bankId,
        hasAssignedUsers: !!assignUsersData.data.assignedUsers,
        isUnassignAction: isUnassignAction,
        currentActionIsUnassign: currentActionIsUnassign,
        blockGenerateQuestionnaireFlag: blockGenerateQuestionnaireRef.current,
        shouldCallGenerate: !!(
          bankId &&
          assignUsersData.data.assignedUsers &&
          !isUnassignAction &&
          !currentActionIsUnassign &&
          !blockGenerateQuestionnaireRef.current
        )
      });

      // ULTIMATE SAFEGUARD: Never call generateQuestionnaire if blockGenerateQuestionnaireRef is true
      if (
        bankId &&
        assignUsersData.data.assignedUsers &&
        !isUnassignAction &&
        !currentActionIsUnassign &&
        !blockGenerateQuestionnaireRef.current
      ) {
        console.log('🎯 CALLING generateQuestionnaire because this was an ASSIGN operation');
        // Get unique companyIds from assignedUsers
        const uniqueCompanyIds = Array.from(
          new Set(assignUsersData.data.assignedUsers.map((user: { companyId: number }) => user.companyId))
        );

        // Trigger generateQuestionnaire for each unique companyId
        uniqueCompanyIds.forEach(companyId => {
          generateQuestionnaire({
            question_bank_id: bankId,
            company_id: companyId,
            question_id: questionId,
            reportingAnswerYear: year
          })
            .unwrap()
            .then(() => {
              // Questionnaire generated successfully
            })
            .catch(err => {
              console.error(`Failed to generate questionnaire for companyId: ${companyId}`, err);
              notify({
                type: STATUS.ERROR,
                message: `Failed to generate questionnaire for company ${companyId}`
              });
            });
        });
      } else {
        console.log('🚫 NOT calling generateQuestionnaire because:', {
          noBankId: !bankId,
          noAssignedUsers: !assignUsersData.data.assignedUsers,
          isUnassignAction: isUnassignAction,
          currentActionIsUnassign: currentActionIsUnassign
        });
      }

      // Reset the action state AFTER generateQuestionnaire logic
      setCurrentAction(null);

      // Reset the block flag
      blockGenerateQuestionnaireRef.current = false;

      // Reset global unassign tracker
      setUnassignOperationActive(false);

      // Clear stored state on successful completion
      previousStateRef.current = null;

      // Reset processing flag after all operations are complete
      processingResponseRef.current = false;

      // Clean up old response IDs (keep only last 5 to prevent memory leaks)
      if (processedResponseIds.current.size > 5) {
        const idsArray = Array.from(processedResponseIds.current);
        processedResponseIds.current = new Set(idsArray.slice(-3)); // Keep only last 3
        console.log('🧹 Cleaned up old response IDs, kept:', processedResponseIds.current.size);
      }
    } else if (error) {
      // Rollback optimistic updates on error
      if (previousStateRef.current) {
        const { questionIndex, originalUsers, bankId } = previousStateRef.current;

        dispatch(
          questionnaireApi.util.updateQueryData('getQuestionBankListById', { bankId }, draft => {
            if (draft.data?.questions?.[questionIndex]) {
              draft.data.questions[questionIndex].users = originalUsers;
            }
          })
        );

        // Clear the stored state
        previousStateRef.current = null;
      }

      // Reset action state on error
      setCurrentAction(null);

      // Reset processing flag on error
      processingResponseRef.current = false;

      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [notify, isSuccess, error, setIsEditMode, bankId, assignUsersData, generateQuestionnaire]);

  const handleAssignUsers = (userIds: string[]) => {
    if (!bankId) return;
    const authorizedRoles = ['admin', 'manager', 'manager-l2', 'user-admin'];
    if (!authorizedRoles.includes(userRole?.toLowerCase() || '')) {
      notify({ type: STATUS.ERROR, message: 'Access Denied: You do not have permission to assign users to questions' });
      return;
    }
    confirm({
      title: 'Confirm User Assignment',
      type: STATUS.APPROVED,
      message: `Are you sure you want to assign ${userIds.length > 1 ? 'these' : 'this'} user${
        userIds.length > 1 ? 's' : ''
      } to the question?`,
      onOk: () => {
        try {
          setCurrentAction('assign');
          // ALLOW generateQuestionnaire for assign operations
          blockGenerateQuestionnaireRef.current = false;
          // Reset processed response ref for new operation
          processingResponseRef.current = false;

          // Optimistic update: Add users to Redux cache immediately
          if (currentQuestionBank?.data?.questions) {
            const questionsArray = currentQuestionBank.data.questions;
            const questionIndex = questionsArray.findIndex(q => q.id === questionId);

            if (questionIndex !== -1) {
              const updatedQuestions = [...questionsArray];
              const currentQuestion = { ...updatedQuestions[questionIndex] };

              // Store previous state for potential rollback
              previousStateRef.current = {
                questionIndex,
                originalUsers: [...(currentQuestion.users || [])],
                bankId: Number(bankId)
              };

              // Get user details for the IDs being assigned (optimistic, might not have all details)
              const newUsers = userIds.map(id => ({
                id: parseInt(id),
                name: `User ${id}`, // Placeholder name
                email: '',
                role: '',
                active: 1,
                company_id: 0 // Will be updated when real response comes
              }));

              // Add to existing users, avoiding duplicates
              const existingUserIds = new Set(currentQuestion.users?.map(u => u.id) || []);
              const usersToAdd = newUsers.filter(user => !existingUserIds.has(user.id));

              currentQuestion.users = [...(currentQuestion.users || []), ...usersToAdd];
              updatedQuestions[questionIndex] = currentQuestion;

              // Update the cache optimistically
              dispatch(
                questionnaireApi.util.updateQueryData('getQuestionBankListById', { bankId: Number(bankId) }, draft => {
                  draft.data.questions = updatedQuestions;
                })
              );
            }
          }

          console.log('🔥 CALLING ASSIGN API with:', { questionId, users: userIds, year, action: 'assign' });
          assignUsers({ questionId, users: userIds, year, action: 'assign' });
        } catch (error) {
          console.error('Error in handleAssignUsers:', error);
          setCurrentAction(null);
          processingResponseRef.current = false;
        }
      }
    });
  };

  const handleUnassignUsers = (userIds: string[]) => {
    console.log('🎯 handleUnassignUsers called with:', userIds);
    if (!bankId) return;
    const authorizedRoles = ['admin', 'manager', 'manager-l2', 'user-admin'];
    if (!authorizedRoles.includes(userRole?.toLowerCase() || '')) {
      notify({
        type: STATUS.ERROR,
        message: 'Access Denied: You do not have permission to unassign users from questions'
      });
      return;
    }
    confirm({
      title: 'Confirm User Unassignment',
      type: STATUS.WARNING,
      message: `Are you sure you want to unassign ${userIds.length > 1 ? 'these' : 'this'} user${
        userIds.length > 1 ? 's' : ''
      } from the question?`,
      onOk: () => {
        try {
          setCurrentAction('unassign');
          // BLOCK generateQuestionnaire for this unassign operation
          blockGenerateQuestionnaireRef.current = true;
          // Set global unassign tracker
          setUnassignOperationActive(true);

          // SAFETY TIMEOUT: Auto-clear the flag after 10 seconds in case something goes wrong
          setTimeout(() => {
            console.log('⏰ TIMEOUT: Clearing unassign operation flag as safety measure');
            setUnassignOperationActive(false);
          }, 10000);
          // Reset processed response ref for new operation
          processingResponseRef.current = false;

          // Optimistic update: Remove users from Redux cache immediately
          if (currentQuestionBank?.data?.questions) {
            const questionsArray = currentQuestionBank.data.questions;
            const questionIndex = questionsArray.findIndex(q => q.id === questionId);

            if (questionIndex !== -1) {
              const updatedQuestions = [...questionsArray];
              const currentQuestion = { ...updatedQuestions[questionIndex] };

              // Store previous state for potential rollback
              previousStateRef.current = {
                questionIndex,
                originalUsers: [...(currentQuestion.users || [])],
                bankId: Number(bankId)
              };

              // Remove the users from the question
              const userIdsToRemove = new Set(userIds.map(id => parseInt(id)));
              currentQuestion.users = (currentQuestion.users || []).filter(user => !userIdsToRemove.has(user.id));

              updatedQuestions[questionIndex] = currentQuestion;

              // Update the cache optimistically
              dispatch(
                questionnaireApi.util.updateQueryData('getQuestionBankListById', { bankId: Number(bankId) }, draft => {
                  draft.data.questions = updatedQuestions;
                })
              );
            }
          }

          console.log('🔥 CALLING UNASSIGN API with:', { questionId, users: userIds, year, action: 'unassign' });
          assignUsers({ questionId, users: userIds, year, action: 'unassign' });
        } catch (error) {
          console.error('Error in handleUnassignUsers:', error);
          setCurrentAction(null);
          processingResponseRef.current = false;
        }
      }
    });
  };

  return {
    assignUsers: handleAssignUsers,
    unassignUsers: handleUnassignUsers,
    isAssigning: isLoading
  };
};

export default useQuestionUserAssignment;
