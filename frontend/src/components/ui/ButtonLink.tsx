import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { buttonClasses, type Size, type Variant } from './buttonStyles'

type ButtonLinkProps = LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode }

/** A router link styled as a button (for navigation, not actions). */
export function ButtonLink({ variant, size, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, typeof className === 'string' ? className : undefined)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
