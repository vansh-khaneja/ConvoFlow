import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#18181b] group-[.toaster]:text-[var(--foreground)] group-[.toaster]:border group-[.toaster]:border-[#3f3f46] group-[.toaster]:shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-[.toaster]:rounded-[5px] group-[.toaster]:backdrop-blur-sm group-[.toaster]:p-4",
          description: "group-[.toast]:text-[#a1a1aa] group-[.toast]:text-sm group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-[#8b5cf6] group-[.toast]:text-white group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-[#7c3aed] group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-[#27272a] group-[.toast]:text-[#a1a1aa] group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:hover:bg-[#3f3f46] group-[.toast]:transition-colors",
          success:
            "group-[.toast]:bg-[#18181b] group-[.toast]:border-l-[3px] group-[.toast]:border-l-[#10b981] group-[.toast]:border-[#3f3f46] group-[.toast]:text-[var(--foreground)]",
          error:
            "group-[.toast]:bg-[#18181b] group-[.toast]:border-l-[3px] group-[.toast]:border-l-[#ef4444] group-[.toast]:border-[#3f3f46] group-[.toast]:text-[var(--foreground)]",
          warning:
            "group-[.toast]:bg-[#18181b] group-[.toast]:border-l-[3px] group-[.toast]:border-l-[#f59e0b] group-[.toast]:border-[#3f3f46] group-[.toast]:text-[var(--foreground)]",
          info:
            "group-[.toast]:bg-[#18181b] group-[.toast]:border-l-[3px] group-[.toast]:border-l-[#3b82f6] group-[.toast]:border-[#3f3f46] group-[.toast]:text-[var(--foreground)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
