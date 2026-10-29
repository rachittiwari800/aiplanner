import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  activeTab: string;
  searchQuery: string;
  notificationsCount: number;
  notifications: NotificationItem[];
  toggleSidebar: () => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setNotificationsCount: (count: number) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationsRead: () => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'planner' | 'weather' | 'system';
  read: boolean;
  createdAt: string;
}

const initialNotifications: NotificationItem[] = [
  { id: 'welcome', title: 'Welcome to Wayfarer', message: 'Search a destination to begin planning.', type: 'system', read: false, createdAt: 'Just now' },
  { id: 'weather', title: 'Weather is ready', message: 'Your selected destination forecast will appear in the right panel.', type: 'weather', read: false, createdAt: 'Today' },
  { id: 'planner', title: 'Planner tip', message: 'Save an itinerary to keep it in your trips dashboard.', type: 'planner', read: false, createdAt: 'Today' },
];

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isChatOpen: true,
  activeTab: 'dashboard',
  searchQuery: '',
  notificationsCount: initialNotifications.length,
  notifications: initialNotifications,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setChatOpen: (open: boolean) => set({ isChatOpen: open }),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setNotificationsCount: (count: number) => set({ notificationsCount: count }),
  addNotification: (notification) => set((state) => ({
    notifications: [{ ...notification, id: `notification_${Date.now()}`, read: false, createdAt: 'Just now' }, ...state.notifications],
    notificationsCount: state.notificationsCount + 1,
  })),
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    notificationsCount: 0,
  })),
}));
