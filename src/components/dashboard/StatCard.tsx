import type { ReactNode } from "react";
interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string;
}
export default function StatCard({
    icon,
    label,
    value,
}: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-icon">
                {icon}
            </div>
            <div className="stat-content">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
}