import { FC } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalBodyProps,
  ModalCloseButton,
  ModalContent,
  ModalContentProps,
  ModalFooter,
  ModalFooterProps,
  ModalHeader,
  ModalHeaderProps,
  ModalOverlay,
  ModalProps,
  Text,
  VStack
} from '@chakra-ui/react';

import { OnlylogoGreen } from '@/assets/index';
import { MESSAGE, STATUS } from '@/constants';

export interface NotificationProps {
  /** The status type which can affect styling. */
  type?: STATUS;

  /** The main message displayed in the notification. */
  message: MESSAGE | string;

  /** The description(s) displayed in the body. */
  description?: string | string[];

  /** Controls the visibility of the modal. */
  isOpen: boolean;

  /** Function called when the close button is clicked. */
  onGotIt?: () => void;

  /** Function called when the modal is closed. */
  onClose: () => void;

  /** Label for the close button. */
  closeBtnLabel?: string;

  /** If true, hides the header. */
  hideHeader?: boolean;

  /** If true, hides the footer. */
  hideFooter?: boolean;

  /** If true, hides the close button. */
  hideCloseButton?: boolean;

  /** Custom component to render in the header. */
  customHeader?: React.ReactNode;

  /** Custom component to render in the body. */
  customBody?: React.ReactNode;

  /** Custom component to render in the footer. */
  customFooter?: React.ReactNode;

  /** URL of the icon to display in the header. */
  icon?: string;

  /** Custom icon component to display in the header. */
  headerIcon?: React.ReactNode;

  /** Custom props to pass to the Modal component. */
  modalProps?: ModalProps;

  /** Custom props to pass to the ModalContent component. */
  modalContentProps?: ModalContentProps;

  /** Custom props to pass to the ModalHeader component. */
  modalHeaderProps?: ModalHeaderProps;

  /** Custom props to pass to the ModalBody component. */
  modalBodyProps?: ModalBodyProps;

  /** Custom props to pass to the ModalFooter component. */
  modalFooterProps?: ModalFooterProps;

  /** Custom props to pass to the close Button component. */
  closeButtonProps?: ButtonProps;

  /** Controls the justification of the footer buttons. */
  justifyContent?: string;

  /** Controls the alignment of items in the header. */
  headerAlignItems?: string;

  /** Controls the gap between elements in the header. */
  headerGap?: number | string;
}

const Notification: FC<NotificationProps> = ({
  type = STATUS.SUCCESS,
  message,
  description,
  isOpen,
  onGotIt,
  onClose,
  closeBtnLabel = 'OK',
  hideHeader,
  hideFooter,
  hideCloseButton,
  customHeader,
  customBody,
  customFooter,
  icon,
  headerIcon,
  modalProps,
  modalContentProps,
  modalHeaderProps,
  modalBodyProps,
  modalFooterProps,
  closeButtonProps,
  justifyContent,
  headerAlignItems,
  headerGap
}) => {
  const descriptions = Array.isArray(description) ? description : description ? [description] : [];

  const handleOk = () => {
    if (onGotIt) onGotIt();
    onClose();
  };

  const getButtonColor = () => {
    switch (type) {
      case STATUS.ERROR:
        return 'red.500';
      default:
        return 'primary';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered {...modalProps}>
      <ModalOverlay />
      <ModalContent bg="white" borderRadius="12px" boxShadow="lg" maxW="400px" {...modalContentProps}>
        {!hideHeader && (
          <ModalHeader
            p={4}
            borderBottom={descriptions.length > 0 ? '1px solid' : 'none'}
            borderColor="gray.200"
            {...modalHeaderProps}
          >
            {customHeader ? (
              customHeader
            ) : (
              <Flex display={'flex'} alignItems={'flex-start'} justifyContent="space-between" gap={headerGap || 2}>
                <Flex alignItems={'flex-start'} justifyContent="flex-start" gap={headerGap || 2}>
                  {headerIcon ? headerIcon : <Image src={icon || OnlylogoGreen} width="30px" height="30px" />}
                  <Text fontSize="lg" fontWeight="400">
                    {message}
                  </Text>
                </Flex>
                <ModalCloseButton position={'static'} />
              </Flex>
            )}
          </ModalHeader>
        )}

        {customBody ? (
          <ModalBody {...modalBodyProps}>{customBody}</ModalBody>
        ) : descriptions.length > 0 ? (
          <ModalBody {...modalBodyProps}>
            <VStack spacing={2}>
              {descriptions.map((desc, index) => (
                <Box key={index} textAlign="left" marginRight={'auto'}>
                  {desc}
                </Box>
              ))}
            </VStack>
          </ModalBody>
        ) : null}

        {!hideFooter && (
          <ModalFooter justifyContent={justifyContent || 'center'} p={4} {...modalFooterProps}>
            {customFooter
              ? customFooter
              : !hideCloseButton && (
                  <Button
                    w="auto"
                    marginLeft="auto"
                    h="34px"
                    borderRadius="8px"
                    bg={getButtonColor()}
                    fontWeight="medium"
                    color="white"
                    _hover={{
                      bg: getButtonColor(),
                      opacity: 0.9,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                    onClick={handleOk}
                    {...closeButtonProps}
                  >
                    {closeBtnLabel}
                  </Button>
                )}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Notification;
