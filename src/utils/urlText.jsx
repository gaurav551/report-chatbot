import React from 'react';

export const UrlText = ({ text }) => {
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by URLs and create elements
  const parts = text.split(urlRegex);
  
  return (
    <p className="text-md whitespace-pre-wrap">
      {parts.map((part, index) => 
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
};