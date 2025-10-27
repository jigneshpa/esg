import { Button, Checkbox, Flex, HStack, Box } from '@chakra-ui/react';
import SortableHeader from '@/components/common/SortableHeader';
import EllipsisBox from '@/components/EllipsisBox/EllipsisBox';
import CompanyActionButton from '@/pages/Admin/CompanyManagement/CompanyActionButton';
// import { BiArrowToRight } from 'react-icons/bi';
import { BsChevronRight } from 'react-icons/bs';
import { useAppDispatch } from '@/store/hooks';
import { CountryFlag } from '@/components/CountryFlag';
import { emptyCompany } from '@/assets';


export interface TableColumns {
  data: any;
  handleSortChange: (sortKey: string) => void;
  activeSortKey: string | null;
  handleFilterChange?: any;
  loadOptions?: any;
  handleChooseOne: (rowIndex: number) => void;
  isAllChecked: boolean;
  companiesSelected: number;
  params?: any;
  isSub?: boolean,
  toggleRowExpansion?: (rowId: any) => void
  expandedRows?: any;
  navigate?: any;
  shouldShowActionModal?: boolean;
  userRole?: string;
  getCompanyByFilter?: (args: { parent_id: string[]; refreshKey?: string }) => void;
  onSubsidiaryDeleted?: () => void;
  showLeiIdColumn?: boolean;
  toggleLeiIdColumn?: () => void;
}

