import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

import { URLS } from '@/constants';

const ActionModalButton = ({ data }: any) => {
  const navigate = useNavigate();

  const isQuestionary = data?.company?.id && data?.framework?.id;

  const redirectById = () => {
    if (data?.userQuestionnaireId) {
      let url = URLS.USER_SURVEY_LIST.replace(':userQuestionnaireId', data.userQuestionnaireId);

      if (data?.submissionId) {
        url += `?submissionId=${data.submissionId}`;
      }
      navigate(url);
    }
  };

  return data?.submissionId ? (
    <Button
      variant="outline"
      bg="transparent"
      border="none"
      w="100%"
      type="submit"
      loadingText={'Submitting'}
      onClick={redirectById}
    >
      Review
    </Button>
  ) : isQuestionary ? (
    <Button
      variant="outline"
      bg="transparent"
      border="none"
      w="100%"
      type="submit"
      loadingText={'Submitting'}
      onClick={redirectById}
    >
      Submit
    </Button>
  ) : (
    '-'
  );
};

export default ActionModalButton;
