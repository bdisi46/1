'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { FreeNoticeModal } from './FreeNoticeModal';
import { NavigationMenu } from './NavigationMenu';
import RandomBackground from '@/components/RandomBackground';
import { countries, CountryConfig } from '@/lib/countryData';
import {
  generateName,
  generateBirthday,
  generatePhone,
  generatePassword,
  generateEmail,
  getCountryConfig,
  getAllDomains
} from '@/lib/generator';

interface UserInfo {
  firstName: string;
  lastName: string;
  birthday: string;
  phone: string;
  password: string;
  email: string;
}

const ICON_PATHS: Record<string, string> = {
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  sparkles: "M7 11v2l-4 1 4 1v2l1-4-1-4zm5-7v4l-3 1 3 1v4l2-5-2-5zm5.66 2.94L15 6.26l.66-2.94L18.34 6l2.66.68-2.66.68-.68 2.58-.66-2.94zM15 18l-2-3 2-3 2 3-2 3z",
  inbox: "M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z",
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  chevronDown: "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
};

const Icon = memo(({ name, className = "w-5 h-5" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d={ICON_PATHS[name]} />
  </svg>
));
Icon.displayName = 'Icon';

const haptic = (duration: number = 15) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

const InfoRow = memo(({ label, value, onCopy, isCopied }: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
}) => (
  <button
    onClick={onCopy}
    className="group flex items-center justify-between py-3 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-100 touch-manipulation"
  >
    <span className="text-sm font-medium text-gray-500 w-20 text-left">
      {label}
    </span>
    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
      <span className="text-sm font-medium text-gray-900 truncate">
        {value || '---'}
      </span>
      {isCopied && (
        <Icon name="check" className="w-4 h-4 text-green-600 flex-shrink-0" />
      )}
    </div>
  </button>
));
InfoRow.displayName = 'InfoRow';

