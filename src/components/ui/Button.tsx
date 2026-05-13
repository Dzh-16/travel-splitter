import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm',
    secondary:
      'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
  };

  const sizes: Record<string, string> = {
    sm: 'h-9 px-3 text-sm gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
