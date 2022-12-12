import styled from 'styled-components';
import OctaButton from 'components/octaComponents/OctaButton/OctaButton';

export const Container = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans', sans-serif;
`;

export const OrText = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: center;
  justify-content: center;
  font-size: .8rem;
  color: #9e9e9e;
  margin-top: 15px;

  &::before{
    content: "";
    width: 40%;
    height: 1px;
    position: absolute;
    background-color: #9e9e9e;
    top: 15px;
    left: 0;
  }

  &::after{
    content: "";
    width: 40%;
    height: 1px;
    position: absolute;
    background-color: #9e9e9e;
    top: 15px;
    right: 0;
  }
`;

export const FormField = styled.div`
  width: 100%;
  height: 80px;
`;

export const LabelField = styled.div`
  padding: 15px 0;
  font-size: .8rem;
`;

export const FormFieldRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: roww;
  height: 50px;
`;

export const ButtonOption = styled(OctaButton)`
  background: #fff;
  color: rgb(19, 102, 201);
  padding: 5px;
  font-size: .8rem;
  height: 40px;
  margin: 0 5px;

  &.active{
    border: 2px solid rgb(19, 102, 201);
    background: rgb(19, 102, 201);
    color: #fff;
  }
`;