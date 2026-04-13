/**
 * Convert markdown bold syntax (**text**) to bold text with HTML <b> tags
 * @param {string} text - Raw text with markdown formatting
 * @returns {JSX.Element} - React element with bold formatting applied
 */
export const renderFormattedText = (text) => {
  if (!text) return '';

  // Split by ** and create elements
  const parts = text.split(/\*\*(.*?)\*\*/g);
  
  return (
    <>
      {parts.map((part, index) => {
        // Even indices are normal text, odd indices are bold text
        if (index % 2 === 1) {
          return <b key={index}>{part}</b>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};
