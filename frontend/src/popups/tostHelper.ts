// toastHelper.ts
import { Slide, toast } from "react-toastify";

type ToastType = "success" | "error";

export const showToast = (
  message: string,
  type: ToastType = "success"
): void => {
  const options = {
    position: "top-center" as const,
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored" as const,
    transition: Slide,
  };

  if (type === "success") {
    toast.success(message, options);
  } else if (type === "error") {
    toast.error(message, options);
  }
};
