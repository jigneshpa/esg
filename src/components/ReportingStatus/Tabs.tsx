import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { Box } from '@chakra-ui/react';

interface ReportingTabsProps {
  onChange: (tabName: string) => void;
}

const ReportingTabs: React.FC<ReportingTabsProps> = ({ onChange }) => {
  const [index, setIndex] = useState<number>(0);

  const handleTabsChange = (index: number) => {
    setIndex(index);
    if (onChange) {
      const tabNames = ['approved', 'rejected', 'pendingSubmission', 'pendingReview'];
      onChange(tabNames[index]);
    }
  };

  return (
    <Tabs index={index} onChange={handleTabsChange} variant="unstyled">
      <TabList>
        <Tab _selected={{ color: 'green.500', borderBottom: '3px solid', borderColor: 'green.500', fontWeight: 'bold' }} mr={10} pb={2} pl={1} pr={1} borderBottom="3px solid" borderColor="gray.300"><CheckCircleIcon mr={2} color="green.500" />Approved</Tab>
        <Tab _selected={{ color: 'red.500', borderBottom: '3px solid', borderColor: 'red.500', fontWeight: 'bold' }} mr={10} p={0} pb={2} pl={1} pr={1} borderBottom="3px solid" borderColor="gray.300">
          <Box display="inline-flex" alignItems="center" mr={2}>
            <IoMdCloseCircleOutline size={20} color="red" />
          </Box>
          Rejected
        </Tab>
        <Tab _selected={{ color: 'yellow.500', borderBottom: '3px solid', borderColor: 'yellow.500', fontWeight: 'bold' }} mr={10} p={0} pb={2} pl={1} pr={1} borderBottom="3px solid" borderColor="gray.300"><TimeIcon mr={2} color="yellow.500" />Pending Submission
        </Tab>
        <Tab _selected={{ color: 'yellow.500', borderBottom: '3px solid', borderColor: 'yellow.500', fontWeight: 'bold' }} mr={10} p={0} pb={2} pl={1} pr={1} borderBottom="3px solid" borderColor="gray.300"><TimeIcon mr={2} color="yellow.500" />Pending Review</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {/* Approved content */}
        </TabPanel>
        <TabPanel>
          {/* Rejected content */}
        </TabPanel>
        <TabPanel>
          {/* Pending content */}
        </TabPanel>
        <TabPanel>
          {/* Pending Approval content */}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

ReportingTabs.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default ReportingTabs;