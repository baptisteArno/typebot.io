import React from 'react'

export const TypingBubble = (): JSX.Element => (
  <div className="flex items-center">
    <div className="w-2 h-2 mr-1 rounded-full bubble1" />
    <div className="w-2 h-2 mr-1 rounded-full bubble2" />
    <div className="w-2 h-2 rounded-full bubble3" />
  </div>
)
