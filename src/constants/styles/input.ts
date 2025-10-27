export const inputStyles = {
  control: (baseStyles: Record<string, unknown>) => ({
    ...baseStyles,
    fontSize: '14px',
    width: '190px',
    lineHeight: '22px'
  }),
  indicatorSeparator: (baseStyles: Record<string, unknown>) => ({
    ...baseStyles,
    display: 'none'
  })
};
