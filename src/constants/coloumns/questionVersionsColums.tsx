import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import { formatDate } from '@/utils';

import { TableColumns } from './questionBankColumns';

export const questionVersionsColums = ({ data }: TableColumns) => [
  {
    label: 'Question',
    accessor: 'question',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const question = data[rowIndex];
      return <EllipsisBox>{question?.title || '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Amended Date',
    accessor: 'amendedDate',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const question = data[rowIndex];
      return <EllipsisBox>{formatDate(question?.updatedAt) || '-'}</EllipsisBox>;
    }
  }
];
