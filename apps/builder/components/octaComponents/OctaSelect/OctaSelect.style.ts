import styled from 'styled-components'
import { MdOutlineExpandMore } from 'react-icons/md'
import OctaInput from '../OctaInput/OctaInput'

export const OptionGroup = styled.ul`
  display: none;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  z-index: 999999;
  top: -1000px;
  height: 0px;
  overflow: hidden;
  overflow-y: auto;
  transition: height ease-in-out 0.5s;
  background: #fff;
  padding: 5px;
  width: 100%;
  border: 1px solid #c4c7cf;
  border-radius: 3px;
  left: 0;
  &.opened {
    display: flex;
    top: 44px;
    min-height: 250px;
    max-height: 300px;
    position: fixed;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #c4c7cf;
  }
  hr {
    &:first-child {
      display: none;
    }
  }
`
export const OptionItem = styled.li`
  font-size: 0.85rem;
  color: black;
  padding: 5px;
  font-family: 'Noto Sans';
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
  &[data-isTitle] {
    font-weight: bold;
  }
  &[data-disabled] {
    &:hover {
      background-color: transparent;
    }
  }
  &.actived {
    background-color: rgb(19, 102, 201);
    color: white;
  }

  &.actived button {
    color: black;
  }

  &.isTitle {
    color: #bebebe;
  }
`

export const Separator = styled.hr`
  margin: 5px 0px;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 50px;
  padding: 15px 10px 10px 10px;
  position: relative;
  border: 1px solid #c4c7cf;
  border-radius: 6px;
  font-size: 0.8rem;
`

export const DropDownIcon = styled(MdOutlineExpandMore)`
  color: #c4c7cf;
  position: absolute;
  right: 10px;
  top: 12px;
  font-size: 1.5rem;
`

export const InputSearch = styled(OctaInput)`
  border: none !important;
  width: 90%;
  height: 28px !important;
  position: absolute;
  top: 0;
  left: 0;
`
