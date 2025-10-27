import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import ActionModalReviewButton from '@/pages/Admin/Questionnaire/questionnaires-list/ActionModalReviewButton';
import { formatDate } from '@/utils';

export interface TableColumns {
  data: any;
  handleFilterChange?: any;
  loadOptions?: any;
}

export const questionnaireListColumns = ({ data }: TableColumns) => [
  {
    label: 'Framework',
    accessor: 'frameworkName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const questionnaire = data?.data?.items[rowIndex];
      return <EllipsisBox>{questionnaire?.framework?.name || '-'}</EllipsisBox>;
    }
  },
  {
    label: 'No of Questions',
    accessor: 'questionsCount',
    textAlignColumn: 'center',
    render: (_: never, rowIndex: number) => {
      const questionnaire = data?.data?.items[rowIndex];
      return <EllipsisBox>{questionnaire?.questionsCount || '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Edited Date',
    accessor: 'editedDate',
    textAlignColumn: 'center',
    render: (_: never, rowIndex: number) => {
      const questionnaire = data?.data?.items[rowIndex];
      return <EllipsisBox>{formatDate(questionnaire?.lastUpdated) || '-'}</EllipsisBox>;
    }
  },
  {
    label: 'First Published Date',
    accessor: 'firstPublishedDate',
    textAlignColumn: 'center',
    render: (_: never, rowIndex: number) => {
      const questionnaire = data?.data?.items[rowIndex];
      return <EllipsisBox>{formatDate(questionnaire?.lastUpdated) || '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Action',
    accessor: 'action',
    sticky: true,
    render: (_: never, rowIndex: number) => {
      const questionnaire = data?.data?.items[rowIndex];

      return (
        <ActionModalReviewButton frameworkId={questionnaire?.framework?.id} industryId={questionnaire?.industry?.id} />
      );
    }
  }
];
