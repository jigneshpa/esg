import { Box, Button, FormControl, VStack } from '@chakra-ui/react';

interface AttachmentButtonsProps {
  files: { key: string; name: string }[];
  handleView: () => void;
  handleDownloadAttachment: () => void;
  isDownloading: boolean;
  isAnswerMode: boolean;
}

const AttachmentButtons = ({
  files,
  handleView,
  handleDownloadAttachment,
  isDownloading,
  isAnswerMode,
}: AttachmentButtonsProps) => {
  // Use files directly since it's guaranteed to be an array
  const hasFiles = files?.length > 0;

  return (
    <Box w="100%" mb={4} px={4}>
      <FormControl>
        <Box display="flex" w="100%" px={isAnswerMode ? '20px' : ''}>
          <VStack>
            <Box display="flex" w="100%" gap="4">
              <Button
                fontSize="14px"
                fontWeight="400"
                justifyContent="center"
                h="40px"
                borderRadius="4px"
                border="1px solid #D9D9D9"
                bg="#137E59"
                color="white"
                onClick={handleView}
                isDisabled={!hasFiles}
                _hover={{
                  color: 'white',
                  bg: '#137E59',
                }}
                _disabled={{
                  color: 'grey.800',
                  _hover: {
                    color: 'grey.800',
                  },
                }}
              >
                View Attachment
              </Button>
              <Button
                fontSize="14px"
                fontWeight="400"
                justifyContent="center"
                h="40px"
                borderRadius="4px"
                border="1px solid #D9D9D9"
                bg="#137E59"
                color="white"
                isDisabled={!hasFiles}
                onClick={handleDownloadAttachment}
                isLoading={isDownloading}
                loadingText="Loading"
                _hover={{
                  color: 'white',
                  bg: '#137E59',
                }}
                _loading={{
                  bg: '#137E59',
                  color: 'white',
                  _hover: {
                    bg: '#137E59',
                    color: 'white',
                  },
                }}
                _disabled={
                  !isDownloading
                    ? {
                        color: 'grey.800',
                        _hover: {
                          color: 'grey.800',
                        },
                      }
                    : {}
                }
              >
                Download Attachment
              </Button>
            </Box>
          </VStack>
        </Box>
      </FormControl>
    </Box>
  );
};

export default AttachmentButtons;