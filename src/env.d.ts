interface ImportMetaEnv {
  /** Set to "true" at launch to allow search engines to index the site. */
  readonly PUBLIC_INDEXABLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
