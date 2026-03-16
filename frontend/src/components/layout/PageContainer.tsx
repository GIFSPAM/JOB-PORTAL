import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidthClass?: string;
  contentClassName?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidthClass = 'max-w-6xl',
  contentClassName = 'space-y-8',
}) => {
  return (
    <section className="pt-28 pb-16 px-6 min-h-screen">
      <div className={`${maxWidthClass} mx-auto ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
};
