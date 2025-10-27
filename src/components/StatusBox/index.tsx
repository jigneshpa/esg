import { Text, TextProps } from '@chakra-ui/react';

export enum STATUS_BOX_TYPE {
  Pending = 1,
  Error,
  Success
}

export type statusType = STATUS_BOX_TYPE.Pending | STATUS_BOX_TYPE.Error | STATUS_BOX_TYPE.Success;

interface StatusBoxProps extends TextProps {
  type: statusType
}

const typeStyles = {
  [STATUS_BOX_TYPE.Success]: {
    color: "#F6FFED",
    background: "#389E0D"
  },
  [STATUS_BOX_TYPE.Error]: {
    color: "#F5222D",
    background: "#FFF1F0"
  },
  [STATUS_BOX_TYPE.Pending]: {
    color: "#FA8C16",
    background: "#FFF7E6"
  }
}

const Index: React.FC<StatusBoxProps> = ({ type, children, ...rest }) => {
  return (
    <Text width={"fit-content"} borderRadius={"4px"} background={typeStyles[type].background} padding={"1px 8px"} color={typeStyles[type].color} fontSize={"12px"} {...rest}>
      {children}
    </Text>
  );
};

export default Index;
