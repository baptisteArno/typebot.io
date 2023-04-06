import React, { useRef } from 'react';
import { Container, Error, InputMasked } from './OctaInput.style';
import { Props } from './OctaInput.type';

const OctaInput = (props: Props) => {
  const refs = useRef(null);
  return (
    <Container {...props as any}>
      {props.label && (
        <div className="input-label">
          {props.label}
        </div>
      )}
      {props.mask && <InputMasked {...props} mask={props.mask}  style={{ margin: 0 }} ref={refs} />}
      {!props.mask && <input {...props} style={{ margin: 0 }} />}
      {props.error && (
        <Error>
          {props.error}
        </Error>
      )}
    </Container>
  )
}

export default OctaInput;
