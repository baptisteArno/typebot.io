import OctaButton from 'components/octaComponents/OctaButton/OctaButton';
import styled from 'styled-components';

export const Title = styled.div`
  font-size: 1rem;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 500;
  padding-bottom: 15px;
`;

export const Description = styled.div`
  font-size: .8rem;
  font-family: 'Noto Sans', sans-serif;
  color: #9e9e9e;
  margin: 15px 0;
`;

export const Container = styled.div`
  width: 400px;
  display: block;
`;

export const ContainerCreate = styled.div`
  width: 400px;
  display: block;
`;

export const FormArea = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
  margin-bottom: 15px;
  font-size: .8rem;
  color: #9e9e9e;
  font-family: 'Noto Sans', sans-serif;
`;

export const Label = styled.label`
  font-size: .8rem;
  font-family: 'Noto Sans', sans-serif;
  color: #9e9e9e;
  margin: 15px 0;
`;

export const FormControl = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Options = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

export const OptionRadio = styled.div`
  width: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: .8rem;

  input[type=radio] {
    margin: 15px;
  }
`;

export const ButtonCreate = styled(OctaButton)`
  width: 100%;
  border: 2px solid rgb(19, 102, 201);
  background: rgb(19, 102, 201);
  padding: 10px;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 700;
  color: #fff;
  border-radius: 15px;
  margin: 15px 5px;
`;

export const ButtonCancel = styled(OctaButton)`
  background: #fff;
  color: rgb(19, 102, 201);
  width: 100%;
  padding: 10px;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 700;
  border-radius: 15px;
  margin: 15px 5px;
`;

export const ButtonDays = styled(OctaButton)`
  background: #fff;
  color: rgb(19, 102, 201);

  &.active{
    border: 2px solid rgb(19, 102, 201);
    background: rgb(19, 102, 201);
    color: #fff;
  }
`;


export const Toggle = styled.div`
display: flex;
margin: 15px 0;

input[type=checkbox]{
	height: 0;
	width: 0;
	visibility: hidden;
}

label {
	cursor: pointer;
	text-indent: -9999px;
	width: 45px;
	height: 20px;
	background: grey;
	display: block;
	border-radius: 100px;
	position: relative;
}

label:after {
	content: '';
	position: absolute;
	top: 5px;
	left: 5px;
	width: 10px;
	height: 10px;
	background: #fff;
	border-radius: 90px;
	transition: 0.3s;
}

input:checked + label {
	background: rgb(19, 102, 201);
}

input:checked + label:after {
	left: calc(100% - 5px);
	transform: translateX(-100%);
}

label:active:after {
	width: 45px;
}

.input-label{
  margin-left: 15px;
  font-weight: 500;
  font-family: 'Noto Sans', sans-serif;
  color: #999;
}
`;

export const HoursArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const HourDay = styled.div`
  padding-left: 15px;
  margin-top: 15px;
  font-size: .8rem;
  font-weight: bold;
`;

export const HoursRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const HoursPipe = styled.div`
  width: 30px;
  height: 45px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const HoursControl = styled.div`
  width: calc(50% - 30px);
  margin: 0 15px;
  display: flex;
  flex-direction: row;
`;
