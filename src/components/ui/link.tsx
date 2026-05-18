import { createLink } from "@tanstack/react-router";
import clsx from "clsx";

import { buttonVariants } from "@/components/ui/button";

import type { LinkComponent } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes } from "react";

const BasicLink = ({
  variant,
  size,
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & VariantProps<typeof buttonVariants>) => (
  <a className={clsx(buttonVariants({ variant, size }), className)} {...rest} />
);

const CreatedLink = createLink(BasicLink);

const Link: LinkComponent<typeof BasicLink> = (props) => (
  <CreatedLink preload="intent" {...props} />
);

export default Link;
