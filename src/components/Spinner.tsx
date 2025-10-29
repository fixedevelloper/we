import React from 'react'

type SpinnerProps = {
  tag?: React.ElementType;
  className?: string;
  size?: "lg" | "md" | "sm";
  type?: "bordered" | "grow" | "border";
  color?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

const Spinner = ({
                   tag: Tag = "div",
                   type = "bordered",
                   className = "",
                   color = "primary",
                   size = "md",
                   children,
                   style = {},
                 }: SpinnerProps) => {
  const spinnerClass =
      type === "bordered"
          ? "spinner-border"
          : type === "grow"
          ? "spinner-grow"
          : "spinner-border";

  const sizeClass = size === "sm" ? "spinner-border-sm" : size === "lg" ? "spinner-border-lg" : "";

  return (
      <Tag
          role="status"
          style={style}
          className={`${spinnerClass} text-${color} ${sizeClass} ${className}`}
      >
        {children}
      </Tag>
  );
};

export default Spinner;
