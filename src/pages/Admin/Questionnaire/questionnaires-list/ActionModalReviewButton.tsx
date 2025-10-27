import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

import { URLS } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

interface ActionModalReviewButtonProps {
  frameworkId: number;
  industryId: number;
}

const ActionModalReviewButton = ({ frameworkId, industryId }: ActionModalReviewButtonProps) => {
  const navigate = useNavigate();
  const userRole = useAppSelector(selectUserRole);

  const redirectById = () => {
    if (frameworkId && industryId) {
      let url = '';
      if (userRole === 'manager') {
        url = URLS.MANAGER_QUESTIONNAIRE_LIST.replace(':frameworkId', String(frameworkId)).replace(
          ':industryId',
          String(industryId)
        );
      } else {
        url = URLS.ADMIN_QUESTIONNAIRE_LIST.replace(':frameworkId', String(frameworkId)).replace(
          ':industryId',
          String(industryId)
        );
      }
      navigate(url);
    }
  };

  return (
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
  );
};

export default ActionModalReviewButton;
