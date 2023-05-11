import React, { ChangeEvent, Ref, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import useOuterClick from 'hooks/useOuterClick'
import {
  Container,
  OptionGroup,
  OptionItem,
  DropDownIcon,
  Separator,
  InputSearch,
} from './OctaSelect.style'
import { OctaSelectProps, OptionProps } from './OctaSelect.type';

const Option = ({ value, children, optionKey, isTitle, disabled, onClick, selected }: OptionProps) => {
  const hasActionToClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>): void => {
    if ((!isTitle && !disabled) && onClick) {
      onClick(e)
    }
  }
  return (
    <OptionItem
      key={optionKey}
      data-value={value}
      data-istitle={isTitle}
      data-disabled={!!isTitle || disabled}
      onClick={hasActionToClick}
      className={`${value === selected ? "actived" : ""} ${isTitle ? "isTitle" : ""}`}
    >
      <>{children}</>
    </OptionItem>
  )
}

const OctaSelect = (props: OctaSelectProps) => {
  const [toggle, setToggle] = useState<boolean>(false);
  const [selected, setSelected] = useState<any>();
  const { ref, isComponentVisible, setIsComponentVisible } = useOuterClick(toggle);
  const [search, setSearch] = useState<string>();

  const allOptions = useMemo(() => (props.options), [props.options]);

  useLayoutEffect(() => {
    setIsComponentVisible(toggle)
  }, [toggle, setIsComponentVisible])

  useEffect(() => {
    if (props.defaultSelected) {
      console.log('octaSelect', props.defaultSelected)
      setSelected(props.defaultSelected);
    }
  }, [props.defaultSelected])

  const handleToggle = (): void => {
    setToggle((e) => !e)
    setSearch('')
  }

  const handleChangeFind = (value: any): void => {
    setSearch(value.label);
    console.log('value', value)
    setSelected(value);
    props.onChange(value.value);
  }

  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setSearch(value);
  }

  const getOptions = useCallback(() => {
    if (!allOptions) {
      return [];
    }
    return allOptions.filter((option) => {
      return option.label.toLocaleLowerCase().indexOf(search ? search : "") >= 0
    });
  }, [allOptions, search])

  return (
    <Container ref={ref} onClick={handleToggle}>
      <>
        {(!selected && !props.findable) && props.placeholder}
        {(selected && !props.findable) && selected.label}
        {props.findable
          &&
          <InputSearch
            placeholder={selected ? selected.label : props.placeholder}
            defaultValue={selected && selected.label ? selected.label : ""}
            value={search}
            onChange={handleSearch}
          />
        }
        <OptionGroup
          className={toggle && isComponentVisible ? 'opened' : ''}
          {...(props as any)}
        >
          {props.label && props.label}
          <>
            {getOptions().map((option, id) => (
              <Option
                key={option.key}
                value={option.value}
                selected={selected}
                onClick={() => handleChangeFind(option)}
                isTitle={option.isTitle}
                disabled={option.disabled}
              >
                {option.label}
              </Option>
            ))}
          </>
        </OptionGroup>
        <DropDownIcon onClick={handleToggle} />
      </>
    </Container>
  )
}

export default OctaSelect;
