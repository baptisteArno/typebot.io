import useOuterClick from 'hooks/useOuterClick'
import React, { ChangeEvent, SyntheticEvent, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import OctaInput from '../OctaInput/OctaInput'
import {
  Container,
  OptionGroup,
  OptionItem,
  DropDownIcon,
  Separator,
} from './OctaSelect.style'
import { OctaSelectProps } from './OctaSelect.type'

const OctaSelect = (props: OctaSelectProps) => {
  const [toggle, setToggle] = useState<boolean>(false)
  const [selected, setSelected] = useState<{ value: any; label: string; }>()
  const { ref, isComponentVisible, setIsComponentVisible } =
    useOuterClick(toggle);

  const allOptions = useMemo(() => (props.items), [props.items])

  useLayoutEffect(() => {
    setIsComponentVisible(toggle)
  }, [toggle, setIsComponentVisible])

  useEffect(() => {
    if (props.defaultSelected) {
      setSelected(props.defaultSelected);
    }
  }, [props.defaultSelected])

  const handleSelect = (e: SyntheticEvent<HTMLLIElement>): void => {
    const dataValue = e.currentTarget.getAttribute('data-value')
    const dataLabel = e.currentTarget.getAttribute('data-label')
    const isTitle = e.currentTarget.getAttribute('data-istitle')
    if (dataValue && dataLabel) {
      props.onChange({
        value: dataValue,
        label: dataLabel,
      })
      if (!isTitle) {
        setSelected({ label: dataLabel, value: dataValue })
      }
      props.onChange({ label: dataLabel, value: dataValue })
    }
  }
  const handleToggle = (): void => {
    setToggle((e) => !e)
  }

  const handleChangeFind = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const find = allOptions.find((option) => option.label === value);
    console.log(find);
  }

  return (
    <Container ref={ref} onClick={handleToggle}>
      <>
        {!selected && props.placeholder}
        {selected && selected.label}
        <OptionGroup
          className={toggle && isComponentVisible ? 'opened' : ''}
          {...(props as any)}
        >
          {props.findable && <OctaInput placeholder='Buscar..' onChange={handleChangeFind}/>}
          {props.label && props.label}
          {allOptions.map((item, idx) => (
            <>
              {item && item?.isTitle && <Separator />}
              <OptionItem
                key={idx}
                data-value={item.value}
                data-label={item.label}
                data-istitle={item.isTitle}
                data-disabled={!!item.isTitle || item.disabled}
                onClick={handleSelect}
                className={item.label === selected?.label ? "actived" : ""}
              >
                {item.label}
              </OptionItem>
            </>
          ))}
        </OptionGroup>
        <DropDownIcon />
      </>
    </Container>
  )
}

export default OctaSelect
