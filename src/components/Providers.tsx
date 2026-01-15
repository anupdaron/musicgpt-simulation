'use client';

import React from 'react';
import { SocketProvider } from '@/hooks/useSocket';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <SocketProvider>{children}</SocketProvider>;
}
