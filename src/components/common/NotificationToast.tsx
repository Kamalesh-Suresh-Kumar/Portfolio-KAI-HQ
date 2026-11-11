import { useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { useExperienceEngine } from "../../experience-engine";
import "./notification-toast.css";

export type NotificationType = "success" | "failure" | "warning";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationToastProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function NotificationToast({
  notification,
  onDismiss,
  autoDismissMs = 5000,
}: NotificationToastProps) {
  const { reducedMotion } = useExperienceEngine();

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [notification, onDismiss, autoDismissMs]);

  if (!notification) return null;

  const isSuccess = notification.type === "success";
  const isFailure = notification.type === "failure";
  const isWarning = notification.type === "warning";

  return (
    <div
      className={`kai-toast-container ${reducedMotion ? "reduced-motion" : ""}`}
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      aria-atomic="true"
    >
      <div className={`kai-toast kai-toast-${notification.type}`}>
        <div className="kai-toast-icon">
          {isSuccess && <CheckCircle2 size={18} color="#22c55e" />}
          {isFailure && <AlertCircle size={18} color="#ef4444" />}
          {isWarning && <AlertTriangle size={18} color="#f59e0b" />}
        </div>

        <div className="kai-toast-content">
          <strong className="kai-toast-title">{notification.title}</strong>
          <span className="kai-toast-msg">{notification.message}</span>
        </div>

        <button
          type="button"
          className="kai-toast-close"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
