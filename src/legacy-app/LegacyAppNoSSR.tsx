"use client";

import dynamic from 'next/dynamic';

const LegacyAppNoSSR = dynamic(() => import('./LegacyApp'), { ssr: false });

export default LegacyAppNoSSR;
