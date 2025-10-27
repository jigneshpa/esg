import React, { cloneElement, isValidElement, ReactElement, ReactNode, useEffect, useRef } from 'react';
import { RiMore2Fill } from 'react-icons/ri';
import {
  Center,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  useDisclosure,
  VStack
} from '@chakra-ui/react';

interface Props {
  trigger?: ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'top' | 'right';
  width?: string;
  minWidth?: string;
  children: ReactNode;
}

const ActionPopover: React.FC<Props> = ({
  trigger = (
    <Center>
      <RiMore2Fill color="#137E59" style={{ cursor: 'pointer', width: '28px', height: '28px' }} />
    </Center>
  ),
  placement = 'bottom-start',
  width = 'auto',
  minWidth = '160px',
  children
}) => {
  const { onOpen, onClose: internalOnClose, isOpen } = useDisclosure();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (event:Event) => {
      if (!popoverRef.current) return;
      const target = event.target as Node;
    
      // If the target is outside the popover, close it
    if (!popoverRef.current.contains(target)) {
      internalOnClose();
    }
    };

    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen, internalOnClose]);

  useEffect(() => {
    if (popoverRef.current) {
      if (isOpen) {
        popoverRef.current.style.removeProperty('display');
        popoverRef.current.style.height = 'auto';
        popoverRef.current.style.width = 'auto';
      } else {
        popoverRef.current.style.display = 'none';
        popoverRef.current.style.height = '0';
        popoverRef.current.style.width = '0';
      }
    }
  }, [isOpen]);

  const handleChildClick = (child: ReactNode) => {
    if (isValidElement(child)) {
      return cloneElement(child as ReactElement<any>, {
        onClick: (event: MouseEvent) => {
          child.props?.onClick?.(event);
          internalOnClose();
        }
      });
    }
    return child;
  };

  return (
    <Popover
      onOpen={onOpen}
      onClose={internalOnClose}
      placement={placement}
      isOpen={isOpen}
      initialFocusRef={popoverRef}
    >
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <Portal>
        <PopoverContent
          ref={popoverRef}
          w={width}
          minW={minWidth}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px !important"
          overflow="hidden"
          _focus={{ outline: 'none', boxShadow: 'none' }}
        >
          <PopoverBody p="0" bg="#fff">
            <VStack
              sx={{
                '& > *:last-child': {
                  borderBottom: 'none'
                }
              }}
              w="100%"
              spacing={0}
            >
              {React.Children.map(children, handleChildClick)}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default ActionPopover;
