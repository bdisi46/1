'use client';

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const haptic = (duration: number = 15) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

const ICON_PATHS: Record<string, string> = {
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  chevronRight: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  inbox: "M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"
};

const Icon = memo(({ name, className = "w-5 h-5" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d={ICON_PATHS[name]} />
  </svg>
));
Icon.displayName = 'Icon';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  url: string;
  description?: string;
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { id: 'home', label: '信息生成器', icon: 'home', url: '/', description: '生成身份信息' },
  { id: 'mail', label: '临时邮箱大全', icon: 'inbox', url: '/mail', description: '查看临时邮箱服务列表' }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Sidebar = memo(({ isOpen, onClose, title, children }: SidebarProps) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    scrollYRef.current = window.scrollY;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.cssText = `position:fixed;top:-${scrollYRef.current}px;width:100%;padding-right:${scrollbarWidth}px`;

    return () => {
      body.style.cssText = '';
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    haptic(15);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={handleClose}
        style={{ touchAction: 'none' }}
      />

      <div className="relative w-[85vw] max-w-sm h-full bg-white flex flex-col shadow-xl">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="close" className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
});
Sidebar.displayName = 'Sidebar';

interface NavItemProps {
  item: NavigationItem;
  onClick: (item: NavigationItem) => void;
}

const NavItem = memo(({ item, onClick }: NavItemProps) => {
  const handleClick = useCallback(() => {
    haptic(15);
    onClick(item);
  }, [item, onClick]);

  return (
    <button
      onClick={handleClick}
      className="w-full card rounded-xl p-4 flex items-center gap-3 card-hover"
    >
      <div className="p-2 rounded-lg bg-blue-50 flex-shrink-0">
        <Icon name={item.icon} className="w-5 h-5 text-blue-600" />
      </div>

      <div className="flex-1 text-left min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.label}
        </h4>
      </div>

      <Icon name="chevronRight" className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </button>
  );
});
NavItem.displayName = 'NavItem';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationMenu = memo(({ isOpen, onClose }: NavigationMenuProps) => {
  const router = useRouter();

  const handleNavigate = useCallback((item: NavigationItem) => {
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      onClose();
    } else {
      router.push(item.url);
      onClose();
    }
  }, [onClose, router]);

  return (
    <Sidebar isOpen={isOpen} onClose={onClose} title="导航菜单">
      <div className="p-4 space-y-2">
        {NAVIGATION_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            onClick={handleNavigate}
          />
        ))}
      </div>
    </Sidebar>
  );
});
NavigationMenu.displayName = 'NavigationMenu';
