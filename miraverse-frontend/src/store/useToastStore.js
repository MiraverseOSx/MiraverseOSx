import { create } from 'zustand';

let nextToastId = 1;
const DEFAULT_DURATION = 3200;

export const useToastStore = create((set, get) => ({
    toasts: [],
    dismissToast: (id) => set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
    pushToast: ({ title, message, tone = 'info', duration = DEFAULT_DURATION }) => {
        const id = nextToastId++;
        set((state) => ({
            toasts: [...state.toasts.slice(-3), { id, title, message, tone }],
        }));
        window.setTimeout(() => get().dismissToast(id), duration);
        return id;
    },
}));
