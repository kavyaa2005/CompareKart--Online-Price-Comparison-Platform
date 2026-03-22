import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  color?: "blue" | "purple" | "green" | "orange" | "red";
}

const colorClasses = {
  blue: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
  purple: "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20",
  green: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20",
  orange: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  red: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
};

export function KPICard({ title, value, trend, icon: Icon, color = "blue" }: KPICardProps) {
  return (
    <div className="bg-[#0f1419] border border-[#252d3f] rounded-xl p-6 hover:border-[#2f3b52] transition-all shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <span className="text-sm font-medium text-[#94a3b8]">{title}</span>
        <div className={`p-2.5 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-semibold text-[#f8fafc] tracking-tight">{value}</div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend.isPositive ? "text-[#10b981]" : "text-[#ef4444]"}`}>
            <span>{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className = "", title, action }: CardProps) {
  return (
    <div className={`bg-[#0f1419] border border-[#252d3f] rounded-xl shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#252d3f]">
          <h3 className="text-base font-semibold text-[#f8fafc] tracking-tight">{title}</h3>
          {action}
        </div>
      )}
      <div className={title ? "p-8" : "p-8"}>{children}</div>
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md", 
  className = "" 
}: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0e1a] inline-flex items-center justify-center";
  
  const variantClasses = {
    primary: "bg-[#3b82f6] text-white hover:bg-[#2563eb] focus:ring-[#3b82f6]/50 shadow-sm",
    secondary: "bg-[#1a1f2e] text-[#f8fafc] hover:bg-[#252d3f] border border-[#2f3b52] shadow-sm",
    success: "bg-[#10b981] text-white hover:bg-[#059669] shadow-sm",
    danger: "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-sm",
    ghost: "text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-[#cbd5e1]",
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variantClasses = {
    success: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30",
    warning: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
    danger: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30",
    info: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30",
    default: "bg-[#64748b]/10 text-[#94a3b8] border-[#64748b]/30",
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: "blue" | "purple" | "green" | "orange" | "red";
  showValue?: boolean;
}

export function ProgressBar({ label, value, max = 100, color = "blue", showValue = true }: ProgressBarProps) {
  const percentage = (value / max) * 100;
  
  const colorClasses = {
    blue: "bg-[#3b82f6]",
    purple: "bg-[#8b5cf6]",
    green: "bg-[#10b981]",
    orange: "bg-[#f59e0b]",
    red: "bg-[#ef4444]",
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#94a3b8] font-medium">{label}</span>
        {showValue && <span className="text-[#f8fafc] font-semibold">{value}%</span>}
      </div>
      <div className="h-2.5 bg-[#1a1f2e] rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}