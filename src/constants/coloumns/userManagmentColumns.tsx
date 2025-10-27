import SortableHeader from '@/components/common/SortableHeader';
import { CountryFlag } from '@/components/CountryFlag';
import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import ActionModalButton from '@/pages/Admin/UserManagement/ActionModalButton';
import { HStack } from '@chakra-ui/react';

export interface TableColumns {
  data: any;
  handleSortChange: (sortKey: string) => void;
  activeSortKey: string | null;
  handleFilterChange?: any;
  loadOptions?: any;
  params?: any;
  userRole?: string;
  companyData: any;
}

export const userManagmentColumns = ({
  data,
  handleSortChange,
  activeSortKey,
  handleFilterChange,
  params,
  companyData
}: TableColumns) => [
  {
    label: 'Username',
    accessor: 'userName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return <EllipsisBox>{userItem ? userItem.userName : '-'}</EllipsisBox>;
    }
  },
  {
    label: 'First Name',
    accessor: 'firstName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return <EllipsisBox>{userItem ? userItem.firstName : '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Last Name',
    accessor: 'lastName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return <EllipsisBox>{userItem ? userItem.lastName : '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Email id',
    accessor: 'email',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return <EllipsisBox>{userItem ? userItem.email : '-'}</EllipsisBox>;
    }
  },
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('status')}
        activeSortKey={activeSortKey}
        text="Status"
        sortKey="status"
        handleFilterChange={handleFilterChange}
        filter="userManagementStatusList"
        filterParams={params}
      />
    ),
    accessor: 'status',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return <EllipsisBox>{userItem ? userItem.status : '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Company/Subsidiary Name',

    accessor: 'companyName',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      // if (rowIndex < 10) {
      //   console.log('xxx userItem---',JSON.stringify(userItem))
      //   // console.log('xxx data.data.items---',data?.data?.items);
      // }
      // if (!companyData) return <EllipsisBox>-</EllipsisBox>;
      // const filteredCompanies = companyData?.data?.filter(
      //   (company: { id: number }) => company.id === userItem?.companyId
      // );
      const companyName = userItem?.companyName ? userItem?.companyName : '-';

      return <EllipsisBox>{companyName || '-'}</EllipsisBox>;
    }
  },
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('department.name')}
        activeSortKey={activeSortKey}
        text="Department"
        sortKey="department.name"
        handleFilterChange={handleFilterChange}
        filter="userManagementDepartmentList"
        filterParams={params}
      />
    ),
    accessor: 'department',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return <EllipsisBox>{userItem ? userItem.department_info?.name : '-'}</EllipsisBox>;
    }
  },

  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('country.name')}
        activeSortKey={activeSortKey}
        text="Country"
        sortKey="country.name"
        handleFilterChange={handleFilterChange}
        filter="userManagementCountryList"
        filterParams={params}
      />
    ),
    accessor: 'country',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return (
        <HStack gap={'6px'}>
          <CountryFlag country={userItem?.country} style={{
            height: '20px',
            width: '20px',
            borderRadius: '110px',
            border: '1px solid #E0E0E0',
            objectFit: 'cover',
          }} />
          <EllipsisBox>{userItem ? userItem.country : '-'}</EllipsisBox>
        </HStack>
      );
    }
  },
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('roles')}
        activeSortKey={activeSortKey}
        text="Role"
        sortKey="roles"
        handleFilterChange={handleFilterChange}
        filter="userManagementRoleList"
        filterParams={params}
      />
    ),
    accessor: 'role',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];
      return <EllipsisBox>{userItem ? userItem.role : '-'}</EllipsisBox>;
    }
  },
  {
    label: 'Action',
    accessor: 'action',
    sticky: true,
    render: (_: never, rowIndex: number) => {
      const userItem = data?.data?.items[rowIndex];

      return <ActionModalButton data={userItem} />;
    }
  }
];
