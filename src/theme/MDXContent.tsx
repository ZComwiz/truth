import React from 'react';
import { AnimatedHeading } from '@site/src/components/AnimatedHeading/AnimatedHeading';

export function MDXContent(props) {
  const Component = props.as || 'div';
  
  const enhanceHeadings = (children) => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === 'h1') {
        return <AnimatedHeading children={child.props.children} />;
      }
      return child;
    });
  };

  return (
    <Component {...props}>
      {enhanceHeadings(props.children)}
    </Component>
  );
}

export default MDXContent; 