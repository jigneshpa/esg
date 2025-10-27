import { useEffect, useRef, useState } from 'react';
import { Box, BoxProps, useStyleConfig } from '@chakra-ui/react';

interface EllipsisBoxProps extends BoxProps {
  showTooltip?: boolean;
}

const EllipsisBox: React.FC<EllipsisBoxProps> = ({ children, showTooltip = true, ...rest }) => {
  const TextEllipsis = useStyleConfig('TextEllipsis');
  const boxRef = useRef<HTMLDivElement>(null);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  useEffect(() => {
    if (showTooltip && boxRef.current) {
      const element = boxRef.current;
      setIsTextTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [children, showTooltip]);

  const title = showTooltip && isTextTruncated ? String(children) : undefined;

  return (
    <Box ref={boxRef} sx={TextEllipsis} title={title} {...rest}>
      {children}
    </Box>
  );
};

export default EllipsisBox;
