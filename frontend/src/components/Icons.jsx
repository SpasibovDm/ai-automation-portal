import React from "react";

const IconBase = ({ children, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const BotIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <path d="M9 7V5a3 3 0 016 0v2" />
    <circle cx="9" cy="13" r="1.5" />
    <circle cx="15" cy="13" r="1.5" />
  </IconBase>
);

export const BellIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M18 16H6c1.4-1.4 2-3.2 2-5v-1a4 4 0 118 0v1c0 1.8.6 3.6 2 5Z" />
    <path d="M9.5 19a2.5 2.5 0 005 0" />
  </IconBase>
);

export const ChevronDownIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M6 9l6 6 6-6" />
  </IconBase>
);

export const MenuIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </IconBase>
);

export const LayoutDashboardIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="5" rx="2" />
    <rect x="13" y="10" width="8" height="11" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
  </IconBase>
);

export const UsersIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="9" cy="9" r="3" />
    <circle cx="17" cy="10" r="2.5" />
    <path d="M4 19a5 5 0 0110 0" />
    <path d="M13.5 19a4 4 0 018 0" />
  </IconBase>
);

export const MailIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </IconBase>
);

export const FileTextIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1Z" />
    <path d="M14 3v5h5" />
    <path d="M8 13h8M8 17h6" />
  </IconBase>
);

export const LineChartIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M3 19h18" />
    <path d="M5 15l5-5 4 4 5-7" />
  </IconBase>
);

export const SettingsIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a2 2 0 01-4 0v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a2 2 0 010-4h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a2 2 0 112.8-2.8l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V4a2 2 0 014 0v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a2 2 0 112.8 2.8l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6H20a2 2 0 010 4h-.2a1 1 0 00-.9.6Z" />
  </IconBase>
);

export const SparklesIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M5 3l1.2 3L9 7l-2.8 1L5 11 3.8 8 1 7l2.8-1L5 3Z" />
    <path d="M16 4l1.4 3.6L21 9l-3.6 1.4L16 14l-1.4-3.6L11 9l3.6-1.4L16 4Z" />
    <path d="M9 14l1 2 2 .8-2 .8-1 2-.8-2-2-.8 2-.8.8-2Z" />
  </IconBase>
);

export const ClockIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </IconBase>
);

export const UserPlusIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="10" cy="8" r="3" />
    <path d="M4 19a6 6 0 0112 0" />
    <path d="M17 8h4M19 6v4" />
  </IconBase>
);

export const ReplyIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M10 7l-5 5 5 5" />
    <path d="M5 12h8a6 6 0 016 6" />
  </IconBase>
);

export const SendIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7Z" />
  </IconBase>
);

export const MessageSquareIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M21 14a2 2 0 01-2 2H8l-5 4V6a2 2 0 012-2h14a2 2 0 012 2Z" />
  </IconBase>
);

export const SearchIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </IconBase>
);

export const PaintbrushIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 14l7-7 3 3-7 7-4 1 1-4Z" />
    <path d="M13 7l4-4 3 3-4 4" />
  </IconBase>
);

export const ShieldIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z" />
  </IconBase>
);

export const ToggleLeftIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="3" y="7" width="18" height="10" rx="5" />
    <circle cx="8" cy="12" r="3" />
  </IconBase>
);

export const LogOutIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
    <path d="M13 5H7a2 2 0 00-2 2v10a2 2 0 002 2h6" />
  </IconBase>
);
