import React from 'react'

export const DefaultAvatar = (): JSX.Element => {
  return (
    <figure
      className={
        'flex justify-center items-center rounded-full text-white w-6 h-6 text-sm relative xs:w-10 xs:h-10 xs:text-xl'
      }
      data-testid="default-avatar"
    >
      <svg
        width="75"
        height="75"
        viewBox="0 0 75 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={
          'absolute top-0 left-0 w-6 h-6 xs:w-full xs:h-full xs:text-xl'
        }
      >
        <mask id="mask0" x="0" y="0" mask-type="alpha">
          <circle cx="37.5" cy="37.5" r="37.5" fill="#0042DA" />
        </mask>
        <g mask="url(#mask0)">
          <rect x="-30" y="-43" width="131" height="154" fill="#0042DA" />
          <rect
            x="2.50413"
            y="120.333"
            width="81.5597"
            height="86.4577"
            rx="2.5"
            transform="rotate(-52.6423 2.50413 120.333)"
            stroke="#FED23D"
            strokeWidth="5"
          />
          <circle cx="76.5" cy="-1.5" r="29" stroke="#FF8E20" strokeWidth="5" />
          <path
            d="M-49.8224 22L-15.5 -40.7879L18.8224 22H-49.8224Z"
            stroke="#F7F8FF"
            strokeWidth="5"
          />
        </g>
      </svg>
    </figure>
  )
}
