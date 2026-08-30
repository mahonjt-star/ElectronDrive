import React from 'react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'default' | 'lg' | 'sm';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "btn-primary shadow-xl shadow-blue-500/20",
      secondary: "bg-white/5 text-[#E0E6ED] border border-white/10 hover:bg-white/10",
      outline: "border border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10",
      danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
      ghost: "hover:bg-white/5 text-white hover:text-white",
    };
    
    const sizes = {
      default: "h-14 px-6 py-2 text-lg",
      lg: "h-16 px-8 text-xl",
      sm: "h-12 px-4 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
