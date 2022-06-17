import React from 'react'

export const FlowToBot = ({ flow, bot }) => (
  <div className="flex">
    {flow}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="arrow-icon"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
    {bot}
  </div>
)
