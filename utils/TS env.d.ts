// env.d.ts
interface ImportMetaEnv {
  readonly NEXT_PUBLIC_REWON_PROJECT_ID: string
  readonly NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY?: string
  readonly NEXT_PUBLIC_GENESIS_BADGE_CONTRACT: `0x${string}`
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}