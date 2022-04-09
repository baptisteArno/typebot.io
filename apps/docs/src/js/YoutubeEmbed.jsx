import React from 'react'

export const YoutubeEmbed = ({ videoId }) => (
  <iframe
    width="100%"
    height="500"
    src={
      videoId.startsWith('https')
        ? videoId
        : `https://www.youtube.com/embed/${videoId}`
    }
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style={{ borderRadius: '0.5rem' }}
  />
)
