import {
  toast,
} from "@/components/ui/toast";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Re-export the toast function
export { toast };
// Re-export the types
export type { ToastProps, ToastActionElement };

// Use the custom useToast hook from the component
export { useToast } from "@/components/ui/toast";
