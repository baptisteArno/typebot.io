import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import useOuterClick from 'hooks/useOuterClick'
import {
  Container,
  OptionGroup,
  OptionItem,
  DropDownIcon,
  InputSearch,
} from './OctaSelect.style'
import { OctaSelectProps, OptionProps } from './OctaSelect.type'
import { Button, useModalContext } from '@chakra-ui/react'
import { EditIcon } from 'assets/icons'
import { DeleteIcon } from '@chakra-ui/icons'

export enum SELECT_ACTION {
  DELETE = 'DELETE',
  EDIT = 'EDIT',
}

const Option = ({
  value,
  children,
  optionKey,
  isTitle,
  disabled,
  onClick,
  selected,
  showEdit,
  showDelete,
  onIconClicked,
}: OptionProps) => {
  const hasActionToClick = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>
  ): void => {
    if (!isTitle && !disabled && onClick) {
      onClick(e)
    }
  }

  return (
    <OptionItem
      key={optionKey}
      data-value={value}
      data-istitle={isTitle}
      onClick={hasActionToClick}
      className={`${children === selected?.label ? 'actived' : ''} ${
        isTitle ? 'isTitle' : ''
      } ${!!isTitle || disabled ? 'disabled' : ''}`}
    >
      <>
        {children}
        {showDelete && !isTitle && (
          <Button
            size="xs"
            onClick={(e) => {
              if (onIconClicked) onIconClicked(value, SELECT_ACTION.DELETE)
              e.stopPropagation()
            }}
            float={'right'}
          >
            <DeleteIcon />
          </Button>
        )}
        {showEdit && !isTitle && (
          <Button
            size="xs"
            onMouseOver={(e) => e.stopPropagation()}
            onClick={(e) => {
              if (onIconClicked) onIconClicked(value, SELECT_ACTION.EDIT)
              e.stopPropagation()
            }}
            float={'right'}
          >
            <EditIcon />
          </Button>
        )}
      </>
    </OptionItem>
  )
}

const OctaSelect = (props: OctaSelectProps) => {
  const [toggle, setToggle] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>()
  const { ref, isComponentVisible, setIsComponentVisible } =
    useOuterClick(toggle)
  const [search, setSearch] = useState<string>()
  const { dialogRef } = useModalContext()

  const allOptions = useMemo(() => props.options, [props.options])

  useLayoutEffect(() => {
    setIsComponentVisible(toggle)
  }, [toggle, setIsComponentVisible])

  useEffect(() => {
    const settingsModal = dialogRef?.current?.querySelector(
      '#settings-modal'
    ) as HTMLElement
    if (!settingsModal) return

    if (isComponentVisible) {
      settingsModal.style.overflow = 'hidden'

      return
    }
    settingsModal.style.overflow = 'auto'
  }, [dialogRef, isComponentVisible])

  useEffect(() => {
    if (props.defaultSelected) {
      const newSelected =
        allOptions?.find(
          (s) => (s?.value?.id || s?.value) === props.defaultSelected
        ) || props.defaultSelected
      setSelected(newSelected)
    } else {
      setSelected('')
    }
  }, [props.defaultSelected, props.options])

  const openToTopOrDown = () => {
    let top = ''
    if (!ref.current) return
    const containerRect = ref.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const optionGroupHeight = 250
    if (containerRect.bottom + optionGroupHeight <= viewportHeight) {
      top = `${ref.current.getBoundingClientRect().bottom}px` ?? '0px'
    } else {
      top =
        `${ref.current.getBoundingClientRect().top - optionGroupHeight}px` ??
        '0px'
    }

    return {
      top,
      left: `${ref.current.getBoundingClientRect().left}px` ?? '0px',
      width: `${ref.current.getBoundingClientRect().width}px` ?? '100%',
    }
  }

  const handleToggle = (): void => {
    setToggle((e) => !e)
    setSearch('')
  }

  const handleChangeFind = (value: any): void => {
    setSearch(value.label)
    setSelected(value)
    if (props?.onChange) props.onChange(value.value, value)
  }

  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target
    setSearch(value)
  }

  const getOptions = useCallback(() => {
    if (!allOptions) {
      return []
    }
    return allOptions?.filter((option) => {
      return (
        option?.label
          .toLocaleLowerCase()
          .indexOf(search ? search.toLocaleLowerCase() : '') >= 0
      )
    })
  }, [allOptions, search])

  return (
    <>
      <Container
        ref={ref}
        onClick={handleToggle}
        style={{ width: '100%', ...props }}
      >
        <>
          {!selected && !props.findable && props.placeholder}
          {selected && !props.findable && selected.label}
          {props.findable && (
            <InputSearch
              placeholder={selected ? selected.label : props.placeholder}
              defaultValue={selected && selected.label ? selected.label : ''}
              value={search}
              onChange={handleSearch}
            />
          )}
          <DropDownIcon />
        </>
      </Container>
      <OptionGroup
        className={toggle && isComponentVisible ? 'opened' : ''}
        {...(props as any)}
        style={openToTopOrDown()}
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
              showEdit={props.showEdit}
              showDelete={props.showDelete}
              onIconClicked={props.onIconClicked}
            >
              {option.label}
            </Option>
          ))}
        </>
      </OptionGroup>
    </>
  )
}

export default OctaSelect
