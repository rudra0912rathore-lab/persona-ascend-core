import type { ComponentType, ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-aurora text-primary-foreground shadow-elegant">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
