// Importing necessary modules from React and custom components
import React, { useState } from 'react';
import LoadingDots from './LoadingDots'
import { useCustomTranslation } from "../../utils/useTranlsation";

// Define the Props type for the Button component
type Props = {
  onClick: () => void;
  isNormalState?: boolean;
  buttonText: string;
  style?: number
  extraClasses?: string;
};

// Button component definition
const Button: React.FC<Props> = ({ onClick, isNormalState = true, buttonText, style = 0, extraClasses }) => {
  // State to manage loading indicator
  const [loading, setLoading] = useState(false);

  // Click handler for the button
  const handleClick = () => {
    setLoading(true); // Set loading to true when button is clicked
    onClick(); // Call the onClick function passed as a prop

  };

  // Function to determine the button style based on the style prop
  const getButtonStyle = (styleNumber: number) => {
    switch (styleNumber) {
      case 0:
        return 'bg-indigo-600 hover:bg-indigo-500 text-white';
      case 1:
        return 'bg-white text-gray-900 hover:bg-gray-50';
    }
  };

  const { t } = useCustomTranslation();

  // Render the button
  return (
    <button
      type="button"
      onClick={handleClick} // Call handleClick when button is clicked
      disabled={loading && !isNormalState} // Disable the button when loading and not in normal state
      className={`rounded-full px-3.5 py-2 min-h-12 min-w text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 ${getButtonStyle(style)
        } ${extraClasses}`} // Use dynamic classes
    >
      {/* Display LoadingDots component if loading, otherwise display the buttonText */}
      {loading && !isNormalState ? <LoadingDots /> : t(buttonText)}
    </button>
  );
};

// Export the Button component
export default Button;
