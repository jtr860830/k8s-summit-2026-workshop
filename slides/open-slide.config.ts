import type { OpenSlideConfig } from '@open-slide/core';

// GitHub Pages serves the deck under /<repo>/; CI sets SLIDES_BASE. Local dev stays at /.
const openSlideConfig: OpenSlideConfig = {
  base: process.env.SLIDES_BASE ?? '/',
};

export default openSlideConfig;
