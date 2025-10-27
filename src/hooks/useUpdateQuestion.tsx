import { useEffect } from 'react';

import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { MESSAGE, STATUS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { QuestionFormSubmit } from '../pages/Admin/Questionnaire/question-bank/components/QuestionForm';
import { useAppDispatch } from '../store/hooks';
import { setRefetchQuery } from '../store/slices/refresh/refreshSlice';
import { ErrorData } from '../types/common';

interface UseCreateQuestionProps {
  questionId: any;
  qbankId: string | undefined;
  setIsEditMode: any;
}

const useUpdateQuestion = ({ questionId, qbankId, setIsEditMode }: UseCreateQuestionProps) => {
  const { notify, confirm } = useAppContext();
  const dispatch = useAppDispatch();
  const [updateQuestions, { isLoading, isSuccess, error }] = questionnaireApi.useUpdateQuestionsMutation();

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Question successfully updated'
      });
      setIsEditMode(false);
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
    } else if (error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [notify, dispatch, isSuccess, error]);

  const handleUpdateQuestion = (data: QuestionFormSubmit) => {
    confirm({
      title: 'Confirm Approval',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: () => {
        const contentObj: any = {};
        if (data.checkboxOptions && data.type === 'checkbox') {
          contentObj.checkboxOptions = data.checkboxOptions;
        }
        if (data.dropDownOptions && data.type === 'dropDown') {
          contentObj.dropDownOptions = data.dropDownOptions;
        }
        if (data.compare && data.type === 'compare') {
          contentObj.compare = data.compare;
        }

        if (data.tableOptions && data.type === 'table') {
          contentObj.tableOptions = data.tableOptions;
        }

        const formattedData = {
          id: questionId,
          title: data.title,
          type: data.type,
          institutions: data.institution,
          frameworks: data.framework,
          industries: data.industry,
          question_bank_id: qbankId,
          is_required: data.is_required || false,
          has_attachment: data.has_attachment || false,
          has_remarks: data.has_remarks || false,
          content: JSON.stringify(contentObj),
          departments: data.department,
          scope: data.scope,
          users: data.users,
          is_not_question: data.is_not_question || false,
          theme: data?.theme?.value
        };

        updateQuestions({ questions: [formattedData] });
      }
    });
  };

  return { updateQuestion: handleUpdateQuestion, isUpdating: isLoading };
};

export default useUpdateQuestion;
