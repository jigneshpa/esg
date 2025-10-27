import { FC, useState } from 'react';
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { PiDotsThreeBold } from 'react-icons/pi';
import { RiSkipLeftLine, RiSkipRightLine } from 'react-icons/ri';
import ReactPaginate from 'react-paginate';
import { Button, Center, Flex, HStack, Icon, Input, Select, Text, useBreakpoint } from '@chakra-ui/react';

interface IPagination {
  totalPage: number;
  currentPage: number;
  maxResults: number;
  onMaxResultsChange?: (maxResults: number) => void;
  onPageChange: (page: number) => void;
  totalItems: number;
  totalItems20Limit?: boolean;
}

const Pagination: FC<IPagination> = ({
  totalPage,
  currentPage,
  maxResults,
  onMaxResultsChange,
  onPageChange,
  totalItems,
  totalItems20Limit
}) => {
  const breakPoint = useBreakpoint();
  const [gotoPage, setGotoPage] = useState<string>('');
  const handleFirstPage = () => {
    if (currentPage !== 1) onPageChange(1);
  };
  const handleLastPage = () => {
    if (currentPage !== totalPage) onPageChange(totalPage);
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPage;
  const disableBtnStyle = {
    color: 'grey.300'
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(gotoPage);
      if (pageNum >= 1 && pageNum <= totalPage) {
        onPageChange(pageNum);
      }
    }
  };

  if (!totalPage || !currentPage || !onPageChange) return null;
  if (breakPoint === 'base') {
    return (
      <Flex w={'100%'} justifyContent={'space-between'} color={'grey.700'} px={'20px'}>
        <Icon
          fontSize={'25px'}
          as={BiLeftArrowAlt}
          sx={currentPage === 1 ? disableBtnStyle : {}}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        />

        <Center flex={1}>
          Page&nbsp;
          <Text fontWeight={500} color={'black'}>
            {currentPage}
          </Text>
          &nbsp;of&nbsp;
          <Text fontWeight={500} color={'black'}>
            {totalPage}
          </Text>
        </Center>

        <Icon
          fontSize={'25px'}
          as={BiRightArrowAlt}
          sx={currentPage === totalPage ? disableBtnStyle : {}}
          onClick={() => currentPage < totalPage && onPageChange(currentPage + 1)}
        />
      </Flex>
    );
  }
  return (
    <Flex w={'100%'} justifyContent={'space-between'} alignItems={'center'} p={'8px 0'}>
      <HStack maxW="400px" w="100%">
        {totalItems < 12 ? null : (
          <HStack alignItems="center">
            <Text w="130px">Rows per page:</Text>
            <Select
              value={maxResults}
              onChange={onMaxResultsChange && (e => {
                onPageChange(1)
                onMaxResultsChange(parseInt(e.target.value, 10))
              })}
              w={'70px'}
              p="0"
              bgColor="#fff"
              focusBorderColor='#137E59'
            >
              {<option value="10">10</option>}
              {totalItems > 10 ? <option value="20">20</option> : null}
              {(totalItems > 20 && !totalItems20Limit) ? <option value="30">30</option> : null}
              {(totalItems > 30 && !totalItems20Limit) ? <option value="40">40</option> : null}
              {(totalItems > 40 && !totalItems20Limit) ? <option value="50">50</option> : null}
            </Select>
          </HStack>
        )}
        <HStack alignItems="center" w={'100%'}>
          <Text>Go to:</Text>
          <Input
            bgColor="#FFF"
            h="40px"
            borderRadius="4px"
            placeholder="1"
            value={gotoPage}
            onChange={e => setGotoPage(e.target.value)}
            onKeyPress={handleKeyPress}
            size="sm"
            width="50px"
            focusBorderColor='#137E59'
          />
        </HStack>
      </HStack>

      <Flex w={'100%'} justifyContent={'right'} alignItems={'center'} p={'8px 0'} mr="33px">
        <Button
          variant="unstyled"
          onClick={handleFirstPage}
          disabled={isFirstPage}
          w={'35px'}
          h={'35px'}
          mr={'10px'}
          bgColor={'#fff'}
          className={'react-pagination-next'}
          border="1px solid"
          borderColor="var(--chakra-colors-border)"
          cursor={isFirstPage ? 'default' : 'pointer'}
        >
          <Icon as={RiSkipLeftLine} display="block" ml="auto" mr="auto" fill={'#D9D9D9'} w="22px" h="22px" />
        </Button>
        <ReactPaginate
          forcePage={currentPage - 1}
          pageCount={totalPage}
          onPageChange={({ selected }) => onPageChange(selected + 1)}
          breakLabel={<Icon as={PiDotsThreeBold} />}
          previousLabel={<Icon as={BsChevronLeft} />}
          previousClassName={'react-pagination-previous'}
          nextLabel={<Icon as={BsChevronRight} />}
          nextClassName={'react-pagination-next'}
          containerClassName={'react-pagination'}
          pageLinkClassName={'react-pagination-page'}
        />
        <Button
          variant="unstyled"
          onClick={handleLastPage}
          disabled={isLastPage}
          w={'35px'}
          h={'35px'}
          ml={'10px'}
          bgColor={'#fff'}
          border="1px solid"
          borderColor="var(--chakra-colors-border)"
          cursor={isLastPage ? 'default' : 'pointer'}
        >
          <Icon as={RiSkipRightLine} display="block" ml="auto" mr="auto" fill={'#D9D9D9'} w="22px" h="22px" />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Pagination;
