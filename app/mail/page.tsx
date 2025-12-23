'use client';

import React, { useState, memo, useMemo, useEffect } from 'react';
import { NavigationMenu } from '@/app/NavigationMenu';
import RandomBackground from '@/components/RandomBackground';

const ICON_PATHS: Record<string, string> = {
  search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  open: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
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

interface TempEmail {
  name: string;
  url: string;
  description: string;
}

const tempEmails: TempEmail[] = [
  { name: 'YOPmail', url: 'https://yopmail.com', description: '最受欢迎的临时邮箱服务,无需注册' },
  { name: '10 Minute Mail', url: 'https://10minutemail.com', description: '自动生成10分钟有效的临时邮箱' },
  { name: 'Temp Mail', url: 'https://temp-mail.org', description: '自动生成临时邮箱,实时接收邮件' },
  { name: 'Guerrilla Mail', url: 'https://www.guerrillamail.com', description: '匿名临时邮箱,保护隐私' },
  { name: 'Mohmal', url: 'https://www.mohmal.com', description: '阿拉伯语临时邮箱服务' },
  { name: 'Maildrop', url: 'https://maildrop.cc', description: '简单快速的临时邮箱,24小时有效' },
  { name: 'ThrowAwayMail', url: 'https://www.throwawaymail.com', description: '随机生成临时邮箱地址' },
  { name: 'EmailOnDeck', url: 'https://www.emailondeck.com', description: '快速临时邮箱,支持多个地址' },
  { name: 'FakeMail', url: 'https://www.fakemail.net', description: '免费临时邮箱生成器' },
  { name: 'TempMail.Plus', url: 'https://tempmail.plus', description: '高级临时邮箱服务' },
  { name: 'Mailinator', url: 'https://www.mailinator.com', description: '公共临时邮箱系统' },
  { name: 'Dispostable', url: 'https://www.dispostable.com', description: '可抛弃的临时邮箱' },
  { name: 'Temp-Mail.io', url: 'https://temp-mail.io', description: '现代化临时邮箱界面' },
  { name: 'MailDrop', url: 'https://maildrop.cc', description: 'MailDrop临时邮箱服务' },
  { name: 'MailCatch', url: 'https://mailcatch.com', description: '捕获临时邮件的服务' }
];

const EmailCard = memo(({ email }: { email: TempEmail }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleClick = () => {
    haptic(20);
    setIsOpening(true);
    setTimeout(() => {
      window.open(email.url, '_blank');
      setTimeout(() => setIsOpening(false), 300);
    }, 100);
  };

  return (
    <div className="card rounded-xl p-4 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {email.name}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
            {email.description}
          </p>
        </div>

        <button
          onClick={handleClick}
          disabled={isOpening}
          className={`shrink-0 px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium transition-all ${
            isOpening
              ? 'bg-green-50 text-green-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Icon name="open" className="w-3.5 h-3.5" />
          <span>{isOpening ? '打开中' : '访问'}</span>
        </button>
      </div>
    </div>
  );
});
EmailCard.displayName = 'EmailCard';

export default function TempEmailCollection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [ipInfo, setIpInfo] = useState({ ip: '...', country: 'US' });

  const filteredEmails = useMemo(() => {
    if (!searchQuery) return tempEmails;
    const query = searchQuery.toLowerCase();
    return tempEmails.filter(email =>
      email.name.toLowerCase().includes(query) ||
      email.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        if (!isMounted) return;
        setIpInfo({ ip: data.ip || '未知', country: data.country || 'US' });
      } catch (error) {
        if (isMounted) {
          setIpInfo({ ip: '检测失败', country: 'US' });
        }
      }
    };
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen relative">
      <RandomBackground />
      <div className="max-w-2xl mx-auto relative z-10">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="text-base font-semibold text-gray-900">
              临时邮箱大全
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索临时邮箱..."
              className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all caret-blue-600 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { haptic(15); setSearchQuery(''); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon name="close" className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="card rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 shrink-0">
                <Icon name="info" className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  使用提示
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  临时邮箱用于注册网站或接收验证码,请勿用于重要账户。邮件可能被他人查看,注意隐私安全。
                </p>
              </div>
            </div>
          </div>

          {filteredEmails.length > 0 && (
            <section className="space-y-2">
              {filteredEmails.map((email, idx) => (
                <EmailCard key={idx} email={email} />
              ))}
            </section>
          )}

          {filteredEmails.length === 0 && (
            <div className="text-center py-16">
              <Icon name="search" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">未找到匹配的邮箱服务</p>
            </div>
          )}

          <footer className="pt-6 pb-8 text-center">
            <p className="text-xs text-gray-500">
              共收录 {tempEmails.length} 个临时邮箱服务
            </p>
          </footer>
        </main>
      </div>

      <NavigationMenu
        isOpen={showNavigationMenu}
        onClose={() => setShowNavigationMenu(false)}
      />
    </div>
  );
}
