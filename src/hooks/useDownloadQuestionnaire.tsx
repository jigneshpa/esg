import { useState } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { exportFile } from '@/store/slices/export/exportFileSlice';

import { STATUS } from '../constants';
import { useAppContext } from '../context/AppContext';

interface UseDownloadQuestionnaireProps {
  title?: string;
}

interface DownloadQuestionnaireParams {
  questionBankId: number;
  type?: string;
  fileName?: string;
}

const useDownloadQuestionnaire = ({ title }: UseDownloadQuestionnaireProps) => {
  const { confirm } = useAppContext();
  const dispatch = useAppDispatch();
  const [isDownloading, setLoading] = useState<boolean>(false);

  const handleDownload = ({ questionBankId, type = 'csv', fileName }: DownloadQuestionnaireParams) => {
    confirm({
      title: title || 'Download Questionnaire Report',
      type: STATUS.DOWNLOAD,
      onOk: () => handleDownloadQuestionnaire({ questionBankId, type, fileName })
    });
  };

  const handleDownloadQuestionnaire = async ({ questionBankId, type, fileName }: DownloadQuestionnaireParams) => {
    try {
      setLoading(true);
      await dispatch(
        exportFile({
          endpoint: 'question',
          type,
          filter: { questionBankIds: [questionBankId], include_answers: true },
          fileName
        })
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Questionnaire download error:', error);
    }
  };

  return { handleDownload, handleDownloadQuestionnaire, isDownloading };
};

export default useDownloadQuestionnaire;
