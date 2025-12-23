import { useState, useEffect, useCallback, memo } from 'react';

const ICON_PATHS: Record<string, React.ReactElement> = {
  check: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>,
  gift: <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
};

const Icon = memo(({ name, className = "w-6 h-6" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">{ICON_PATHS[name]}</svg>
));
Icon.displayName = 'Icon';

const haptic = (duration: number = 15) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const FreeNoticeModal = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNoticeStatus = () => {
      const shown = getCookie('freeNoticeShown');
      if (shown !== 'true') {
        setIsOpen(true);
      }
      setIsLoading(false);
    };
    checkNoticeStatus();
  }, []);

  const handleClose = useCallback(() => {
    haptic(15);
    setIsOpen(false);
  }, []);

  const handleDontShowAgain = useCallback(() => {
    haptic(20);
    setIsOpen(false);
    setCookie('freeNoticeShown', 'true', 365);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (isLoading || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl max-h-[85vh] flex flex-col animate-[slideUp_0.2s_ease-out]">
        <div className="p-6 pt-8 space-y-6 overflow-y-auto flex-1 hide-scrollbar">
          <div className="flex justify-center">
            <div className="w-16 h-16 text-5xl flex items-center justify-center">
              📱
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              欢迎使用
            </h2>
            <p className="text-gray-600 text-sm">
              无广告 · 无限制
            </p>
          </div>

          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg shrink-0">
                <Icon name="check" className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-semibold text-sm mb-1">
                  无广告干扰
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  纯净体验,专注使用
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                <Icon name="gift" className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-semibold text-sm mb-1">
                  无使用限制
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  随心使用,畅享所有功能
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pb-safe">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all"
            >
              开始使用
            </button>

            <a
              href="https://t.me/fang180"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptic(15)}
              className="block w-full py-3 text-blue-600 text-sm font-medium text-center hover:bg-blue-50 rounded-xl transition-colors"
            >
              加入交流群 @fang180
            </a>

            <button
              onClick={handleDontShowAgain}
              className="w-full py-3 text-gray-500 text-sm font-medium hover:bg-gray-50 rounded-xl transition-colors"
            >
              不再提示
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
FreeNoticeModal.displayName = 'FreeNoticeModal';
