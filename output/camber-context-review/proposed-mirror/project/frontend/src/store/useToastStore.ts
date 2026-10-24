import { create } from 'zustand';

export interface ToastItem {
    id: number;
    title: string;
    message: string;
    tone: 'info' | 'success' | 'warning' | 'error' | string;
}

export interface ToastOptions {
    title: string;
    message: string;
    tone?: string;
    duration?: number;
}

export interface ToastStoreState {
    toasts: ToastItem[];
    dismissToast: (id: number) => void;
    pushToast: (options: ToastOptions) => number;
}

let nextToastId = 1;
const DEFAULT_DURATION = 3200;

export const useToastStore = create<ToastStoreState>((set, get) => ({
    toasts: [],
    dismissToast: (id: number) => set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
    pushToast: ({ title, message, tone = 'info', duration = DEFAULT_DURATION }: ToastOptions) => {
        const id = nextToastId++;
        set((state) => ({
            toasts: [...state.toasts.slice(-3), { id, title, message, tone }],
        }));
        window.setTimeout(() => get().dismissToast(id), duration);
        return id;
    },
}));
