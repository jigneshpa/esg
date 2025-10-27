import { extendTheme } from '@chakra-ui/react';

const activeLabelStyles = {
  transform: "scale(0.85) translateY(-24px)"
};

const components = {
  Heading: {
    sizes: {
      lg: {
        fontSize: '1.5rem'
      }
    }
  },
  AccordionItem: {
    baseStyle: {
      borderBottom: 'none',
      _last: { borderBottomWidth: '0' }
    }
  },
  Button: {
    baseStyle: {
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '24px',
      ':disabled': {
        backgroundColor: 'grey.300',
        color: 'grey.700',
        border: '1px solid',
        borderColor: 'border'
      },
      ':hover:disabled': {
        backgroundColor: 'grey.300'
      }
    },
    variants: {
      solid: () => ({
        bg: 'primary',
        color: 'white',
        _hover: {
          bg: 'primary'
        },
        _active: {
          bg: 'primary'
        }
      }),
      outline: {
        color: 'primary',
        bg: 'white'
      },
      action: {
        fontSize: '14px',
        fontWeight: '400',
        justifyContent: 'flex-start',
        width: '100%',
        height: '32px',
        lineHeight: '22px',
        color: '#000',
        backgroundColor: 'transparent',
        _hover: {
          background: '#FAFAFA'
        }
      },
      downloadReport: {
        fontSize: '0.9em',
        fontWeight: 700,
        width: 'auto',
        height: '44px',
        backgroundColor: 'transparent',
        color: '#00386E',
        _hover: { opacity: 0.8 }
      },
      delete: {
        fontSize: '14px',
        fontWeight: '400',
        justifyContent: 'flex-start',
        width: '100%',
        height: '32px',
        color: '#FF4D4F',
        backgroundColor: 'transparent',
        _hover: {
          opacity: 0.8
        }
      }
    }
  },
  FormLabel: {
    baseStyle: {
      fontSize: '14px',
      color: 'label',
      lineHeight: '22px',
      fontWeight: '400'
    }
  },

  Input: {
    variants: {
      outline: () => ({
        field: {
          borderColor: 'border',
          borderRadius: '10px',
          _placeholder: {
            color: 'grey.500'
          },
          _hover: {
            borderColor: '#137E59'
          }
        }
      })
    },
    defaultProps: {
      focusBorderColor: '#137E59',
    },
  },
  Textarea: {
    variants: {
      outline: () => ({
        field: {
          borderColor: 'border',
          borderRadius: '10px',
          _placeholder: {
            color: 'grey.300'
          },
          _hover: {
            borderColor: '#137E59'
          }
        }
      })
    },
    defaultProps: {
      focusBorderColor: '#137E59'
    }
  },
  Icon: {
    variants: {
      sideBar: {
        w: '16px',
        h: '16px'
      }
    }
  },
  Checkbox: {
    baseStyle: {
      control: {
        _checked: {
          bg: 'primary',
          borderColor: 'primary',
          _hover: {
            bg: 'primary',
            borderColor: 'primary'
          }
        }
      }
    }
  },
  Select: {
    baseStyle: {
      field: {
        color: 'label',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '22px'
      },
      icon: {
        color: 'pureBlack'
      }
    },
    variants: {
      outline: {
        field: {
          borderColor: 'border',
          _hover: {
            borderColor: '#137E59'
          }
        }
      }
    },
    defaultProps: {
      focusBorderColor: '#137E59'
    }
  },
  PageContainer: {
    baseStyle: { padding: { base: '5px', md: '5px 10px 10px 10px' } }
  },
  Badge: {
    baseStyle: {
      textTransform: 'unset',
      fontWeight: 500,
      fontSize: '12px'
    },
    variants: {
      new: {
        w: '72px',
        h: '22px',
        borderRadius: '5px',
        color: 'grey.700',
        bg: 'grey.100'
      },
      submitted: {
        w: '72px',
        h: '22px',
        borderRadius: '5px',
        color: 'orange',
        bg: '#FFFAEB'
      },
      approved: {
        w: '72px',
        h: '22px',
        borderRadius: '5px',
        color: 'green.400',
        bg: '#ECFDF3'
      },
      pending: {
        w: '72px',
        h: '22px',
        borderRadius: '5px',
        color: 'orange',
        bg: '#FFFAEB'
      },
      rejected: {
        w: '72px',
        h: '22px',
        borderRadius: '5px',
        color: 'red.500',
        bg: '#EC4F5C1A'
      },
      active: {
        w: 'auto',
        h: '22px',
        p: '0 8px',
        borderRadius: '5px',
        color: 'green.400',
        bg: '#ECFDF3'
      },
      inactive: {
        w: 'auto',
        h: '22px',
        p: '0 8px',
        borderRadius: '5px',
        color: 'grey.700',
        bg: '#EAEAEA'
      },
      green: {
        w: '75px',
        h: '25px',
        p: '0 10px',
        borderRadius: '20px',
        color: 'white',
        bg: 'primary',
        textAlign: 'center',
        lineHeight: '25px'
      },
      orange: {
        w: '75px',
        h: '25px',
        p: '0 10px',
        borderRadius: '20px',
        color: 'white',
        bg: 'orange',
        textAlign: 'center',
        lineHeight: '25px'
      },
      red: {
        w: '75px',
        h: '25px',
        p: '0 10px',
        borderRadius: '20px',
        color: 'white',
        bg: 'red',
        textAlign: 'center',
        lineHeight: '25px'
      }
    }
  },
  TextEllipsis: {
    baseStyle: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }
  },
  Form: {
    variants: {
      floating: {
        container: {
          _focusWithin: {
            label: {
              ...activeLabelStyles
            }
          },
          "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label": {
            ...activeLabelStyles
          },
          label: {
            top: 0,
            left: 0,
            zIndex: 2,
            position: "absolute",
            backgroundColor: "white",
            pointerEvents: "none",
            mx: 3,
            px: 1,
            my: 2,
            transformOrigin: "left top",
            color: 'grey.500',
            fontSize: '16px'
          }
        }
      }
    }
  }
};

