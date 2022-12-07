import styled from 'styled-components';
import InputMask from 'react-input-mask'

export const Container = styled.div`
  font-family: 'Poppins';
  display: flex;
  flex-direction: column;
  width: 100%;

  .input-label{
    color: #777;
    font-size: .8rem;
    padding: 6px;
  }

  input {
    width: calc(100% - 22px);
    padding: 10px;
    height: 32px;
    border-radius: 5px;
    font-family: 'Poppins', sans-serif;
    font-size: .8rem;
    color: #777;
    border: 1px solid #c2c2c2;
    box-sizing: content-box;
    font-weight: 400;
    line-height: 1.1876em;
    letter-spacing: 0.00938em;
    background: none;
    webkit-tap-highlight-color: transparent;

    &:focus {
      outline-color: rgb(19, 102, 201);
      border: 2px solid rgb(19, 102, 201);
    }
  }
`;

export const InputMasked = styled(InputMask)`
  width: calc(100% - 22px);
  padding: 10px;
  height: 32px;
  border-radius: 5px;
  font-family: 'Poppins', sans-serif;
  font-size: .8rem;
  color: #777;
  border: 1px solid #c2c2c2;
  box-sizing: content-box;
  font-weight: 400;
  line-height: 1.1876em;
  letter-spacing: 0.00938em;
  background: none;
  webkit-tap-highlight-color: transparent;

  &:focus {
    outline-color: rgb(19, 102, 201);
    border: 2px solid rgb(19, 102, 201);
  }
`;

export const Error = styled.div`
  color: #E30D17;
  display: block;
  font-family: 'Roboto', sans-serif;
  font-size: .78rem;
`;