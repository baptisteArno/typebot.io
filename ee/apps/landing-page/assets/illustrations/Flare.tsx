import { Icon, IconProps } from '@chakra-ui/react'
import React from 'react'

export const Flare = (props: IconProps & { color: 'blue' | 'orange' }) => (
  <Icon
    boxSize="600px"
    viewBox="0 0 1381 1078"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_f_46_23)">
      <rect
        x="859.42"
        y="335"
        width="102.662"
        height="676.089"
        rx="51.3311"
        transform="rotate(50.5977 859.42 335)"
        fill={props.color === 'blue' ? '#0042DA' : '#FF8B1A'}
        fillOpacity="0.28"
      />
    </g>
    <g filter="url(#filter1_f_46_23)">
      <rect
        x="956.42"
        y="414"
        width="95.6649"
        height="676.089"
        rx="47.8325"
        transform="rotate(50.5977 956.42 414)"
        fill={props.color === 'blue' ? '#0042DA' : '#FF8B1A'}
        fillOpacity="0.28"
      />
    </g>
    <g filter="url(#filter2_f_46_23)">
      <rect
        x="706.42"
        y="563"
        width="81.7068"
        height="676.089"
        rx="40.8534"
        transform="rotate(50.5977 706.42 563)"
        fill={props.color === 'blue' ? '#0042DA' : '#FF8B1A'}
        fillOpacity="0.28"
      />
    </g>
    <g filter="url(#filter3_f_46_23)">
      <rect
        x="1145.42"
        y="184"
        width="81.7068"
        height="676.089"
        rx="40.8534"
        transform="rotate(50.5977 1145.42 184)"
        fill={props.color === 'blue' ? '#0042DA' : '#FF8B1A'}
        fillOpacity="0.28"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_46_23"
        x="157.915"
        y="155.914"
        width="945.757"
        height="866.654"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="100"
          result="effect1_foregroundBlur_46_23"
        />
      </filter>
      <filter
        id="filter1_f_46_23"
        x="253.489"
        y="233.489"
        width="944.166"
        height="864.099"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="100"
          result="effect1_foregroundBlur_46_23"
        />
      </filter>
      <filter
        id="filter2_f_46_23"
        x="0.645386"
        y="379.645"
        width="940.993"
        height="859"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="100"
          result="effect1_foregroundBlur_46_23"
        />
      </filter>
      <filter
        id="filter3_f_46_23"
        x="439.646"
        y="0.645264"
        width="940.993"
        height="859"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="100"
          result="effect1_foregroundBlur_46_23"
        />
      </filter>
    </defs>
  </Icon>
)
