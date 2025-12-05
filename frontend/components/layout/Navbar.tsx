'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui-kit/tooltip';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: 'https://github.com/convo-flow', label: 'Star Us', icon: 'github', external: true },
    { href: 'https://docs.convoflow.vanshkhaneja.com/', label: 'Docs', icon: 'docs', external: true },
  ];

  const isActive = (href: string) => {
    if (href.startsWith('http')) return false;
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-lg border-b border-[var(--border-color)]`} style={{ backgroundColor: '#13111C' }}>
        <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 -ml-1 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/brand/logo_with_boundary.png" 
                alt="Convo Flow" 
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain flex-shrink-0" 
              />
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--foreground)] whitespace-nowrap">
                Convo Flow
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              <a
                href="https://github.com/convo-flow"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
                aria-label="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 flex-shrink-0"
                  fill="#ffffff"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-xs sm:text-sm font-semibold text-[#d1d5db] hidden xs:inline">GitHub</span>
              </a>

              {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.external) {
                if (item.icon === 'docs') {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1 hover:opacity-80 transition-opacity"
                      aria-label={item.label}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-[#d1d5db]">{item.label}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5 mt-0.5"
                      >
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </a>
                  );
                }
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-3 py-2 rounded bg-[var(--card-hover)] text-[var(--foreground)] hover:bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--primary)]/50 transition-all"
                    aria-label={item.label}
                  >
                    {item.icon === 'github' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 128 128"
                        className="h-5 w-5 fill-current"
                      >
                        <g fill="currentColor">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M64 5.103c-33.347 0-60.388 27.035-60.388 60.388 0 26.682 17.303 49.317 41.297 57.303 3.017.56 4.125-1.31 4.125-2.905 0-1.44-.056-6.197-.082-11.243-16.8 3.653-20.345-7.125-20.345-7.125-2.747-6.98-6.705-8.836-6.705-8.836-5.48-3.748.413-3.67.413-3.67 6.063.425 9.257 6.223 9.257 6.223 5.386 9.23 14.127 6.562 17.573 5.02.542-3.903 2.107-6.568 3.834-8.076-13.413-1.525-27.514-6.704-27.514-29.843 0-6.593 2.36-11.98 6.223-16.21-.628-1.52-2.695-7.662.584-15.98 0 0 5.07-1.623 16.61 6.19C53.7 35 58.867 34.327 64 34.304c5.13.023 10.3.694 15.127 2.033 11.526-7.813 16.59-6.19 16.59-6.19 3.287 8.317 1.22 14.46.593 15.98 3.872 4.23 6.215 9.617 6.215 16.21 0 23.194-14.127 28.3-27.574 29.796 2.167 1.874 4.097 5.55 4.097 11.183 0 8.08-.07 14.583-.07 16.572 0 1.607 1.088 3.49 4.148 2.897 23.98-7.994 41.263-30.622 41.263-57.294C124.388 32.14 97.35 5.104 64 5.104z"
                          />
                          <path d="M26.484 91.806c-.133.3-.605.39-1.035.185-.44-.196-.685-.605-.543-.906.13-.31.603-.395 1.04-.188.44.197.69.61.537.91zm2.446 2.729c-.287.267-.85.143-1.232-.28-.396-.42-.47-.983-.177-1.254.298-.266.844-.14 1.24.28.394.426.472.984.17 1.255zM31.312 98.012c-.37.258-.976.017-1.35-.52-.37-.538-.37-1.183.01-1.44.373-.258.97-.025 1.35.507.368.545.368 1.19-.01 1.452zm3.261 3.361c-.33.365-1.036.267-1.552-.23-.527-.487-.674-1.18-.343-1.544.336-.366 1.045-.264 1.564.23.527.486.686 1.18.333 1.543zm4.5 1.951c-.147.473-.825.688-1.51.486-.683-.207-1.13-.76-.99-1.238.14-.477.823-.7 1.512-.485.683.206 1.13.756.988 1.237zm4.943.361c.017.498-.563.91-1.28.92-.723.017-1.308-.387-1.315-.877 0-.503.568-.91 1.29-.924.717-.013 1.306.387 1.306.88zm4.598-.782c.086.485-.413.984-1.126 1.117-.7.13-1.35-.172-1.44-.653-.086-.498.422-.997 1.122-1.126.714-.123 1.354.17 1.444.663zm0 0" />
                        </g>
                      </svg>
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded font-medium text-sm transition-all
                    ${active
                      ? 'text-[var(--foreground)] bg-[var(--card-hover)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]'
                    }
                  `}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavItem"
                      className="absolute inset-0 bg-[var(--card-hover)] rounded"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 ${active ? 'text-[var(--primary)]' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
    </TooltipProvider>
  );
}

