import styled, { css } from 'styled-components'

interface TitleProps {
  sm?: boolean
}

export const Title = styled.h1<TitleProps>`
  font-size: 16px;
  font-weight: 700;
  font-family: 'Noto Sans';
  color: #303243;
  ${(props) =>
    props.sm &&
    css`
      font-size: 14px;
    `}
`

export const Description = styled.p`
  width: 100%;
  font-size: 12px;
  font-family: 'Noto Sans';
  color: #5a6377;
`
export const StepTitle = styled.h2`
  font-size: 14px;
  font-family: 'Noto Sans';
  font-weight: 400;
  color: #303243;
`
