"use client"

import * as React from "react"
import { cn } from "cn"
import { Dialog as DialogPrimitive } from "radix-ui"

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fade-in fixed inset-0 z-50 bg-[oklch(0.2_0.01_60/0.3)]"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "dialog-in fixed inset-x-4 top-[12vh] z-50 mx-auto max-w-[640px] overflow-hidden rounded-[18px] border border-border bg-surface text-text outline-none",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={className} {...props} />
}

export { Dialog, DialogContent, DialogTitle }
