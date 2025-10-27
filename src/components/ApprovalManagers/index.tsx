import { LiaUserSolid } from 'react-icons/lia';
import { Box, Icon } from '@chakra-ui/react';

type ReviewStatusType = 'Approved' | 'Pending' | 'Rejected';

interface ApprovalManagersProps {
  reviewStatuses: Array<ReviewStatusType>;
}

const getColorByStatus = (status: ReviewStatusType) => {
  let color = '#BFBFBF';

  if (status === 'Approved') {
    color = '#389E0D';
  } else if (status === 'Rejected') {
    color = '#CF1322';
  }

  return color;
};

const ApprovalManagers = ({ reviewStatuses }: ApprovalManagersProps) => {
  return (
    <Box>
      {reviewStatuses.map((status, index) => (
        <Icon key={index} as={LiaUserSolid} width={'24px'} height={'24px'} color={getColorByStatus(status)} />
      ))}
    </Box>
  );
};

export default ApprovalManagers;
