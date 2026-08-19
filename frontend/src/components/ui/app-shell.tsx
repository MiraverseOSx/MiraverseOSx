import React from 'react';
import { Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface AppShellProps {
    children: React.ReactNode;
    className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
    return (
        <section className={twMerge('app-shell', className)}>
            {children}
        </section>
    );
}

export interface AppToolbarProps {
    icon?: React.ElementType;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export function AppToolbar({ icon: Icon, title, subtitle, actions, className }: AppToolbarProps) {
    return (
        <header className={twMerge('app-toolbar', className)}>
            <div className="flex min-w-0 items-center gap-3">
                {Icon && (
                    <span className="app-toolbar__icon" aria-hidden="true">
                        <Icon size={16} />
                    </span>
                )}
                <div className="min-w-0">
                    <h1 className="app-toolbar__title">{title}</h1>
                    {subtitle && <p className="app-toolbar__subtitle">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="app-toolbar__actions">{actions}</div>}
        </header>
    );
}

export interface AppSidebarProps {
    children: React.ReactNode;
    className?: string;
    label?: string;
}

export function AppSidebar({ children, className, label }: AppSidebarProps) {
    return (
        <aside className={twMerge('app-sidebar', className)} aria-label={label}>
            {children}
        </aside>
    );
}

export interface AppPaneProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export function AppPane({ children, className, as: Component = 'section' }: AppPaneProps) {
    return <Component className={twMerge('app-pane', className)}>{children}</Component>;
}

export interface PaneHeaderProps {
    title: React.ReactNode;
    meta?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export function PaneHeader({ title, meta, children, className }: PaneHeaderProps) {
    return (
        <div className={twMerge('app-pane-header', className)}>
            <div className="min-w-0">
                <h2 className="truncate text-xs font-bold uppercase tracking-[0.14em] text-slate-700">{title}</h2>
                {meta && <p className="mt-0.5 text-[11px] text-slate-500">{meta}</p>}
            </div>
            {children}
        </div>
    );
}

export interface SearchFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

export function SearchField({ value, onChange, placeholder = 'Search…', label = 'Search', className }: SearchFieldProps) {
    return (
        <label className={twMerge('app-search', className)}>
            <span className="sr-only">{label}</span>
            <Search size={14} aria-hidden="true" />
            <input value={value} onChange={onChange} placeholder={placeholder} />
        </label>
    );
}

export interface StatusBadgeProps {
    children: React.ReactNode;
    tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
    className?: string;
}

export function StatusBadge({ children, tone = 'neutral', className }: StatusBadgeProps) {
    return <span className={twMerge('app-status-badge', `app-status-badge--${tone}`, className)}>{children}</span>;
}

export interface EmptyStateProps {
    icon?: React.ElementType;
    title: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
    return (
        <div className={twMerge('app-empty-state', className)} role="status">
            {Icon && <Icon size={28} aria-hidden="true" />}
            <h3>{title}</h3>
            {description && <p>{description}</p>}
        </div>
    );
}
