import React from "react";

export const Button = ({
                           variant = "primary",
                           children,
                           ...props
                       }: {
    variant?: "primary" | "outline";
    children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={`btn btn-${variant}`} {...props}>
        {children}
    </button>
);

export const Card = ({
                         children,
                         className = "",
                         ...props
                     }: {
    children: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`card ${className}`} {...props}>
        {children}
    </div>
);

export const FeatureCard = ({
                                title,
                                icon,
                                desc
                            }: {
    title: string;
    icon: string;
    desc: string;
}) => (
    <Card className="text-center">
        <div style={{ fontSize: "2rem", marginBottom: "var(--space)" }}>{icon}</div>
        <div style={{ fontWeight: 600, marginBottom: "var(--space)" }}>{title}</div>
        <div className="muted" style={{ fontSize: "14px" }}>{desc}</div>
    </Card>
);

export const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
    <div className="text-center muted" style={{ gridColumn: "1/-1" }}>{message}</div>
);

export const ErrorState = ({ message }: { message: string }) => (
    <div className="text-center error" style={{ gridColumn: "1/-1" }}>{message}</div>
);