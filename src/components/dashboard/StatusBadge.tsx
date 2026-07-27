interface StatusBadgeProps {
    status: "ONLINE" | "OFFLINE" | "ACTIVE" | "IDLE";
}
export default function StatusBadge({
    status,
}: StatusBadgeProps) {
    return (
        <span
            className={`status-badge ${status.toLowerCase()}`}
        >
            ● {status}
        </span>
    );
}