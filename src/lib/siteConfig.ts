export interface SiteConfig {
  slug: string
  name: string
  origin: string
  tagline: string
  description?: string
}

export const SITE_CONFIG: SiteConfig = {
  slug: 'lore',
  name: 'oriz·lore',
  origin: 'https://lore.oriz.in',
  tagline: 'a nocturne archive of structured book commentary',
  description:
    'oriz·lore is a nocturne archive of structured book commentary — overview, content map, analysis, narration. Read by lamplight on a darkened page.',
}
