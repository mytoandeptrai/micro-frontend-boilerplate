import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/team", label: "Team" },
  { to: "/monitor", label: "Monitor" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <nav className="flex w-52 flex-col gap-1 border-r border-border bg-card p-3">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `rounded px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