export const companyColoumns = ({
                                 data,
                                 handleSortChange,
                                 activeSortKey,
                                 handleFilterChange,
                                 handleChooseOne,
                                 companiesSelected,
                                 isSub,
                                 toggleRowExpansion,
                                 expandedRows,
                                 params,
                                 navigate,
                                 shouldShowActionModal = true,
                                 userRole = 'manager',
                                 getCompanyByFilter,
                                 onSubsidiaryDeleted,
                                 showLeiIdColumn = true,
                                 toggleLeiIdColumn
                               }: TableColumns) => [
  // ...(!shouldShowActionModal ? [] : isSub
    // ? [] // No checkbox for subsidiary rows
    // : [
      {
        label: '',
        accessor: '',
        textAlignColumn: 'center',
        render: (_: never, rowIndex: number) => {
          const companyItem = data?.data?.results
            ? data?.data?.results[rowIndex]
            : data?.data?.result[rowIndex];
          return (
            <Checkbox
              isChecked={companiesSelected === companyItem?.id}
              onChange={() => {
                handleChooseOne(rowIndex);
              }}
            />
          );
        }
      },
    // ]),
  // ...(showLeiIdColumn ? [{
  //   label: (
  //     <Box 
  //       position="relative"
  //       w="100%"
  //       h="100%"
  //     >
  //       <span>LEI ID / Reg No.</span>
  //       <Box
  //         position="absolute"
  //         right="-1px"
  //         top="0"
  //         width="22px"
  //         height="100%"
  //         cursor="pointer"
  //         zIndex={10}
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           toggleLeiIdColumn?.();
  //         }}
  //         _hover={{
  //           '& .hover-arrow': {
  //             opacity: 1
  //           }
  //         }}
  //       >
  //         <Box
  //           className="hover-arrow"
  //           position="absolute"
  //           left="50%"
  //           top="50%"
  //           transform="translate(-50%, -50%)"
  //           opacity={0.4}
  //           transition="opacity 0.2s ease-in-out"
  //           bg="white"
  //           borderRadius="full"
  //           p={1}
  //           fontSize="sm"
  //           display="flex"
  //           alignItems="center"
  //           justifyContent="center"
  //           boxShadow="lg"
  //           border="1px solid"
  //           borderColor="gray.400"
  //           width="22px"
  //           height="22px"
  //           _hover={{ opacity: 1 }}
  //         >
  //           <Icon as={BsChevronLeft} color="gray.700" fontSize="12px" />
  //         </Box>
  //       </Box>
  //     </Box>
  //   ),
  //   accessor: 'company',
  //   textAlignColumn: 'left',
  //   render: (_: never, rowIndex: number) => {
  //     const companyItem = data?.data?.results ? data?.data?.results[rowIndex] : data?.data?.result[rowIndex];
  //     return <EllipsisBox>{companyItem ? companyItem?.leiId : '-'}</EllipsisBox>;
  //   }
  // }] : []),
  {
    label: !showLeiIdColumn ? (
      <Box 
        position="relative"
        w="100%"
        h="100%"
      >
        {/* <Box
          position="absolute"
          left="-22px"
          top="0"
          width="22px"
          height="100%"
          cursor="pointer"
          zIndex={10}
          onClick={(e) => {
            e.stopPropagation();
            toggleLeiIdColumn?.();
          }}
          _hover={{
            '& .hover-arrow': {
              opacity: 1
            }
          }}
        >
          <Box
            className="hover-arrow"
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            opacity={0.4}
            transition="opacity 0.2s ease-in-out"
            bg="white"
            borderRadius="full"
            p={1}
            fontSize="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.400"
            width="22px"
            height="22px"
            _hover={{ opacity: 1 }}
          >
            <Icon as={BsChevronRight} color="gray.700" fontSize="12px" />
          </Box>
        </Box> */}
        <span>Company / Subsidiaries</span>
      </Box>
    ) : 'Company / Subsidiaries',
    accessor: 'company',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const companyItem = data?.data?.results
        ? data?.data?.results[rowIndex]
        : data?.data?.result[rowIndex];

        const companyLogo = companyItem?.logo;


      return (
        <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
          onClick={() => {
            toggleRowExpansion &&
            toggleRowExpansion?.(companyItem?.id);

          }
          }
        >
          <HStack gap={'6px'}>
            <img src={companyLogo ? companyLogo : emptyCompany} alt="empty company" style={{
              height: '20px',
              width: '20px',
              borderRadius: '110px',
              border: '1px solid #E0E0E0',
              objectFit: 'cover',
            }} />
            <EllipsisBox>{companyItem?.name || '-'}</EllipsisBox>
          </HStack>
          {/* {!isSub && (
            <div>
              {expandedRows?.find(((x: any) => x == companyItem.id)) ?
                <Button style={{ fontSize: '12px' }} rightIcon={<IoMdArrowDropup />} size='xs'>Subsidiaries</Button> :
                <Button style={{ fontSize: '12px' }} rightIcon={<IoMdArrowDropdown />} size='xs'>Subsidiaries</Button>}
            </div>
          )} */}
        </Flex>
      );
    }
  },
  {
    label: (
      <SortableHeader
        onClick={() => handleSortChange('country.name')}
        activeSortKey={activeSortKey}
        text='Country'
        sortKey='Country'
        filter='country_id'
        handleFilterChange={handleFilterChange}
        filterParams={params}
      />
    ),
    accessor: 'country',
    textAlignColumn: 'left',
    render: (_: never, rowIndex: number) => {
      const companyItem = data?.data?.results ? data?.data?.results[rowIndex] : data?.data?.result[rowIndex];
      return (
      <HStack gap={'6px'}>
        <CountryFlag country={companyItem?.country?.name} style={{
          height: '20px',
          width: '20px',
          borderRadius: '110px',
          border: '1px solid #E0E0E0',
          objectFit: 'cover',
        }} />
        <EllipsisBox>{companyItem?.country?.name || '-'}</EllipsisBox>
      </HStack>
    );
    }
  },
  ...(navigate ? [
    {
      label: 'Submissions',
      accessor: 'submissions',
      textAlignColumn: 'center',
      render: (_: never, rowIndex: number) => {
        const companyItem = data?.data?.results ? data?.data?.results[rowIndex] : data?.data?.result[rowIndex];
        return (
          <Button 
            variant={'gray'} 
            size={'small'} 
            width={'auto'} 
            px={'10px'} 
            fontSize={'small'}
            rightIcon={<BsChevronRight />}
            onClick={() => navigate(`/${userRole}/reporting-status/company/${companyItem?.id}`)}
          >
            Submissions
          </Button>
        );
      }
    }
  ] : []),
  ...(shouldShowActionModal ?
    [
      {
        label: 'Action',
        accessor: 'action',
        sticky: true,
        render: (_: never, rowIndex: number) => {
          const companyItem = data?.data?.results ? data?.data?.results[rowIndex] : data?.data?.result[rowIndex];
          const dispatch =useAppDispatch();
          return <CompanyActionButton data={companyItem} isSubsidiary={isSub}
          onSubsidiaryDeleted={() => {
            // Call the callback passed from the parent component
            if (onSubsidiaryDeleted) {
              onSubsidiaryDeleted();
            }
          }}
           />;
        }
      }] : []) 
];
