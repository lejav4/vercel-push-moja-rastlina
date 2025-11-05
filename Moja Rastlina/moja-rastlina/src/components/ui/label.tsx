import * as React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = '', ...props }) => (
  <label className={`field-hint ${className}`} {...props} />
);

export default Label;


