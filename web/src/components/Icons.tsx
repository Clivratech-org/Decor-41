"use client";

import {
  Search,
  ShoppingCart,
  Menu,
  X,
  MessageCircle,
  Plus,
  Filter,
  Star,
  LogIn,
  LogOut,
  User,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

const s = { width: 18, height: 18, strokeWidth: 1.75 } as const;

export const Icon = {
  Search: (p?: { size?: number }) => <Search {...s} width={p?.size || 18} height={p?.size || 18} />,
  Cart: (p?: { size?: number }) => <ShoppingCart {...s} width={p?.size || 18} height={p?.size || 18} />,
  Menu: (p?: { size?: number }) => <Menu {...s} width={p?.size || 18} height={p?.size || 18} />,
  Close: (p?: { size?: number }) => <X {...s} width={p?.size || 18} height={p?.size || 18} />,
  WhatsApp: (p?: { size?: number }) => <MessageCircle {...s} width={p?.size || 18} height={p?.size || 18} />,
  Plus: (p?: { size?: number }) => <Plus {...s} width={p?.size || 18} height={p?.size || 18} />,
  Filter: (p?: { size?: number }) => <SlidersHorizontal {...s} width={p?.size || 18} height={p?.size || 18} />,
  FilterAlt: (p?: { size?: number }) => <Filter {...s} width={p?.size || 18} height={p?.size || 18} />,
  Star: (p?: { size?: number }) => <Star {...s} width={p?.size || 18} height={p?.size || 18} />,
  Login: (p?: { size?: number }) => <LogIn {...s} width={p?.size || 18} height={p?.size || 18} />,
  Logout: (p?: { size?: number }) => <LogOut {...s} width={p?.size || 18} height={p?.size || 18} />,
  User: (p?: { size?: number }) => <User {...s} width={p?.size || 18} height={p?.size || 18} />,
  ChevronDown: (p?: { size?: number }) => <ChevronDown {...s} width={p?.size || 18} height={p?.size || 18} />,
};
