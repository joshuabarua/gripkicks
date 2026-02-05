"use client";

import React from "react";
import { HomeMinimalist, HomeCreative, HomeBrutalist, HomeCombined } from './home-designs';

type DesignVariant = 'minimalist' | 'creative' | 'brutalist' | 'combined';

const ACTIVE_DESIGN: DesignVariant = 'creative';

export default function Home() {
  switch (ACTIVE_DESIGN) {
    case 'minimalist':
      return <HomeMinimalist />;
    case 'creative':
      return <HomeCreative />;
    case 'brutalist':
      return <HomeBrutalist />;
    case 'combined':
      return <HomeCombined />;
    default:
      return <HomeMinimalist />;
  }
}
