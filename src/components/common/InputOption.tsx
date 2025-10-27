//@ts-nocheck
import { useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { components } from 'react-select';

export const InputOption = ({ getStyles, isDisabled, isFocused, isSelected, children, innerProps, ...rest }) => {
  console.log('InputOption rendered with:', { children, isSelected, data: rest.data });
  const { data, selectProps } = rest;
  const userRole = selectProps?.additional?.userRole; // Get userRole from additional
  const adminUsers = selectProps?.additional?.adminUsers || []; // Get adminUsers from additional
  console.log('userRole inputOption',userRole)
  console.log('adminUsers inputOption',adminUsers)

  if ((userRole === 'user-admin' || userRole  === 'admin' || userRole === 'manager') && !adminUsers.some(user => user.value === data.value)) {
    return null; // Skip rendering options not in adminUsers
  }
  const [isActive, setIsActive] = useState(false);
  const onMouseDown = () => setIsActive(true);
  const onMouseUp = () => setIsActive(false);
  const onMouseLeave = () => setIsActive(false);

  let bg = 'transparent';
  if (isFocused) bg = '#eee';
  if (isActive) bg = '#B2D4FF';

  const style = {
    alignItems: 'center',
    backgroundColor: bg,
    color: 'inherit',
    display: 'flex ',
    gap: '9px'
  };

  const props = {
    ...innerProps,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    style
  };

  return (
    <components.Option
      {...rest}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isSelected={isSelected}
      getStyles={getStyles}
      innerProps={props}
    >
      <input style={{ accentColor: '#137E59' }} type="checkbox" checked={isSelected} readOnly />
      {children} 
    </components.Option>
  );
};

export const Placeholder = props => {
  const isMenuOpen = props.selectProps.menuIsOpen;
  const isLoading = props.selectProps.isLoading;
  return (
    <components.Placeholder {...props}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}
        color="#137E59"
      >
        {props.children}
        {isMenuOpen && !isLoading && <BiSearch color="#137E59" />}
      </div>
    </components.Placeholder>
  );
};

export const customStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    minWidth: '195px',
    borderRadius: '10px',
    borderColor: state.isFocused ? '#137E59 !important' : provided.borderColor,
    boxShadow: state.isFocused ? '0 0 0 1px #137E59' : provided.boxShadow,
    '&:hover': {
      borderColor: state.isFocused ? '#137E59' : provided.borderColor
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#137E59' : state.isFocused ? '#D3D3D3' : provided.backgroundColor,
    color: state.isSelected ? 'white' : state.isFocused ? 'black' : provided.color,
    '&:hover': {
      backgroundColor: state.isSelected ? '#137E59' : '#D3D3D3',
      color: state.isSelected ? 'white' : 'black'
    }
  })
};

export const customStylesDraftFilter = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    minWidth: '150px',
    borderRadius: '10px',
    borderColor: state.isFocused ? '#137E59 !important' : provided.borderColor,
    boxShadow: state.isFocused ? '0 0 0 1px #137E59' : provided.boxShadow,
    '&:hover': {
      borderColor: state.isFocused ? '#137E59' : provided.borderColor
    },
    '@media (max-width: 1291px)': {
      minWidth: '125px'
    },
    '@media (max-width: 1160px)': {
      minWidth: '100px'
    },
    '@media (max-width: 1037px)': {
      minWidth: '80px'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#137E59' : state.isFocused ? '#D3D3D3' : provided.backgroundColor,
    color: state.isSelected ? 'white' : state.isFocused ? 'black' : provided.color,
    '&:hover': {
      backgroundColor: state.isSelected ? '#137E59' : '#D3D3D3',
      color: state.isSelected ? 'white' : 'black'
    }
  })
};

export const customDraftInputStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    minWidth: '180px',
    borderRadius: '10px',
    borderColor: state.isFocused ? '#137E59 !important' : provided.borderColor,
    boxShadow: state.isFocused ? '0 0 0 1px #137E59' : provided.boxShadow,
    '&:hover': {
      borderColor: state.isFocused ? '#137E59' : provided.borderColor
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#137E59' : state.isFocused ? '#D3D3D3' : provided.backgroundColor,
    color: state.isSelected ? 'white' : state.isFocused ? 'black' : provided.color,
    '&:hover': {
      backgroundColor: state.isSelected ? '#137E59' : '#D3D3D3',
      color: state.isSelected ? 'white' : 'black'
    }
  })
}; //merge conflicts resolved

