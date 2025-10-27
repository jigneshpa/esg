import { Key, useEffect } from 'react';
import { BiSolidChevronRight } from 'react-icons/bi';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Show,
  Text,
  VStack
} from '@chakra-ui/react';

import { backgroundFAQBottom, backgroundFAQTop } from '@/assets';
import { getFaqListByRoleName } from '@/constants/faq';
import { useAppContext } from '@/context/AppContext';
import { useWindowSize } from '@uidotdev/usehooks';

interface FAQItemProps {
  data: {
    title: string,
    content?: string,
    content_images?: string[],
    steps?: { content: string, images?: string[] }[]
  };
}
const FAQItem: React.FC<FAQItemProps> = ({ data }) => {
  const { title, content, content_images, steps } = data;
  return (
    <AccordionItem
      position={'relative'}
      zIndex={10}
      border={'none'}
      mb={'24px'}
      bg="white"
      boxShadow="0px 8px 11px -4px rgba(45, 54, 67, 0.04)"
      borderRadius="10px"
    >
      {({ isExpanded }) => (
        <AccordionButton
          bg="transparent"
          _hover={{ bg: 'transparent' }}
          p={{
            base: '18px 16px',
            md: '20px 24px',
            lg: '25px 32px'
          }}
          flexDirection="column"
          alignItems="flex-start"
        >
          <Flex w="100%" alignItems="center">
            <Box as="span" flex="1" textAlign="left" fontWeight={500} fontSize="1.1em">
              {title}
            </Box>
            <Icon
              flexBasis={'20px'}
              as={BiSolidChevronRight}
              transition={'all 0.2s ease-in-out'}
              transform={isExpanded ? `rotate(90deg)` : ''}
              color={'grey.700'}
            />
          </Flex>
          <AccordionPanel p={0} pt={4} w="100%" textAlign="left">
            <VStack alignItems={'center'}>
              <Text fontStyle="italic" textIndent="1rem" as="div" dangerouslySetInnerHTML={{ __html: content || '' }} />
              {!!content_images?.length && (
                <Image alt={title} src={content_images[0]} w={{ base: '100%', md: '80%', lg: '600px' }} ml="1rem" />
              )}
            </VStack>
            <VStack w={'100%'} alignItems={'center'}>
              {!!steps?.length &&
                steps.map((step: { content: string, images?: string[] }, index: Key | null | undefined) => (
                  <VStack key={index} alignItems={'flex-start'} w={'100%'}>
                    <Box textIndent={'2rem'} fontStyle="italic">
                      Step {index !== null && index !== undefined ? (index as number) + 1 : 1}: &nbsp;
                      <Box display={'inline'} dangerouslySetInnerHTML={{ __html: step.content }} />
                    </Box>
                    {!!step.images?.length &&
                      step.images.map((url, index) => (
                        <Image key={index} alt={`Step ${index + 1}`} src={url} mt="4" mb="4" mx="2rem" />
                      ))}
                  </VStack>
                ))}
            </VStack>
          </AccordionPanel>
        </AccordionButton>
      )}
    </AccordionItem>
  );
};
const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const size = useWindowSize();
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const FAQ_LIST = getFaqListByRoleName(userRole || 'user');
  useEffect(() => {
    setSideBarOpen(false);
  }, []);
  return (
    <Flex flexDir={'column'} bg={'grey.100'}>
      <Flex
        flex={1}
        bg={'grey.100'}
        overflow={'auto'}
        sx={{
          '&::-webkit-scrollbar': {
            width: '0px'
          }
        }}
        p={{
          base: '0px 16px',
          md: '0px 32px',
          lg: '0px 40px'
        }}
      >
        <Box
          flex={1}
          h={'100%'}
          py="24px"
          margin="0 auto"
          w="100%"
          maxW={{
            base: '100%',
            md: '90%',
            lg: '1080px'
          }}
          position={'relative'}
        >
          <HStack
            justifyContent={{
              base: 'flex-start',
              md: 'center'
            }}
            mb={{
              base: '24px',
              md: '32px',
              lg: '40px'
            }}
          >
            <Box
              w={'44px'}
              h={'44px'}
              borderRadius={'50%'}
              border={'1px solid'}
              borderColor={'border'}
              cursor={'pointer'}
              bg="white"
              _hover={{ bg: 'white' }}
              onClick={() => navigate(-1)}
              position="absolute"
              left={0}
              display={{ base: 'none', md: 'flex' }}
              alignItems="center"
              justifyContent="center"
            >
              <Icon h={'100%'} as={FiArrowLeft} fontSize={'20px'} />
            </Box>
            <Text
              fontSize={{
                base: '20px',
                md: '24px',
                lg: '26px'
              }}
              fontWeight={{
                base: 500,
                md: 700,
                lg: 700
              }}
              lineHeight={{
                base: 1.5,
                md: 2,
                lg: 2.4
              }}
            >
              Frequently Asked Questions
            </Text>
          </HStack>
          <Accordion allowToggle>
            {FAQ_LIST.map(item => (
              <FAQItem key={item.title} data={item} />
            ))}
          </Accordion>
        </Box>
        <Show above="lg">
          <Image position={'absolute'} top={0} right={0} src={backgroundFAQTop} alt="image for FAQ" />
          <Image position={'absolute'} top={'54%'} left={0} src={backgroundFAQBottom} alt="image for FAQ" />
        </Show>
      </Flex>
    </Flex>
  );
};
export default FAQ;
