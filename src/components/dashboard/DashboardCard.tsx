import type { ReactNode } from "react";
interface DashboardCardProps {
    title?: string;
    children: ReactNode;
    className?: string;
}
export default function DashboardCard({
    title,
    children,
    className = "",
}: DashboardCardProps) {
    return (
        <section className={`dashboard-card ${className}`}>
            {title && (
                <div className="dashboard-card-header">
                    <h3>{title}</h3>
                </div>
            )}
            <div className="dashboard-card-body">
                {children}
            </div>
        </section>
    );
}