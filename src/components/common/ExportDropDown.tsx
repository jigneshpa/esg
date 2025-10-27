import { SetStateAction, useEffect, useRef, useState } from 'react';
import { Box, Button, HStack, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text } from '@chakra-ui/react';

import CustomModalHeader from '../CustomModalHeader/CustomModalHeader';
import CustomRadios from './CustomRadios';

const ExportDropDown = ({
  isLoading = false,
  isDisabled = false,
  ExportBtn,
  handleExport,
  Filters,
  setExportMenuOpen,
  ...rest
}: any) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>();
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState('csv');

  useEffect(() => {
    if (open && inputRef) {
      inputRef?.current?.focus();
    }
  }, [open, inputRef]);

  // useOutsideClick({
  //     ref,
  //     handler: () => setOpen(false),
  // });

  const handleExportButton = () => {
    setOpen(!open);
    handleExport(exportType);
  };

  useEffect(() => {
    setExportMenuOpen(open);
  }, [open, setExportMenuOpen]);

  return (
    <Box ref={ref} position={'relative'} boxSizing={'border-box'} {...rest}>
      <Box onClick={() => !isDisabled && setOpen(!open)}>{ExportBtn}</Box>
      <Modal isOpen={open} isCentered onClose={() => setOpen(false)}>
        <ModalOverlay />
        <ModalContent minW={'600px'} maxW={'800px'} bg={'white'} borderRadius={'16px'}>
          <CustomModalHeader title="Download Report" />
          <ModalBody textAlign={'left'} pb="24px">
            <Box w={'100%'}>
              <Text>Select File Type</Text>
              <Box my={'20px'}>
                <CustomRadios
                  value={exportType}
                  onChange={(value: SetStateAction<string>) => {
                    setExportType(value);
                  }}
                  options={[
                    { label: 'csv', value: 'csv' },
                    { label: 'xlsx', value: 'xlsx' }
                    // { label: 'pdf', value: 'pdf' }
                  ]}
                  radioGroupStyle={{
                    justifyContent: 'start',
                    flexDirection: 'row'
                  }}
                  labelStyle={{ fontSize: '20px' }}
                />
              </Box>
            </Box>

            <Box>{Filters}</Box>
          </ModalBody>
          <ModalFooter>
            <HStack gap="16px" w={'100%'} justifyContent="center" p="0">
              <Button
                w={'160px'}
                h={'44px'}
                borderRadius={'10px'}
                color="black"
                bg="border !important"
                opacity={0.8}
                _hover={{
                  opacity: 1,
                  background: 'border !important'
                }}
                _focus={{
                  background: 'border !important'
                }}
                onClick={() => setOpen(false)} // Update here
              >
                Cancel
              </Button>
              <Button w={'160px'} h={'44px'} borderRadius={'10px'} isLoading={isLoading} onClick={handleExportButton}>
                Download
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExportDropDown;
