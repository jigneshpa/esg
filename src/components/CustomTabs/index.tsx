import { BoxProps, Tab, TabList, TabPanel, TabPanels, TabProps, Tabs } from '@chakra-ui/react';

interface ITabComponent {
  className?: string;
  title: string[];
  content: React.ReactNode[];
  titleStyle?: BoxProps;
  tabStyle?: TabProps;
  selectedTabStyle?: TabProps;
  containerStyle?: BoxProps;
  activeIndex?: number;
  onChange?: (index: number) => void;
}

const CustomTabs: React.FC<ITabComponent> = ({
  className,
  titleStyle,
  tabStyle,
  selectedTabStyle,
  containerStyle,
  title,
  content,
  activeIndex,
  onChange,
  ...rest
}) => {
  const handleTabChange = (index: number) => {
    if (onChange) onChange(index);
  };

  return (
    <Tabs
      display="flex"
      flexDir="column"
      w="100%"
      h="100%"
      overflow="visible"
      className={className}
      index={activeIndex}
      onChange={handleTabChange}
      {...rest}
    >
      <TabList
        {...titleStyle}
        alignItems="center"
        // gap="32px"
        justifyContent="space-around"
      >
        {!!title?.length &&
          title.map((item, index) => (
            <Tab
              p="0"
              m="0"
              h="46px"
              color="#262626"
              sx={{ backgroundColor: 'unset', ...tabStyle }}
              _selected={selectedTabStyle}
              key={index}
            >
              {item}
            </Tab>
          ))}
      </TabList>
      <TabPanels flex={1} overflow={'visible'}>
        {!!content?.length &&
          content.map((item, index) => (
            <TabPanel key={index} h="100%" p={{ base: '10px', md: '16px 0 16px 16px' }} {...containerStyle}>
              {item}
            </TabPanel>
          ))}
      </TabPanels>
    </Tabs>
  );
};

export default CustomTabs;
