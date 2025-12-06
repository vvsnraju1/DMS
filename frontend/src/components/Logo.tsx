import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtext?: boolean;
  variant?: 'default' | 'white' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  showSubtext = false,
  variant = 'default',
  className = ''
}) => {
  const sizes = {
    xs: { icon: 'w-6 h-6', iconText: 'text-sm', text: 'text-lg', subtext: 'text-[10px]' },
    sm: { icon: 'w-8 h-8', iconText: 'text-base', text: 'text-xl', subtext: 'text-xs' },
    md: { icon: 'w-10 h-10', iconText: 'text-lg', text: 'text-2xl', subtext: 'text-xs' },
    lg: { icon: 'w-14 h-14', iconText: 'text-2xl', text: 'text-3xl', subtext: 'text-sm' },
    xl: { icon: 'w-20 h-20', iconText: 'text-4xl', text: 'text-5xl', subtext: 'text-base' },
  };

  const variants = {
    default: {
      iconBg: 'bg-gradient-to-br from-primary-600 via-brand-500 to-accent-500',
      iconText: 'text-white',
      text: 'bg-gradient-to-r from-primary-600 via-brand-500 to-primary-700 bg-clip-text text-transparent',
      subtext: 'text-gray-500',
    },
    white: {
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconText: 'text-white',
      text: 'text-white',
      subtext: 'text-white/70',
    },
    dark: {
      iconBg: 'bg-gray-900',
      iconText: 'text-white',
      text: 'text-gray-900',
      subtext: 'text-gray-500',
    },
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className={`${sizeConfig.icon} rounded-xl ${variantConfig.iconBg} flex items-center justify-center shadow-lg shadow-primary-500/25`}
      >
        <span className={`${variantConfig.iconText} font-display font-bold ${sizeConfig.iconText}`}>
          Q
        </span>
      </div>
      {showText && (
        <div>
          <h1 className={`${sizeConfig.text} font-display font-bold tracking-tight ${variantConfig.text}`}>
            Q-Docs
          </h1>
          {showSubtext && (
            <p className={`${sizeConfig.subtext} font-medium ${variantConfig.subtext} -mt-0.5`}>
              Document Management
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;