const styles = {
  global: () => ({
    html: {
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    body: {
      color: 'black',
      backgroundColor: 'white',
      userSelect: 'none',
      overflow: 'hidden'
    },
    '.cancel-btn:hover':{
      color: '#ffffff'
    },
    '[disabled]': {
      opacity: '1 !important',
      cursor: 'default !important'
    },
    '@media print': {
      '.no-print': {
        display: 'none !important'
      }
    },
    '.chakra-popover__popper': {
      zIndex: '1500 !important'
    },
    '.chakra-form__error-message svg': {
      mr: '5px'
    },
    '.chakra-radio .chakra-radio__control': {
      w: '19px',
      h: '19px'
    },
    '.chakra-radio .chakra-radio__control[data-checked]': {
      bg: 'white',
      color: 'primary',
      borderColor: 'primary'
    },
    '.chakra-radio .chakra-radio__control[data-checked]:hover': {
      bg: 'white',
      borderColor: 'primary'
    },
    '.chakra-radio .chakra-radio__control[data-checked]:before': {
      w: '80%',
      h: '80%'
    },
    '.chakra-table__container tbody tr:hover td:not([data-label=noData])': {
      bg: 'grey.200'
    },
    '.custom-scroll-bar::-webkit-scrollbar': {
      w: '7px',
      h: '7px'
    },
    '.custom-scroll-bar::-webkit-scrollbar-track': {
      bg: 'grey.200'
    },
    '.custom-scroll-bar::-webkit-scrollbar-thumb': {
      bg: 'grey.800',
      borderRadius: '10px'
    },
    '.asset-assignments-review-btn:disabled': {
      bg: 'border'
    },
    '.asset-assignments-review-btn:disabled:hover': {
      bg: 'border !important'
    },
    '.export-questionnaire .chakra-collapse': {
      overflow: 'unset !important'
    },
    form: {
      w: '100%'
    },
    '.questionnaire .questionnaire-input:disabled': {
      opacity: 1
    },
    '.react-pagination': {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      listStyleType: 'none',
      color: 'grey.800',
      fontWeight: '500'
    },
    '.react-pagination-page, .react-pagination-previous a, .react-pagination-next a, .react-pagination .break a': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '35px',
      height: '35px',
      borderRadius: '6px',
      border: '1px solid',
      borderColor: 'border',
      backgroundColor: 'white'
    },
    '.react-pagination .break a': {
      fontSize: '25px',
      border: 'unset'
    },
    '.react-pagination .selected a': {
      color: 'white',
      backgroundColor: 'primary',
    },
    '.react-pagination-previous.disabled a, .react-pagination-next.disabled a': {
      cursor: 'not-allowed',
      pointerEvents: 'none'
    },
    '.chakra-modal__header': {
      borderRadius: '16px 16px 0px 0px',
      bg: '#FFF'
    },
    '.chakra-modal__footer': {
      borderRadius: '0px 0px 16px 16px',
    },
    '.chakra-modal__content-container': {
      padding: '16px',
      '@media (min-width: 960px)': {
        padding: '0px'
      }
    }
  })
};

const colors = {
  primary: '#137E59',
  white: {
    '100': '#ffffff1a'
  },
  black: '#001724',
  pureBlack: '#000000',
  grey: {
    '100': '#F8F9FA',
    '200': '#F3F4F6',
    '300': '#F5F5F5',
    '500': '#B5C0CD',
    '600': '#7E868C',
    '650': '#6B7280',
    '700': '#66747C',
    '800': '#6C757D',
    '900': '#101828'
  },
  green: {
    '100': '#5ABE5E1A',
    '200': '#EBF7EB',
    '300': '#5FCF63',
    '400': '#5ABE5E',
    '700': '#01401C'
  },
  blue: {
    '500': '#0678FF',
    '700': '#3361FF',
    '800': '#1C3E57',
    '900': '#3361FF'
  },
  greyBlue: '#6B7A99',
  red: {
    '200': '#FFF2EE',
    '500': '#EC4F5C'
  },
  violet: {
    '700': '#383874'
  },
  flag: '#FF7070',
  orange: '#F4AC3B',
  border: '#E2E4E9',
  label: '#8C8C8C',
  link: '#3182F7'
};

const fonts = {
  heading: `'Public Sans', sans-serif`,
  body: `'Public Sans', sans-serif`
};

export const theme = extendTheme({
  components,
  styles,
  colors,
  fonts
});
