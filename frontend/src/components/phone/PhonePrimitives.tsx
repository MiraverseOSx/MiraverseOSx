import React, { useEffect, useState } from "react";
import { BatteryFull, Palette, Signal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePhonePreferences } from "../../store/usePhonePreferences";
import { isPhoneThemeId, PHONE_THEMES } from "./themes";
import "../../styles/phone/phone.css";

export function PhoneSurface({
  device = false,
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { device?: boolean }) {
  const themeId = usePhonePreferences((state) => state.themeId);
  return (
    <section
      {...props}
      data-phone-theme={themeId}
      className={`phone-theme ${device ? "phone-device" : "phone-console"} ${className}`}
    >
      {children}
    </section>
  );
}

export function PhonePanel({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`phone-panel ${className}`} />;
}

export function PhoneButton({
  tone = "neutral",
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "neutral" | "primary" | "success" | "danger";
}) {
  return (
    <button
      {...props}
      type={type}
      className={`phone-button phone-button--${tone} ${className}`}
    />
  );
}

export function PhoneThemePicker() {
  const themeId = usePhonePreferences((state) => state.themeId);
  const setPhoneTheme = usePhonePreferences((state) => state.setPhoneTheme);
  return (
    <label className="phone-theme-picker">
      <Palette size={15} aria-hidden="true" />
      <span>Theme</span>
      <select
        aria-label="Phone theme"
        value={themeId}
        onChange={(event) => {
          if (isPhoneThemeId(event.target.value))
            setPhoneTheme(event.target.value);
        }}
      >
        {PHONE_THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PhoneTabs<T extends string>({
  value,
  onChange,
  items,
  label = "Phone sections",
}: {
  value: T;
  onChange: (id: T) => void;
  items: { id: T; label: string; icon?: LucideIcon }[];
  label?: string;
}) {
  return (
    <nav className="phone-tabs" aria-label={label}>
      {items.map(({ id, label: title, icon: Icon }) => (
        <PhoneButton
          key={id}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {Icon && <Icon size={16} aria-hidden="true" />}
          <span>{title}</span>
        </PhoneButton>
      ))}
    </nav>
  );
}

export function PhoneAppButton({
  icon: Icon,
  label,
  badge,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  badge?: number;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`phone-app ${danger ? "phone-app--danger" : ""}`}
      onClick={onClick}
      aria-label={`Open ${label}`}
    >
      <span className="phone-app-icon">
        <Icon size={22} aria-hidden="true" />
        {badge != null && badge > 0 && (
          <span className="phone-app-badge">{badge}</span>
        )}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function PhoneStatusBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="phone-status">
      <time dateTime={now.toISOString()}>
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </time>
      <span className="phone-speaker" aria-hidden="true" />
      <span aria-label="5G signal, battery full">
        <Signal size={13} />
        5G
        <BatteryFull size={17} />
      </span>
    </div>
  );
}
