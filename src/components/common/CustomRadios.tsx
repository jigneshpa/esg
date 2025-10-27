import { Box, HStack, Icon, Stack, Text, useRadio, useRadioGroup } from '@chakra-ui/react';
import { MdRadioButtonUnchecked } from 'react-icons/md';
import { PiRadioButtonFill } from 'react-icons/pi';
import { useState } from 'react';

const RadioItem = ({ label, labelStyle, hasTitle, ...radioProps }: any) => {
    const { state, getInputProps, getRadioProps } = useRadio(radioProps);

    return (
        <Box as={'label'} cursor={'pointer'}>
            <input {...getInputProps()} hidden />
            <HStack {...getRadioProps()}>
                {state.isChecked ? (
                    <Icon as={PiRadioButtonFill} color={'primary'} fontSize={'1.4rem'} />
                ) : (
                    <Icon as={MdRadioButtonUnchecked} color={'grey.300'} fontSize={'1.4rem'} />
                )}
                <Text {...labelStyle} title={hasTitle ? label : null}>
                    {label}
                </Text>
            </HStack>
        </Box>
    );
};

const CustomRadios = ({
    value,
    onChange,
    options,
    hasTitle = false,
    radioGroupStyle,
    labelStyle,
}: any) => {
    const { getRadioProps, getRootProps } = useRadioGroup({
        defaultValue: value,
        onChange,
    });

    return (
        <Stack {...getRootProps()} sx={{ flexWrap: 'wrap', ...radioGroupStyle }}>
            {!!options.length &&
                options.map((option: { label: any; value: any; }, index: any) => (
                    <RadioItem
                        key={index}
                        label={option.label}
                        hasTitle={hasTitle}
                        labelStyle={labelStyle}
                        {...getRadioProps({ value: option.value })}
                    />
                ))}
        </Stack>
    );
};

export default CustomRadios;