import React, { HTMLAttributes } from 'react';
import { Button } from "./OctaButton.style";

type Props = {
  children: string
} & HTMLAttributes<HTMLButtonElement>;

const OctaButton = (props: Props) => {
  return (
    <>
      <Button {...props}>
        {props.children}
      </Button>
    </>
  )
};

export default OctaButton;
