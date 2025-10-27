import API from '@/api';
import { supportPageBackground } from '@/assets';
import { Header, SupportForm } from '@/components';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import {
    Box,
    Flex,
    HStack,
    Icon,
    Image,
    Show,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWindowSize } from '@uidotdev/usehooks';
const Support: React.FC = () => {
    const navigate = useNavigate();
    const size = useWindowSize();
    const { notify, sideBarOpen, setSideBarOpen } = useAppContext();
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        setSideBarOpen(false);
    }, []);
    const onSubmit = async (data: any, onSuccess?: () => void) => {
        setSubmitting(true);
        try {
            await API.sendSupport(data);
            onSuccess?.();
            notify({ message: 'Thank you', description: MESSAGE.SUPPORT_FORM_SUCCESS });
        } catch (error) {
            notify({
                type: STATUS.ERROR,
            });
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <Flex h={`${size.height}px`} flexDir={'column'}>
            <Show above="lg">
                {/* Add content for larger screens if needed */}
            </Show>
            <VStack
                flex={1}
                w={'100%'}
                overflow={'auto'}
                margin="0 auto"
                align={'start'}
                p={{
                    base: '0px 16px',
                    md: '0px 32px',
                    lg: '0px 40px',
                }}
            >
                <Box
                    flex={1}
                    py={'34px'}
                    w="100%"
                    margin="0 auto"
                    maxW={{
                        base: '100%',
                        md: '90%',
                        lg: '1080px',
                    }}
                >
                    <Flex
                        display={{ base: 'none', md: 'flex' }}
                        position={'relative'}
                        alignItems={'center'}
                        mb={{
                            base: '24px',
                            lg: '36px',
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
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon h={'100%'} as={FiArrowLeft} fontSize={'20px'} />
                        </Box>
                        <Text
                            whiteSpace={'nowrap'}
                            position={'absolute'}
                            left={'50%'}
                            transform={'translateX(-50%)'}
                            lineHeight={1}
                            fontSize={'24px'}
                            fontWeight={600}
                            display={{
                                base: 'none',
                                md: 'block',
                                lg: 'none',
                            }}
                        >
                            Reach out to our support team
                        </Text>
                    </Flex>
                    <HStack gap={4} flex={1} w={'100%'} overflow={'hidden'} alignItems={'flex-start'}>
                        <Show above={'lg'}>
                            <Flex flex={1}>
                                <Image src={supportPageBackground} />
                            </Flex>
                        </Show>
                        <Flex
                            flex={1}
                            justifyContent={{
                                base: 'flex-start',
                                lg: 'center',
                            }}
                        >
                            <Box
                                flex={1}
                                h={'100%'}
                                gap={'40px'}
                                w={'100%'}
                                maxW={{
                                    base: '100%',
                                    lg: '400px',
                                }}
                            >
                                <Text
                                    fontSize={{
                                        base: '20px',
                                        lg: '26px',
                                    }}
                                    fontWeight={600}
                                    mb={{
                                        base: '24px',
                                        lg: '40px',
                                    }}
                                    display={{
                                        base: 'block',
                                        md: 'none',
                                        lg: 'block',
                                    }}
                                >
                                    Reach out to our support team
                                </Text>
                                <Box w={'100%'}>
                                    <SupportForm submitting={submitting} onSubmit={onSubmit} />
                                </Box>
                            </Box>
                        </Flex>
                    </HStack>
                </Box>
            </VStack>
        </Flex>
    );
};
export default Support;

