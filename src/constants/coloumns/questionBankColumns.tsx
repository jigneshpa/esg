import moment from 'moment';

import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import ActionModalButton from '@/pages/Admin/Questionnaire/question-bank/components/ActionModalButton';
import ESGStandardsColumn from '@/pages/Admin/Questionnaire/question-bank/components/EsgStandarsColumn';
export interface TableColumns {
  data: any;
  handleFilterChange?: any;
  loadOptions?: any;
  companySelected: number | null
  userRole: string | undefined;
  companyId?: number | undefined;
}

export const questionBankColumns = ({ data, companySelected, userRole, companyId }: TableColumns) => {
  // {
  //   label: '',
  //   accessor: '',
  //   textAlignColumn: 'center',
  //   render: (_: never, rowIndex: number) => {
  //     const companyItem = data?.data?.results[rowIndex];
  //
  //     return <Checkbox />;
  //   }
  // },
  console.log('companySelected prop on questionBankColumns:', companySelected);

  const columns = [
    {
      label: 'ESG STANDARDS',
      accessor: 'name',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const questionBank = data?.data?.results[rowIndex];
        return <ESGStandardsColumn questionBank={questionBank} companySelected={companySelected} />;
      }
    },
    {
      label: 'NO. OF QUESTIONS',
      accessor: 'questions_count',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const questionBank = data?.data?.results[rowIndex];
        return <EllipsisBox>{questionBank?.questions_count === null ? '-' : questionBank?.questions_count}</EllipsisBox>;
      }
    },
    {
      label: 'EDITED DATE',
      accessor: 'editedDate',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const questionBank = data?.data?.results[rowIndex];
        const updatedAt = moment(new Date(questionBank.updatedAt))?.format('DD/MM/YYYY') || '-';

        return <EllipsisBox>{updatedAt}</EllipsisBox>;
      }
    },
    {
      label: 'FIRST PUBLISHED DATE',
      accessor: 'firstPublishedDate',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const questionBank = data?.data?.results[rowIndex];
        const updatedAt = moment(new Date(questionBank.updatedAt))?.format('DD/MM/YYYY') || '-';

        return <EllipsisBox>{updatedAt}</EllipsisBox>;
      }
    },
    {
      label: 'VERSION',
      accessor: 'version',
      textAlignColumn: 'left',
      render: (_: never, rowIndex: number) => {
        const questionBank = data?.data?.results[rowIndex];
        return <EllipsisBox>{questionBank?.version || '-'}</EllipsisBox>;
      }
    },
    {
      label: 'ACTION',
      accessor: 'action',
      sticky: true,
      render: (_: never, rowIndex: number) => {
        const questionBank = data?.data?.results[rowIndex];
        return <ActionModalButton
          data={questionBank}
          companySelected={companySelected}
          isDisabled={userRole === 'admin' ? false : questionBank?.createdByCompanyId !== companyId}
          standardId={questionBank?.id}
        />;
      }
    }
  ]
  // Hide 'Action' column for 'user-admin' and 'manager' roles
  if (userRole === 'manager') {
    return (columns || []).filter(column => column.accessor !== 'action');
  }
  return columns || [];
};
