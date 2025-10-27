import { Flex, HStack } from '@chakra-ui/react';

import ApprovalManagers from '@/components/ApprovalManagers';
import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import StatusBox, { STATUS_BOX_TYPE } from '@/components/StatusBox';
import ActionModalCustomButton from '@/pages/User/UserSubmissions/ActionModalCustomButton';

import SortableHeader from '../../components/common/SortableHeader';
import { CountryFlag } from '@/components/CountryFlag';

export interface TableColumns {
  data: any;
  handleSortChange: (sortKey: string) => void;
  activeSortKey: string | null;
  handleFilterChange?: any;
  loadOptions?: any;
  params?: any;
}

export const userSubmissionsColumns = ({
  data,
  handleSortChange,
  activeSortKey,
  handleFilterChange,
  params
}: TableColumns) => [
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('framework.name')}
        activeSortKey={activeSortKey}
        text="ESG Standard"
        sortKey="questionBank.name"
        filter="userSubmissionFrameworkList"
        handleFilterChange={handleFilterChange}
        filterParams={params}
      />
    ),
    accessor: 'questionBankName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const questionnaire = data?.data?.items[rowIndex];
      return <EllipsisBox>{questionnaire?.questionBank?.name || '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Theme',
    accessor: 'theme',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userSubmission = data?.data?.items[rowIndex];
      // Extract theme from answer array structure - check both direct answer and submission.answer
      const answer = userSubmission?.submission?.answer || userSubmission?.answer;
      let themeName = '-';

      if (answer && Array.isArray(answer) && answer.length > 0) {
        themeName = answer[0]?.theme?.label || '-';
      } else if (typeof answer === 'string') {
        try {
          const parsedAnswer = JSON.parse(answer);
          if (Array.isArray(parsedAnswer) && parsedAnswer.length > 0) {
            themeName = parsedAnswer[0]?.theme?.label || '-';
          }
        } catch (e) {
          // If parsing fails, keep default '-'
        }
      }

      return <EllipsisBox>{themeName}</EllipsisBox>;
    }
  },
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('company.name')}
        activeSortKey={activeSortKey}
        text="Subsidiary Name"
        sortKey="company.name"
        filter="userSubmissionCompanyList"
        handleFilterChange={handleFilterChange}
        filterParams={params}
      />
    ),
    accessor: 'companyName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userSubmission = data?.data?.items[rowIndex];
      return <EllipsisBox>{userSubmission?.company?.name || '-'}</EllipsisBox>;
    }
  },
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('submittedYear')}
        activeSortKey={activeSortKey}
        text="Year"
        sortKey="submittedYear"
        filter="SubmittedYear"
        handleFilterChange={handleFilterChange}
        filterParams={params}
      />
    ),
    accessor: 'year',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userSubmission = data?.data?.items[rowIndex];
      const updatedAt = userSubmission?.userQuestionnaireReportingAnswerYear
        ? userSubmission.userQuestionnaireReportingAnswerYear
        : new Date().getFullYear();

      return <EllipsisBox>{updatedAt}</EllipsisBox>;
    }
  },
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('country.name')}
        activeSortKey={activeSortKey}
        text="Country"
        filter="userCountryList"
        sortKey="country.name"
        handleFilterChange={handleFilterChange}
        filterParams={params}
      />
    ),
    accessor: 'countryName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userSubmission = data?.data?.items[rowIndex];
      return (
        <HStack gap={'6px'}>
          <CountryFlag country={userSubmission?.country?.name} style={{
            height: '20px',
            width: '20px',
            borderRadius: '110px',
            border: '1px solid #E0E0E0',
            objectFit: 'cover',
          }} />
          <EllipsisBox>{userSubmission?.country?.name || '-'}</EllipsisBox>
        </HStack>
      );
    }
  },
  {
    label: 'Status',
    accessor: 'status',
    textAlignColumn: 'center',
    render: (_: never, rowIndex: number) => {
      const userSubmission = data?.data?.items[rowIndex];
      let statusType = STATUS_BOX_TYPE.Pending;

      if (userSubmission?.status === 'Rejected') {
        statusType = STATUS_BOX_TYPE.Error;
      } else if (userSubmission?.status === 'Approved') {
        statusType = STATUS_BOX_TYPE.Success;
      }

      return (
        <Flex justifyContent="center">
          {userSubmission?.status ? <StatusBox type={statusType}>{userSubmission?.status}</StatusBox> : '-'}
        </Flex>
      );
    }
  },
  {
    label: 'Approval Managers',
    accessor: 'reviewStatuses',
    textAlignColumn: 'center',
    render: (_: never, rowIndex: number) => {
      const userSubmission = data?.data?.items[rowIndex];
      const reviewStatuses = userSubmission?.reviewStatuses?.length ? userSubmission?.reviewStatuses : ['Pending'];

      return (
        <EllipsisBox>
          <ApprovalManagers reviewStatuses={reviewStatuses} />
        </EllipsisBox>
      );
    }
  },
  {
    label: 'Action',
    accessor: 'action',
    sticky: true,
    render: (_: never, rowIndex: number) => {
      const userSubmission = data?.data?.items[rowIndex];

      return <ActionModalCustomButton data={userSubmission} />;
    }
  }
];
