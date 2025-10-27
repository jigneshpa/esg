import { Box, Input, Select } from '@chakra-ui/react';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

const SearchAndDropdowns = ({ onSearch }: { onSearch: (searchTerm: string) => void }) => {
  const userRole = useAppSelector(selectUserRole);
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={10}>
      <Input placeholder="Search" width="300px" bg="white" borderColor="gray.300" onChange={(e) => onSearch(e.target.value)} />
      {false && <Box display="flex" gap={4}>
        <Select placeholder="All Years" bg="white" borderColor="gray.300">
          <option value="2021">2021</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
        </Select>
        <Select placeholder="All ReportsReports" bg="white" borderColor="gray.300">
          <option value="annual">BRSR</option>
          <option value="financial">GRI</option>
          <option value="summary">TCFD</option>
        </Select>
      </Box>}
    </Box>
  );
};

export default SearchAndDropdowns;