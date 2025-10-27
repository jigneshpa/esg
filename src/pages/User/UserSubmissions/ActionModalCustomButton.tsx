import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

import { URLS } from '@/constants';

const ActionModalCustomButton = ({ data }: any) => {
  const navigate = useNavigate();

  const isQuestionary = data?.company?.id;

  const redirectById = () => {
    if (data?.userQuestionnaireId) {
      let url = URLS.USER_SURVEY_LIST.replace(':userQuestionnaireId', data.userQuestionnaireId);

      if (data?.submissionId) {
        url += `?submissionId=${data.submissionId}`;
      }
      navigate(url);
    }
  };
  console.log('data: ', data);

  return data?.submissionId ? (
    <Button
      variant="outline"
      border="none"
      w="100%"
      type="submit"
      loadingText={'Submitting'}
      onClick={redirectById}
      background={'#137E59'}
      color={'#FFFFFF'}
      _hover={{
        background: '#137E59'
      }}
    >
      View
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
      background={'#FFF7E6'}
      color={'#FA8C16'}
      _hover={{
        background: '#FFF7E6'
      }}
    >
      Submit
    </Button>
  ) : (
    '-'
  );
};

export default ActionModalCustomButton;
