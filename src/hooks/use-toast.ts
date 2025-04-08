import {
  useToast as useToastOriginal,
  toast,
} from "@/components/ui/toast";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast.tsx";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const useToast = useToastOriginal;

export { useToast, toast };
export type { ToastProps, ToastActionElement };
