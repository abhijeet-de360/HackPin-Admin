import { toast as sonnerToast } from "sonner";
import { sessionService } from "../_session";
import { localService } from "../_session/local";


export const errorHandler = async (res) => {
  if (res.status === 401) {
    sessionService.clearAll();
    localService.clearAll();
    window.location.href = "/";
  }

  const message = Array.isArray(res.data.message)
    ? res.data.message[0]
    : res.data.message;
  sonnerToast.error(message, { duration: 700 });

};

export const successHandler = async (msg) => {

  sonnerToast.success(msg, { duration: 700 });

};

export const warningHandler = async (msg) => {
  sonnerToast.warning(msg, { duration: 700 });

};
