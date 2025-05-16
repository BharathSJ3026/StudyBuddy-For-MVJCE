import React from 'react';
import { Book } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const sizeMap = {
  small: { icon: 'w-6 h-6', text: 'text-lg' },
  medium: { icon: 'w-8 h-8', text: 'text-xl' },
  large: { icon: 'w-10 h-10', text: 'text-2xl' },
};

const Logo: React.FC<LogoProps> = ({ size = 'medium', withText = true }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-1 flex items-center justify-center">
        <Book className={`text-white ${sizeMap[size].icon}`} />
      </div>
      {withText && (
        <span className={`font-bold ${sizeMap[size].text}`}>StudyBuddy</span>
      )}
    </div>
  );
};

export default Logo;