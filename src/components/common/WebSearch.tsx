import { FC, useCallback, useRef, useState } from 'react';
import { MdBusiness, MdDescription, MdOpenInNew, MdSearch } from 'react-icons/md';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';

interface WebSearchProps {
  companyName?: string;
  standardName?: string;
  isCollapsible?: boolean;
}

const WebSearch: FC<WebSearchProps> = ({ companyName = '', standardName = '', isCollapsible = true }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleWebSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        toast({
          title: 'Search query required',
          description: 'Please enter a search term.',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    },
    [toast]
  );

  const handleQuickSearch = useCallback(
    (type: 'company' | 'standard' | 'sustainability') => {
      let query = '';

      switch (type) {
        case 'company':
          query = `${companyName} company information sustainability practices ESG`;
          break;
        case 'standard':
          query = `${standardName} ESG standard requirements compliance`;
          break;
        case 'sustainability':
          query = `${companyName} sustainability report ESG disclosure`;
          break;
      }

      if (query) {
        handleWebSearch(query);
      }
    },
    [companyName, standardName, handleWebSearch]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleWebSearch(searchQuery);
      }
    },
    [searchQuery, handleWebSearch]
  );

  const handleSearchClick = useCallback(() => {
    handleWebSearch(searchQuery);
  }, [searchQuery, handleWebSearch]);

  const renderSearchContent = () => (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontSize="sm" color="gray.600" mb={3}>
          Search the web for information to help with your assignment decision
        </Text>

        <FormControl>
          <FormLabel fontSize="sm">Custom Search</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              placeholder="Enter search terms..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              size="sm"
              autoComplete="off"
            />
          </InputGroup>
        </FormControl>

        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<Icon as={MdOpenInNew} />}
          onClick={handleSearchClick}
          mt={2}
          w="full"
        >
          Search on Web
        </Button>
      </Box>

      {(companyName || standardName) && (
        <>
          <Divider />
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={3}>
              Quick Search Options
            </Text>
            <VStack spacing={2}>
              {companyName && (
                <HStack w="full" spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Icon as={MdBusiness} />}
                    onClick={() => handleQuickSearch('company')}
                    flex={1}
                    fontSize="xs"
                  >
                    Company Info
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Icon as={MdSearch} />}
                    onClick={() => handleQuickSearch('sustainability')}
                    flex={1}
                    fontSize="xs"
                  >
                    Sustainability
                  </Button>
                </HStack>
              )}
              {standardName && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdDescription} />}
                  onClick={() => handleQuickSearch('standard')}
                  w="full"
                  fontSize="xs"
                >
                  Standard Requirements
                </Button>
              )}
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  );

  if (isCollapsible) {
    return (
      <Accordion allowToggle>
        <AccordionItem border="none">
          <AccordionButton px={0} py={2} _hover={{ bg: 'transparent' }} _expanded={{ bg: 'transparent' }}>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={MdSearch} color="blue.500" />
                <Text fontSize="sm" fontWeight="medium" color="blue.500">
                  Search on Web
                </Text>
              </HStack>
            </Box>
            <AccordionIcon color="blue.500" />
          </AccordionButton>
          <AccordionPanel px={0} py={3}>
            {renderSearchContent()}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
      {renderSearchContent()}
    </Box>
  );
};

export default WebSearch;
