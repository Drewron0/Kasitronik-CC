import type { ScrollRevealProps } from "../interfaces/scroll-reveal-props.interface";

export default function ScrollReveal({
  children,
  className = "",
}: ScrollRevealProps) {
  return (
    <div className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}
