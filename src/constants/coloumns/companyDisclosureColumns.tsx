import { Flex } from '@chakra-ui/react';

import ApprovalManagers from '@/components/ApprovalManagers';
import SortableHeader from '@/components/common/SortableHeader';
import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import StatusBox, { STATUS_BOX_TYPE } from '@/components/StatusBox';
import ActionModalButton from '@/pages/Admin/CompanyReportingStatus/ActionModalButton';

export interface TableColumns {
  data: any;
  handleSortChange: (sortKey: string) => void;
  activeSortKey: string | null;
  handleFilterChange?: any;
  loadOptions?: any;
  params?: any;
  companyId?: number; // Add companyId prop
}

export const companyDisclosureColumns = ({
  data,
  handleSortChange,
  activeSortKey,
  handleFilterChange,
  params,
  companyId
}: TableColumns) => [
    // {
    //   label: 'LEI ID / Reg. No.',
    //   accessor: 'lei_id',
    //   textAlignColumn: 'left',
    //   render: (_: never, rowIndex: number) => {
    //     const companyDisclosureItem = data?.data?.items[rowIndex];
    //     return <EllipsisBox>{companyDisclosureItem?.company?.leiId || '-'}</EllipsisBox>;
    //   }
    // },
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
            <StatusBox type={statusType}>{userSubmission?.status}</StatusBox>
          </Flex>
        );
      }
    },
    {
      label: 'Company / Subsidiary Name',
      accessor: 'companyName',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        return <EllipsisBox>{companyDisclosureItem?.company?.name || '-'}</EllipsisBox>;
      }
    },
    // {
    //   label: (
    //     <SortableHeader
    //       onClick={() => handleSortChange('industry.name')}
    //       activeSortKey={activeSortKey}
    //       text="Industry"
    //       sortKey="industry.name"
    //       filter="adminDisclosureIndustryList"
    //       handleFilterChange={handleFilterChange}
    //       filterParams={params}
    //     />
    //   ),
    //   accessor: 'industryName',
    //   textAlignColumn: 'left',
    //   render: (_: never, rowIndex: number) => {
    //     const companyDisclosureItem = data?.data?.items[rowIndex];
    //     return <EllipsisBox>{companyDisclosureItem?.industry?.name || '-'}</EllipsisBox>;
    //   }
    // },
    {
      label: 'Question ID',
      accessor: 'questionId',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        return <EllipsisBox>{companyDisclosureItem?.userQuestionnaireId || '-'}</EllipsisBox>;
      }
    },
    {
      label: 'Theme',
      accessor: 'theme',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        // Extract theme from answer array structure - check both direct answer and submission.answer
        const answer = companyDisclosureItem?.submission?.answer || companyDisclosureItem?.answer;
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
        if (typeof themeName === 'object') {
          // @ts-ignore
          themeName = themeName.label || '-';
        }

        return <EllipsisBox>{themeName}</EllipsisBox>;
      }
    },
    {
      label: (
        <SortableHeader
          onClick={() => handleSortChange('submittedBy')}
          activeSortKey={activeSortKey}
          text="Assigned To"
          sortKey="submittedBy"
          filter="SubmittedBy"
          handleFilterChange={handleFilterChange}
          filterParams={params}
          companyId={companyId}
        />
      ),
      accessor: 'submittedBy',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        return <EllipsisBox>{companyDisclosureItem?.submittedBy?.fullName || '-'}</EllipsisBox>;
      }
    },
    {
      label: (
        <SortableHeader
          onClick={() => handleSortChange('framework')}
          activeSortKey={activeSortKey}
          text="ESG Standard"
          sortKey="questionBank"
          filter="adminDisclosureFrameworkList"
          handleFilterChange={handleFilterChange}
          filterParams={params}
          companyId={companyId}
        />
      ),
      accessor: 'questionBank',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        const questionBankName = companyDisclosureItem?.questionBank?.name || '-';
        return <EllipsisBox>{questionBankName}</EllipsisBox>;
      }
    },
    {
      label: (
        <SortableHeader
          onClick={() => handleSortChange('department')}
          activeSortKey={activeSortKey}
          text="Department"
          sortKey="department"
          filter="adminDisclosureDepartmentList"
          handleFilterChange={handleFilterChange}
          filterParams={params}
          companyId={companyId}
        />
      ),
      accessor: 'department',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        return <EllipsisBox>{companyDisclosureItem?.department?.name || '-'}</EllipsisBox>;
      }
    },
    {
      label: (
        <SortableHeader
          onClick={() => handleSortChange('submittedYear')}
          activeSortKey={activeSortKey}
          text="Year"
          sortKey="reportingAnswerYear"
          filter="reportingAnswerYear"
          handleFilterChange={handleFilterChange}
          filterParams={params}
          companyId={companyId}
        />
      ),
      accessor: 'submissionDate',
      textAlignColumn: 'center',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        const reportingAnswerYear = companyDisclosureItem?.reportingAnswerYear
          ? companyDisclosureItem.reportingAnswerYear
          : new Date().getFullYear();
        return <EllipsisBox>{reportingAnswerYear}</EllipsisBox>;
      }
    },
    {
      label: (
        <SortableHeader
          onClick={() => handleSortChange('country.name')}
          activeSortKey={activeSortKey}
          text="Country"
          sortKey="country.name"
          filter="adminDisclosureCountryList"
          handleFilterChange={handleFilterChange}
          filterParams={params}
          companyId={companyId}
        />
      ),
      accessor: 'countryName',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const companyDisclosureItem = data?.data?.items[rowIndex];
        return <EllipsisBox>{companyDisclosureItem?.country?.name || '-'}</EllipsisBox>;
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
        const companyDisclosureItem = data?.data?.items[rowIndex];
        return <ActionModalButton data={companyDisclosureItem} />;
      }
    }
  ];
