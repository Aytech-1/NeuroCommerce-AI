# NeuroCommerce AI — Next.js Frontend Engineering Blueprint

**Document Version:** 2.0  
**Date:** 2026-07-28  
**Author:** Principal Frontend Architect  
**Classification:** Internal — Frontend Architecture Reference  
**Status:** Approved for Development  
**Prerequisites:** SRS (96/100) ✓ | Enterprise Architecture (96/100) ✓ | REST API Specification (100/100) ✓

---

## Table of Contents

1. [Project Overview & Tech Stack](#1-project-overview--tech-stack)
2. [Complete Project Structure](#2-complete-project-structure)
3. [Design System & TailwindCSS Configuration](#3-design-system--tailwindcss-configuration)
4. [Component Library Architecture](#4-component-library-architecture)
5. [API Client Configuration](#5-api-client-configuration)
6. [State Management (TanStack Query & Zustand)](#6-state-management-tanstack-query--zustand)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Form Architecture (React Hook Form + Zod)](#8-form-architecture-react-hook-form--zod)
9. [Key Pages & Layouts](#9-key-pages--layouts)
10. [AI Features Integration](#10-ai-features-integration)
11. [Real-time Capabilities (WebSockets)](#11-real-time-capabilities-websockets)
12. [Performance Optimization Strategy](#12-performance-optimization-strategy)
13. [Testing Strategy (Vitest & Playwright)](#13-testing-strategy-vitest--playwright)
14. [Accessibility (a11y)](#14-accessibility-a11y)
15. [Internationalization (i18n)](#15-internationalization-i18n)

---

## 1. Project Overview & Tech Stack

NeuroCommerce AI's frontend is a highly modular, scalable web application designed to consume the Laravel Enterprise Modular Monolith backend.

**Core Technologies (Mandated by Master Instructions):**
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript (Strict Mode)
- **Styling:** TailwindCSS v4
- **Server State:** TanStack Query v5
- **Client State:** Zustand
- **Forms & Validation:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Animations:** Framer Motion
- **Unit/Component Testing:** Vitest
- **E2E Testing:** Playwright

---

## 2. Complete Project Structure

The project structure strictly follows a domain-driven, modular approach mirroring the backend's Enterprise Architecture. Every feature module has its own directory.

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (store)/                    # Public Storefront Layout Group
│   │   │   ├── page.tsx                # Home page
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Product listing
│   │   │   │   └── [slug]/page.tsx     # Product detail
│   │   │   ├── categories/
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── brands/
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx            # Checkout flow
│   │   │   │   └── success/page.tsx    # Order confirmation
│   │   │   ├── search/page.tsx         # Search results
│   │   │   └── layout.tsx
│   │   ├── (portal)/                   # Customer Portal Layout Group
│   │   │   ├── account/
│   │   │   │   ├── page.tsx            # Dashboard overview
│   │   │   │   ├── profile/page.tsx    # Edit profile
│   │   │   │   ├── addresses/page.tsx  # Manage addresses
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx        # Order history
│   │   │   │   │   └── [id]/page.tsx   # Order details
│   │   │   │   ├── wishlist/page.tsx   # Saved items
│   │   │   │   └── reviews/page.tsx    # Past reviews
│   │   │   └── layout.tsx
│   │   ├── (admin)/                    # Admin Dashboard Layout Group
│   │   │   ├── dashboard/page.tsx      # KPIs and summary
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Product management grid
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/                     # Authentication Layout Group
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── api/                        # Next.js API Routes (BFF proxy/auth)
│   │   │   └── [...proxy]/route.ts
│   │   ├── layout.tsx                  # Root layout
│   │   └── not-found.tsx
│   │
│   ├── modules/                        # Domain Modules (Mirrors Backend)
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   └── queries.ts
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── store/
│   │   │   │   └── useAuthStore.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── product/
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   ├── queries.ts
│   │   │   │   └── mutations.ts
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGallery.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   └── ProductFilters.tsx
│   │   │   ├── store/
│   │   │   │   └── useProductStore.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── cart/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   │   ├── CartDrawer.tsx
│   │   │   │   └── CartItem.tsx
│   │   │   ├── store/
│   │   │   │   └── useCartStore.ts
│   │   │   └── types/
│   │   ├── order/
│   │   ├── checkout/
│   │   ├── ai/                         # AI Recommendation & Telemetry
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   │   ├── ChatbotWidget.tsx
│   │   │   │   ├── RecommendationCarousel.tsx
│   │   │   │   └── VisualSearchUpload.tsx
│   │   │   └── hooks/
│   │   │       └── useTelemetry.ts
│   │   └── (other modules: category, brand, review, wishlist, etc.)
│   │
│   ├── shared/                         # Cross-cutting concerns
│   │   ├── components/
│   │   │   ├── ui/                     # Design System (Buttons, Inputs, Modals)
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── layout/                 # Headers, Footers, Sidebars
│   │   │   │   ├── MainHeader.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── AdminSidebar.tsx
│   │   │   └── common/                 # ErrorBoundaries, Loaders
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── Loader.tsx
│   │   │       └── EmptyState.tsx
│   │   ├── hooks/                      # Custom React Hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useWebSockets.ts
│   │   ├── lib/                        # Axios, QueryClient setup
│   │   │   ├── axios.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── common.ts               # Pagination interfaces, API responses
│   │   └── config/
│   │       └── constants.ts
│   │
│   └── styles/
│       └── globals.css                 # Tailwind v4 configuration
│
├── public/
│   ├── images/
│   ├── fonts/
│   └── icons/
├── .eslintrc.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 3. Design System & TailwindCSS Configuration

Using **TailwindCSS v4**, we implement a utility-first design system with rich theming capabilities (Light/Dark mode). Tailwind v4 simplifies configuration significantly by defining themes via CSS variables and the `@theme` directive.

### 3.1 Global CSS & Theme Configuration (Tailwind v4)

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* Brand Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6; /* Core Brand */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #0ea5e9;

  /* Theme Backgrounds / Foregrounds */
  --color-background: #ffffff;
  --color-foreground: #09090b;
  --color-muted: #f4f4f5;
  --color-muted-foreground: #71717a;
  --color-border: #e4e4e7;

  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-heading: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
  
  /* Shadows */
  --shadow-subtle: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-glass: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* Dark Mode Overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #09090b;
    --color-foreground: #fafafa;
    --color-muted: #27272a;
    --color-muted-foreground: #a1a1aa;
    --color-border: #27272a;
  }
}

/* Base resets & utilities */
@layer base {
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}
```

### 3.2 Utility Function (`cn`)
Used across all UI components for conditional class merging.

```typescript
// src/shared/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 4. Component Library Architecture

The UI primitives are strict, reusable, and fully accessible.

### 4.1 Button Component
Supports variants, sizes, and loading states using `cva`.

```tsx
// src/shared/components/ui/Button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md',
        destructive: 'bg-error text-white hover:bg-red-600 shadow-sm',
        outline: 'border border-border bg-background hover:bg-muted hover:text-foreground',
        secondary: 'bg-muted text-foreground hover:bg-muted/80',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

### 4.2 Input Component

```tsx
// src/shared/components/ui/Input.tsx
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
          error && 'border-error focus-visible:ring-error',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
```

### 4.3 Modal Component (Framer Motion + Radix)

```tsx
// src/shared/components/ui/Modal.tsx
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={cn(
                  "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-glass rounded-xl sm:rounded-2xl",
                  className
                )}
              >
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                  {title && (
                    <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                      {title}
                    </Dialog.Title>
                  )}
                  {description && (
                    <Dialog.Description className="text-sm text-muted-foreground">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                <div className="py-4">{children}</div>
                <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
```

### 4.4 DataTable Component (For Admin Dashboard)

```tsx
// src/shared/components/ui/DataTable.tsx
'use client';
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

export function DataTable<T>({ data, columns, isLoading }: DataTableProps<T>) {
  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading data...</div>;
  if (!data.length) return <div className="p-8 text-center text-muted-foreground">No records found.</div>;

  return (
    <div className="w-full overflow-auto rounded-md border border-border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b bg-muted/50">
          <tr className="border-b border-border transition-colors">
            {columns.map((col, idx) => (
              <th key={idx} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="p-4 align-middle">
                  {col.cell ? col.cell(row) : (row as any)[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 5. API Client Configuration

We use Axios configured with credentials to work with Laravel Sanctum (cookie-based authentication) and automatic token refresh/redirection.

### 5.1 Typed API Interfaces

```typescript
// src/shared/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code: string;
}
```

### 5.2 Axios Setup & Interceptors

```typescript
// src/shared/lib/axios.ts
import axios, { AxiosError } from 'axios';
import { ApiError } from '../types/api';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Crucial for Laravel Sanctum session cookies
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  // Can attach manual Bearer tokens here if not using Sanctum cookies
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - Clear client state and redirect
        // useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (status === 419) {
        // CSRF Token Mismatch - Needs fresh token
        // Will be handled automatically by refetching CSRF
      } else if (status === 429) {
        console.warn('Rate limit exceeded. Try again later.');
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

---

## 6. State Management (TanStack Query & Zustand)

### 6.1 Server State Configuration (TanStack Query)

```typescript
// src/shared/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    }
  },
});
```

### 6.2 Example Module API Hooks (Product Module)

```typescript
// src/modules/product/api/client.ts
import { apiClient } from '@/shared/lib/axios';
import { ProductResponseDTO, ProductFilterCriteria } from '../types';
import { PaginatedResponse, ApiResponse } from '@/shared/types/api';

export const getProducts = async (params?: ProductFilterCriteria) => {
  return apiClient.get<never, PaginatedResponse<ProductResponseDTO>>('/products', { params });
};

export const getProductBySlug = async (slug: string) => {
  return apiClient.get<never, ApiResponse<ProductResponseDTO>>(`/products/${slug}`);
};
```

```typescript
// src/modules/product/api/queries.ts
import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductBySlug } from './client';
import { ProductFilterCriteria } from '../types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilterCriteria) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
};

export const useProducts = (filters: ProductFilterCriteria) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    placeholderData: (previousData) => previousData, // Keeps previous data while fetching new page
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
};
```

### 6.3 Client State (Zustand)
Used for UI state and optimistic cart operations.

```typescript
// src/modules/cart/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  isCartOpen: boolean;
  itemCount: number;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setItemCount: (count: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      isCartOpen: false,
      itemCount: 0,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      setItemCount: (count) => set({ itemCount: count }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ itemCount: state.itemCount }), // Only persist itemCount
    }
  )
);
```

---

## 7. Authentication & Authorization

### 7.1 Sanctum Auth API implementation

```typescript
// src/modules/auth/api/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/axios';
import { LoginDTO, RegisterDTO, AuthResponse } from '../types';

// Initiates CSRF Protection
const fetchCsrf = async () => {
  return apiClient.get('/sanctum/csrf-cookie', { baseURL: process.env.NEXT_PUBLIC_BACKEND_URL });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginDTO) => {
      await fetchCsrf();
      return apiClient.post<never, AuthResponse>('/auth/login', credentials);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => apiClient.post('/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};
```

### 7.2 Auth Protection Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Basic check for auth cookie created by Sanctum or Next.js
  const hasSession = request.cookies.has('laravel_session');
  
  // Protect Customer Portal
  if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
    if (!hasSession) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect Admin Dashboard
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Deep role checks happen at the API layer, but we can verify admin token claims if stored in cookies
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/admin/:path*'],
};
```

---

## 8. Form Architecture (React Hook Form + Zod)

All forms mandate `react-hook-form` and schema validation using `zod`.

### 8.1 Login Form Example

```tsx
// src/modules/auth/components/LoginForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../api/mutations';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember_me: false,
    }
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        router.push('/account');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto p-6 bg-white shadow-sm rounded-lg border border-border">
      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <Input 
          type="email" 
          placeholder="john@example.com"
          {...register('email')} 
          error={!!errors.email}
        />
        {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Password</label>
        <Input 
          type="password"
          {...register('password')} 
          error={!!errors.password}
        />
        {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
      </div>
      
      {error && <p className="text-sm text-error font-medium">{error.message}</p>}

      <Button type="submit" className="w-full" isLoading={isPending}>
        Sign In
      </Button>
    </form>
  );
};
```

---

## 9. Key Pages & Layouts

### 9.1 Storefront Root Layout
```tsx
// src/app/(store)/layout.tsx
import { MainHeader } from '@/shared/components/layout/MainHeader';
import { Footer } from '@/shared/components/layout/Footer';
import { ChatbotWidget } from '@/modules/ai/components/ChatbotWidget';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget /> {/* Global AI integration */}
    </div>
  );
}
```

### 9.2 Server-Side Product Detail Page
Leverages Next.js server components for SEO.

```tsx
// src/app/(store)/products/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/modules/product/components/ProductGallery';
import { ProductInfo } from '@/modules/product/components/ProductInfo';
import { RecommendationCarousel } from '@/modules/ai/components/RecommendationCarousel';
import { getProductBySlug } from '@/modules/product/api/server-client'; // uses native fetch for RSC

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: `${product.data.name} | NeuroCommerce`,
    description: product.data.description,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const productRes = await getProductBySlug(params.slug);
  
  if (!productRes?.data) {
    notFound();
  }

  const product = productRes.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <ProductGallery images={product.images} />
        <ProductInfo product={product} />
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 font-heading">You Might Also Like</h2>
        {/* Client component fetching AI recommendations based on this context */}
        <RecommendationCarousel productId={product.id} context="product_page" />
      </div>
    </div>
  );
}
```

---

## 10. AI Features Integration

NeuroCommerce AI features heavy client-side AI integration for real-time personalization.

### 10.1 Telemetry Hook
Tracks behavior and pushes to the backend AI Engine.

```typescript
// src/modules/ai/hooks/useTelemetry.ts
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/shared/lib/axios';

export const useTelemetry = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    apiClient.post('/tracking/page-view', {
      path: pathname,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
    }).catch(console.error);
  }, [pathname]);

  const trackEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    await apiClient.post('/tracking/events', {
      event_type: eventName,
      metadata,
      timestamp: new Date().toISOString(),
    });
  };

  return { trackEvent };
};
```

---

## 11. Real-time Capabilities (WebSockets)

Integration with **Laravel Reverb** utilizing Pusher JS to update client UI instantly (e.g. order status).

```typescript
// src/shared/hooks/useWebSockets.ts
'use client';
import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Setup global Pusher for Next.js (client side)
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

export const useOrderChannel = (orderId: string) => {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const echo = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
      forceTLS: false, // adjust based on env
      disableStats: true,
    });

    const channel = echo.private(`orders.${orderId}`)
      .listen('OrderStatusUpdated', (e: any) => {
        setStatus(e.new_status);
        // Optionally trigger TanStack query invalidation here
      });

    return () => {
      channel.stopListening('OrderStatusUpdated');
      echo.leave(`orders.${orderId}`);
    };
  }, [orderId]);

  return { status };
};
```

---

## 12. Performance Optimization Strategy

1. **Images:** Always use `next/image`.
```tsx
<Image 
  src={product.image.url} 
  alt={product.image.alt} 
  width={600} 
  height={600} 
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isLcpElement} 
  className="object-cover"
/>
```
2. **Dynamic Imports:** Heavy components (like Recharts in Admin dashboard) are dynamically loaded.
```tsx
import dynamic from 'next/dynamic';
const SalesChart = dynamic(() => import('@/modules/admin/components/SalesChart'), { ssr: false });
```
3. **Suspense Boundaries:** Wrap granular components in suspense to prevent blocking rendering of the entire page layout.

---

## 13. Testing Strategy (Vitest & Playwright)

### 13.1 Unit Testing (Vitest)
Used for Hooks, Utilities, and isolated Components.

```typescript
// src/shared/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('px-2 py-1', { 'text-white': true, 'text-black': false })).toBe('px-2 py-1 text-white');
  });
});
```

### 13.2 Component Testing (React Testing Library)

```tsx
// src/shared/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { describe, it, expect } from 'vitest';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    // Assuming Loader2 adds an SVG class
    expect(document.querySelector('.animate-spin')).toBeDefined();
  });
});
```

### 13.3 E2E Testing (Playwright)
```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('completes guest checkout flow', async ({ page }) => {
  await page.goto('/products/wireless-headphones');
  await page.click('button:has-text("Add to Cart")');
  await page.click('a:has-text("Checkout")');
  
  await expect(page).toHaveURL(/.*checkout/);
  await page.fill('input[name="email"]', 'guest@example.com');
  await page.fill('input[name="address"]', '123 Test St');
  
  // Submit payment form
  await page.click('button:has-text("Pay Now")');
  
  await expect(page).toHaveURL(/.*checkout\/success/);
  await expect(page.locator('h1')).toContainText('Order Confirmed');
});
```

---

## 14. Accessibility (a11y)

- **Semantic HTML:** `<header>`, `<main>`, `<nav>`, `<footer>` enforced.
- **Keyboard Traversal:** Ensure standard `tabIndex` flows. Use `focus-visible` classes in Tailwind.
- **ARIA Roles:** Used in highly dynamic components (like the AI Chatbot and Modals).
```tsx
<div role="status" aria-live="polite">
  {isAiTyping ? "AI is generating a response..." : responseText}
</div>
```

---

## 15. Internationalization (i18n)

Next.js App Router native internationalization.

- **Routing:** `/en/products`, `/es/products`.
- **Dictionaries:** JSON files loaded via server components.
- **Currency:** Formatted using native `Intl.NumberFormat`.

```typescript
// src/shared/lib/formatters.ts
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
```
