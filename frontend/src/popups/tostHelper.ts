// toastHelper.ts
import { Slide, toast } from "react-toastify";

type ToastType = "success" | "error";

export const showToast = (
  message: string,
  type: ToastType = "success",
): void => {
  console.log("🔔 showToast called:", { message, type });

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
    console.log("✅ Toast success called");
  } else if (type === "error") {
    toast.error(message, options);
    console.log("❌ Toast error called");
  }
};
