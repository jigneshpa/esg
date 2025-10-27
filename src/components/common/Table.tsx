//@ts-nocheck
import React, { Dispatch, FC, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import { Box, Center, Checkbox, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr, IconButton } from '@chakra-ui/react';
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';

const getOffsetRight = (list: number[], cellIndex: number) => {
  let result = 0;
  for (let i = cellIndex; i < list.length - 1; i++) {
    result += list[i + 1];
  }
  return result;
};

interface IStickyTd {
  label: string;
  children: ReactNode;
  columnsWidth: number[];
  setColumnsWidth: Dispatch<SetStateAction<number[]>>;
  index: number;
  showShadow?: boolean;
  [key: string]: any;
}

const StickyTd: FC<IStickyTd> = ({ label, children, columnsWidth, setColumnsWidth, index, showShadow = false, ...rest }) => {
  const ref = useRef<HTMLTableCellElement | null>(null);
  useEffect(() => {
    const width = ref?.current?.getBoundingClientRect().width;
    if (typeof width === 'number') {
      columnsWidth[index] = width;
    }
    setColumnsWidth([...columnsWidth]);
  }, [columnsWidth, setColumnsWidth, index]);

  // Apply drop shadow only if this is the left-most sticky column
  const shadowStyle = showShadow ? '-4px 0px 6px -2px rgba(0, 0, 0, 0.15)' : 'none';

  return (
    <Td
      ref={ref}
      data-label={label}
      maxW={'300px'}
      whiteSpace={'nowrap'}
      textOverflow={'ellipsis'}
      position={'sticky'}
      right={getOffsetRight(columnsWidth, index)}
      boxShadow={shadowStyle}
      bg={'white'}
      p={'10px'}
      {...rest}
      textAlign={'center'}
    >
      {children}
    </Td>
  );
};

const TableHead = ({ isAllSelected, handleSelectAll, scrollColumns, stickyColumns, columnsWidth, showExpandColumn = false }) => {
  return (
    <Thead position={'sticky'} color={'#004DA0'} top={0} bg={'#EBF1F9'} zIndex={1}>
      <Tr position={'relative'}>
        {/* Arrow column header - ALWAYS FIRST */}
        {showExpandColumn && (
          <Th width="40px" textAlign="center" p={2} bg={'#EBF1F9'}>
          </Th>
        )}
        
        {/* Checkbox column header - SECOND */}
        {handleSelectAll && (
          <Th bg={'#EBF1F9'}>
            <Checkbox isChecked={isAllSelected} onChange={handleSelectAll} />
          </Th>
        )}
        
        {scrollColumns.map(({ label, accessor, textAlignColumn, index }) => (
          <Th
            key={index}
            scope="col"
            textTransform="capitalize"
            fontSize={'14px'}
            lineHeight="20px"
            color="#004DA0"
            whiteSpace="nowrap"
            textAlign={textAlignColumn || 'center'}
            boxShadow="-1px 0px 0px 0px #F0F0F0 inset"
            bg={'#EBF1F9'}
          >
            {label}
          </Th>
        ))}
        {stickyColumns.map(({ label, accessor, textAlignColumn }, index) => {
          const isLeftMostSticky = index === 0;
          return (
            <Th
              key={`sticky-${accessor}`}
              scope="col"
              color="#004DA0"
              bg={'#EBF1F9'}
              textTransform="capitalize"
              fontSize={'14px'}
              lineHeight="20px"
              whiteSpace="nowrap"
              textAlign={textAlignColumn || 'center'}
              position={'sticky'}
              right={getOffsetRight(columnsWidth, index)}
              boxShadow={isLeftMostSticky ? '-4px 0px 6px -2px rgba(0, 0, 0, 0.15)' : 'none'}
            >
              {label}
            </Th>
          );
        })}
      </Tr>
    </Thead>
  );
};

interface ITableComponentProps {
  columns: any[];
  dataSource: any[];
  emptyText?: string;
  loading?: boolean;
  TableContainerMinHeight?: string;
  rowSelections?: any;
  SubsidiariesColumns?: any[];
  subsidiariesData?: any[];
  expandedRows?: any[];
  subsidiariesIsLoading?: boolean;
  shouldShowActionModal?: boolean;
  getCompanyByFilter?: any;
  showExpandColumn?: boolean;
  onToggleRowExpansion?: (rowId: string) => void;
  hasChildren?: (row: any) => boolean;
  expandedRowsState?: Set<string>;
  [key: string]: any;
}

const TableComponent: FC<ITableComponentProps> = ({
  columns,
  dataSource,
  emptyText = 'No Data',
  loading,
  TableContainerMinHeight,
  rowSelections,
  SubsidiariesColumns = [],
  subsidiariesData = [],
  expandedRows = [],
  subsidiariesIsLoading = false,
  shouldShowActionModal = false,
  getCompanyByFilter,
  // New props for expandable functionality
  showExpandColumn = false,
  onToggleRowExpansion = () => {},
  hasChildren = () => false,
  expandedRowsState = new Set(),
  ...rest
}) => {
  const [columnsWidth, setColumnsWidth] = useState([]);
  const [mainColumnsWidth, setMainColumnsWidth] = useState([]);
  const firstRowRef = useRef(null);

  // Safety checks for all array props
  const safeColumns = columns || [];
  const safeDataSource = dataSource || [];
  const safeSubsidiariesData = subsidiariesData || [];
  const safeSubsidiariesColumns = SubsidiariesColumns || [];
  const safeExpandedRows = expandedRows || [];

  const scrollColumns = safeColumns.filter(item => !item?.sticky) || [];
  const stickyColumns = safeColumns.filter(item => item?.sticky) || [];
  useEffect(() => {
    if (stickyColumns.length > 0 && columnsWidth.length !== stickyColumns.length) {
      setColumnsWidth(new Array(stickyColumns.length).fill(100));
    }
  }, [stickyColumns.length, columnsWidth.length]);

  useEffect(() => {
    if (firstRowRef.current) {
      const tds = firstRowRef.current.children;
      const widths = Array.from(tds).map(td => td.getBoundingClientRect().width);
      setMainColumnsWidth(widths);
    }
  }, [dataSource]);

  const onSelect = selectedRowKeys =>
    rowSelections?.onChange(prev => {
      if (prev.includes(selectedRowKeys)) {
        return prev.filter(id => id !== selectedRowKeys);
      }
      return [...prev, selectedRowKeys];
    });

  const onSelectAll = () =>
    rowSelections?.onChange(prev => {
      if (prev.length === safeDataSource.length) {
        return [];
      }
      return safeDataSource.map(({ id }) => id);
    });

  return (
    <TableContainer
      borderRadius={'10px'}
      color={'grey.800'}
      fontSize={'17px'}
      {...rest}
      minHeight={TableContainerMinHeight}
      borderTop="2px solid #4693FF"
      borderBottom="2px solid #e5e7eb"
      borderLeft="2px solid #e5e7eb"
      borderRight="2px solid #e5e7eb"
    >
      <Table
        variant="simple"
        sx={{
          borderCollapse: 'separate',
          '& th, & td': { border: 'none' }
        }}
      >
        <TableHead
          {...(rowSelections?.onChange && {
            isAllSelected: safeDataSource.length > 0 && rowSelections.selectedRowKeys.length === safeDataSource.length,
            handleSelectAll: onSelectAll
          })}
          scrollColumns={scrollColumns}
          stickyColumns={stickyColumns}
          columnsWidth={columnsWidth}
          showExpandColumn={showExpandColumn}
        />
        {loading ? (
          <Tbody>
            <Tr>
              <Td colSpan={(safeColumns.length || 1) + (rowSelections?.onChange ? 1 : 0) + (showExpandColumn ? 1 : 0)} border={'unset'} data-label={'noData'}>
                <Center borderRadius={'10px'} bg={'white'}>
                  <Spinner />
                </Center>
              </Td>
            </Tr>
            {[...new Array(9)].map((_, index) => (
              <Tr key={index} h={'57px'} />
            ))}
          </Tbody>
        ) : (
          <Tbody>
            {safeDataSource.length ? (
              safeDataSource.map((row, rowIndex) => (
                <React.Fragment key={row.id || `row-${rowIndex}`}>
                  <Tr ref={rowIndex === 0 ? firstRowRef : null} bg={'transparent'}>
                    {/* Arrow column - ALWAYS FIRST */}
                    {showExpandColumn && (
                      <Td width="40px" textAlign="center" p={2}>
                        {hasChildren && hasChildren(row) && (
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={
                              expandedRowsState && expandedRowsState.has(row.id) ? (
                                <MdKeyboardArrowDown fontSize="20px" />
                              ) : (
                                <MdKeyboardArrowRight fontSize="20px" />
                              )
                            }
                            onClick={() => onToggleRowExpansion && onToggleRowExpansion(row.id)}
                            aria-label={expandedRowsState && expandedRowsState.has(row.id) ? "Collapse row" : "Expand row"}
                            color="#004DA0"
                            _hover={{ bg: 'gray.100' }}
                          />
                        )}
                      </Td>
                    )}
                    
                    {/* Checkbox column - SECOND */}
                    {rowSelections?.onChange && (
                      <Td>
                        <Checkbox
                          isChecked={rowSelections?.selectedRowKeys.includes(row?.id)}
                          onChange={() => onSelect(row?.id)}
                        />
                      </Td>
                    )}
                    
                    {scrollColumns.map(
                      (
                        { label, accessor, textAlignColumn, cellBgColor, render, key, sticky: _sticky, ...rest },
                        columnIndex
                      ) => (
                        <Td
                          key={columnIndex}
                          data-label={label}
                          maxW={'300px'}
                          fontSize={'14px'}
                          lineHeight={'22px'}
                          whiteSpace={'nowrap'}
                          color={'pureBlack'}
                          boxShadow="1px 0px 0px 0px #F0F0F0 inset, 0px 1px 0px 0px #F0F0F0 inset, -1px 0px 0px 0px #F0F0F0 inset"
                          bg={cellBgColor ? cellBgColor : ''}
                          textOverflow={'ellipsis'}
                          textAlign={textAlignColumn || 'center'}
                          {...rest}
                        >
                          {render ? render(row[accessor], rowIndex) : row[accessor] || '-'}
                        </Td>
                      )
                    )}
                    {stickyColumns.map(
                      (
                        { label, accessor, textAlignColumn: _textAlignColumn, render, key, sticky: _sticky, ...rest },
                        columnIndex
                      ) => (
                        <StickyTd
                          key={`${accessor}-${key}`}
                          label={label}
                          bg={'white'}
                          index={columnIndex}
                          columnsWidth={columnsWidth}
                          setColumnsWidth={setColumnsWidth}
                          showShadow={columnIndex === 0}
                          maxW={'300px'}
                          fontSize={'14px'}
                          lineHeight={'22px'}
                          whiteSpace={'nowrap'}
                          color={'pureBlack'}
                          textOverflow={'ellipsis'}
                          {...rest}
                        >
                          {render ? render(row[accessor], rowIndex) : row[accessor] || '-'}
                        </StickyTd>
                      )
                    )}
                  </Tr>
                  
                  {/* Show expanded content when row is expanded */}
                  {showExpandColumn && expandedRowsState && expandedRowsState.has(row.id) && (
                    <Tr>
                      <Td colSpan={(safeColumns.length || 0) + (rowSelections?.onChange ? 1 : 0) + 1} p={0} border="none">
                        <Box
                          my={'12px'}
                          boxShadow="0 10px 15px -3px rgba(22, 192, 138, 0.1), 0 4px 6px -2px rgba(175, 29, 29, 0.05), 0 -10px 15px -3px rgba(22, 192, 138, 0.1), 0 -4px 6px -2px rgba(175, 29, 29, 0.05)"
                          borderRadius="8px"
                          overflow="hidden"
                          bg="white"
                        >
                          <Table variant="simple">
                            <Tbody>
                              {subsidiariesIsLoading ? (
                                <Tr bg="green.100" _hover={{ bg: 'green.100' }}>
                                  {/* Number column for loading state - Shows loading indicator */}
                                  {showExpandColumn && (
                                    <Td width="40px" textAlign="center" p={2} bg="green.100">
                                      <Box
                                        fontSize="12px"
                                        fontWeight="bold"
                                        color="#004DA0"
                                        bg="white"
                                        borderRadius="50%"
                                        width="24px"
                                        height="24px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mx="auto"
                                      >
                                        <Spinner size="xs" />
                                      </Box>
                                    </Td>
                                  )}
                                  
                                  {/* Checkbox column for loading state */}
                                  {rowSelections?.onChange && (
                                    <Td bg="green.100">
                                      {/* Empty cell to maintain column alignment */}
                                    </Td>
                                  )}
                                  
                                  <Td
                                    colSpan={safeSubsidiariesColumns.length}
                                    border="unset"
                                    bg="green.100"
                                  >
                                    <Center borderRadius="10px" bg="green.100">
                                      <Spinner />
                                    </Center>
                                  </Td>
                                </Tr>
                              ) : safeSubsidiariesData.filter(subsidiary => subsidiary?.parentId === row.id).length >
                                0 ? (
                                safeSubsidiariesData
                                  .filter(subsidiary => subsidiary?.parentId === row.id)
                                  .map((subsidiary, subIndex) => (
                                    <Tr key={subsidiary?.id || subIndex} bg="green.100" _hover={{ bg: 'green.100' }}>
                                      {/* Number column for subsidiary - ALWAYS FIRST - Shows subsidiary number */}
                                      {showExpandColumn && (
                                        <Td width="40px" textAlign="center" p={2} bg="green.100">
                                          <Box
                                            fontSize="12px"
                                            fontWeight="bold"
                                            color="#004DA0"
                                            bg="white"
                                            borderRadius="50%"
                                            width="24px"
                                            height="24px"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            mx="auto"
                                          >
                                            {subIndex + 1}
                                          </Box>
                                        </Td>
                                      )}
                                      
                                      {/* Checkbox column for subsidiary - SECOND */}
                                      {rowSelections?.onChange && (
                                        <Td bg="green.100">
                                          <Checkbox
                                            isChecked={rowSelections?.selectedRowKeys.includes(subsidiary?.id)}
                                            onChange={() => onSelect(subsidiary?.id)}
                                          />
                                        </Td>
                                      )}
                                      
                                      {safeSubsidiariesColumns.map(
                                        (
                                          { label, accessor, textAlignColumn, cellBgColor, render, ...rest },
                                          columnIndex
                                        ) => (
                                          <Td
                                            key={columnIndex}
                                            data-label={label}
                                            width={
                                              mainColumnsWidth[shouldShowActionModal ? columnIndex + 1 : columnIndex]
                                            }
                                            fontSize="14px"
                                            lineHeight="22px"
                                            whiteSpace="nowrap"
                                            color="pureBlack"
                                            boxShadow="0 0 0 1px #FFFFFF"
                                            bg={cellBgColor || ''}
                                            textOverflow="ellipsis"
                                            textAlign={textAlignColumn || 'center'}
                                            p="10px"
                                            px="25px"
                                            {...rest}
                                          >
                                            {render
                                              ? render(subsidiary[accessor], subIndex)
                                              : subsidiary[accessor] || '-'}
                                          </Td>
                                        )
                                      )}
                                    </Tr>
                                  ))
                              ) : (
                                <Tr bg="green.100" _hover={{ bg: 'green.100' }}>
                                  {/* Number column for "No subsidiaries" row - Shows dash */}
                                  {showExpandColumn && (
                                    <Td width="40px" textAlign="center" p={2} bg="green.100">
                                      <Box
                                        fontSize="12px"
                                        fontWeight="bold"
                                        color="#004DA0"
                                        bg="white"
                                        borderRadius="50%"
                                        width="24px"
                                        height="24px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mx="auto"
                                      >
                                        -
                                      </Box>
                                    </Td>
                                  )}
                                  
                                  <Td
                                    colSpan={safeSubsidiariesColumns.length}
                                    textAlign="center"
                                    fontSize="14px"
                                    lineHeight="22px"
                                    color="pureBlack"
                                    boxShadow="0 0 0 1px #FFFFFF"
                                    p="10px"
                                  >
                                    No subsidiaries available
                                  </Td>
                                </Tr>
                              )}
                            </Tbody>
                          </Table>
                        </Box>
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <Tr>
                <Td colSpan={(safeColumns.length || 1) + (rowSelections?.onChange ? 1 : 0) + (showExpandColumn ? 1 : 0)} border={'unset'} data-label={'noData'}>
                  <Center minH="200px">{emptyText}</Center>
                </Td>
              </Tr>
            )}
          </Tbody>
        )}
      </Table>
    </TableContainer>
  );
};

export default TableComponent;