const BottomSheet = memo(({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-[slideUp_0.2s_ease-out]">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
});
BottomSheet.displayName = 'BottomSheet';

const ListItem = memo(({ label, isSelected, onClick }: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors touch-manipulation ${
      isSelected
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-900 hover:bg-gray-50'
    }`}
  >
    <span>{label}</span>
    {isSelected && <Icon name="check" className="w-5 h-5 text-blue-600" />}
  </button>
));
ListItem.displayName = 'ListItem';

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(countries[0]);
  const [selectedDomain, setSelectedDomain] = useState<string>('random');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '', lastName: '', birthday: '', phone: '', password: '', email: ''
  });
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showDomainSheet, setShowDomainSheet] = useState(false);
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [ipInfo, setIpInfo] = useState({ ip: '...', country: 'US' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [inboxStatus, setInboxStatus] = useState<'idle' | 'opening'>('idle');

  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const allDomains = getAllDomains();

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    haptic(20);
    try {
      await navigator.clipboard.writeText(text);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopiedField(label);
      copyTimerRef.current = setTimeout(() => setCopiedField(null), 2000);
    } catch {
      haptic(30);
    }
  }, []);

  const generate = useCallback(() => {
    haptic(30);
    setCopiedField(null);

    try {
      const { firstName, lastName } = generateName(selectedCountry.code);
      const birthday = generateBirthday();
      const phone = generatePhone(selectedCountry);
      const password = generatePassword();
      const customDomain = selectedDomain === 'random' ? undefined : selectedDomain;
      const email = generateEmail(firstName, lastName, customDomain);
      setUserInfo({ firstName, lastName, birthday, phone, password, email });
    } catch (error) {
      console.error(error);
    }
  }, [selectedCountry, selectedDomain]);

  const handleInboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inboxStatus === 'opening') return;
    haptic(20);
    setInboxStatus('opening');
    const emailName = userInfo.email.split('@')[0];
    setTimeout(() => {
      window.open(`https://yopmail.net/?login=${emailName}`, '_blank');
      setInboxStatus('idle');
    }, 300);
  }, [userInfo.email, inboxStatus]);

  useEffect(() => {
    let isMounted = true;
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        if (!isMounted) return;
        setIpInfo({ ip: data.ip || '未知', country: data.country || 'US' });
        if (data.country && data.accurate) {
          const detectedCountry = getCountryConfig(data.country);
          if (detectedCountry) setSelectedCountry(detectedCountry);
        }
        setIsInitialized(true);
      } catch (error) {
        if (isMounted) {
          setIpInfo({ ip: '检测失败', country: 'US' });
          setIsInitialized(true);
        }
      }
    };
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isInitialized && !userInfo.firstName) {
      generate();
    }
  }, [isInitialized, userInfo.firstName, generate]);

  useEffect(() => {
    if (isInitialized && userInfo.firstName) generate();
  }, [selectedCountry.code]);

  const displayDomain = selectedDomain === 'random' ? '随机' : selectedDomain;

  return (
    <div className="min-h-screen relative">
      <RandomBackground />
      <FreeNoticeModal />

      <div className="max-w-2xl mx-auto relative z-10">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="text-base font-semibold text-gray-900">
              脸书小助手
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 border border-green-200">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-700 font-mono">
                  {ipInfo.ip}
                </span>
              </div>

              <button
                onClick={() => { haptic(15); setShowNavigationMenu(true); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="menu" className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 pt-6 pb-10 space-y-4">
          {!isInitialized ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-3">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          ) : (
            <>
              <section className="card rounded-xl divide-y divide-gray-200">
                <InfoRow label="姓氏" value={userInfo.lastName} onCopy={() => copyToClipboard(userInfo.lastName, '姓氏')} isCopied={copiedField === '姓氏'} />
                <InfoRow label="名字" value={userInfo.firstName} onCopy={() => copyToClipboard(userInfo.firstName, '名字')} isCopied={copiedField === '名字'} />
                <InfoRow label="生日" value={userInfo.birthday} onCopy={() => copyToClipboard(userInfo.birthday, '生日')} isCopied={copiedField === '生日'} />
                <InfoRow label="手机号" value={userInfo.phone} onCopy={() => copyToClipboard(userInfo.phone, '手机号')} isCopied={copiedField === '手机号'} />
                <InfoRow label="密码" value={userInfo.password} onCopy={() => copyToClipboard(userInfo.password, '密码')} isCopied={copiedField === '密码'} />

                <div className="relative flex flex-col py-3 px-4">
                  <button
                    className="flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 -mx-4 px-4 py-1 transition-colors"
                    onClick={() => copyToClipboard(userInfo.email, '邮箱')}
                  >
                    <span className="text-sm font-medium text-gray-500 w-20 text-left">
                      邮箱
                    </span>
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {userInfo.email}
                      </span>
                      {copiedField === '邮箱' && (
                        <Icon name="check" className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleInboxClick}
                      disabled={inboxStatus === 'opening'}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                    >
                      <Icon name="inbox" className="w-3.5 h-3.5" />
                      <span>{inboxStatus === 'opening' ? '打开中' : '查看收件箱'}</span>
                    </button>
                  </div>
                </div>
              </section>

              <button
                onClick={generate}
                className="w-full py-3 btn-primary flex items-center justify-center gap-2"
              >
                <Icon name="sparkles" className="w-5 h-5" />
                <span className="text-base">生成新身份</span>
              </button>

              <section className="space-y-2">
                <div className="card rounded-xl divide-y divide-gray-200">
                  <button
                    onClick={() => { haptic(15); setShowCountrySheet(true); }}
                    className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">选择地区</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{selectedCountry.name}</span>
                      <Icon name="chevronDown" className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  <button
                    onClick={() => { haptic(15); setShowDomainSheet(true); }}
                    className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">邮箱域名</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{displayDomain}</span>
                      <Icon name="chevronDown" className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                </div>
              </section>

              <footer className="pt-6 pb-8 text-center space-y-3">
                <a
                  href="https://t.me/fang180"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  加入 Telegram 频道
                </a>
                <p className="text-xs text-gray-500">
                  支持 {countries.length} 个国家 · {allDomains.length} 个域名
                </p>
              </footer>
            </>
          )}
        </main>
      </div>

      <BottomSheet
        isOpen={showCountrySheet}
        onClose={() => setShowCountrySheet(false)}
        title="选择地区"
      >
        <div className="divide-y divide-gray-200">
          {countries.map((country) => (
            <ListItem
              key={country.code}
              label={country.name}
              isSelected={selectedCountry.code === country.code}
              onClick={() => {
                haptic(15);
                setSelectedCountry(country);
                setShowCountrySheet(false);
              }}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={showDomainSheet}
        onClose={() => setShowDomainSheet(false)}
        title="选择域名"
      >
        <div className="divide-y divide-gray-200">
          <ListItem
            label="随机域名"
            isSelected={selectedDomain === 'random'}
            onClick={() => {
              haptic(15);
              setSelectedDomain('random');
              setShowDomainSheet(false);
            }}
          />
          {allDomains.map((domain) => (
            <ListItem
              key={domain}
              label={domain}
              isSelected={selectedDomain === domain}
              onClick={() => {
                haptic(15);
                setSelectedDomain(domain);
                setShowDomainSheet(false);
              }}
            />
          ))}
        </div>
      </BottomSheet>

      <NavigationMenu
        isOpen={showNavigationMenu}
        onClose={() => setShowNavigationMenu(false)}
      />
    </div>
  );
}
