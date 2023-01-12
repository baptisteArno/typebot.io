import React from 'react';
import Image from "next/future/image";
import { LoadingContainer } from './OctaLoading.style';

import LoadingImage from '../../../assets/loading.gif';

type Props = {}

const OctaLoading = (props: Props) => {
  return (
    <LoadingContainer>
      <Image src={LoadingImage} />
    </LoadingContainer>
  )
}

export default OctaLoading