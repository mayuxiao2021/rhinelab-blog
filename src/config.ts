import type {
  LayoutConfig,
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

// ---------------------------------------------------------------------------
// 站点配置 —— 莱茵档案（Rhine Archive）主题
// 修改说明见 docs/THEMING.md
// ---------------------------------------------------------------------------
export const siteConfig: SiteConfig = {
  title: '莱茵档案',
  subtitle: 'RHINE LAB-STYLE FIELD ARCHIVE',
  lang: 'zh_CN', // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko'
  themeColor: {
    // 主题固定为黄铜强调（#9b7247 / #c5a16b），不开放访客调色
    hue: 70,
    fixed: true,
  },
  banner: {
    // 主题自带 CSS 档案场背景；banner 默认关闭以杜绝缺图 404
    enable: false,
    src: 'banners',
    position: 'center',
    credit: {
      enable: false,
      text: '',
      url: '',
    },
  },
  favicon: [
    {
      src: '/rhine/favicon.svg',
      sizes: 'any',
    },
  ],
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    {
      name: '研究员',
      url: '/operators/',
      external: false,
    },
    {
      name: '项目',
      url: '/gallery/',
      external: false,
    },
    {
      name: '统计',
      url: '/stats/',
      external: false,
    },
    {
      name: '源',
      url: 'https://github.com/saicaca/fuwari',
      external: true,
    },
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: '/rhine/avatar.svg',
  name: '观测者 07',
  bio: '记录实验、失效与复原。所有条目以可复现为前提。',
  links: [
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/yourname',
    },
    {
      name: 'RSS',
      icon: 'fa6-solid:rss',
      url: '/rss.xml',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}

/** 友链（侧栏 Links 部件） */
export const FRIENDLY_LINKS = [
  {
    name: 'Astro',
    url: 'https://astro.build',
    description: '本站使用的静态站点框架（MIT）',
  },
  {
    name: 'Fuwari',
    url: 'https://github.com/saicaca/fuwari',
    description: '主题基座（MIT）',
  },
  {
    name: 'Pagefind',
    url: 'https://pagefind.app',
    description: '静态全文检索（MIT）',
  },
]

// 侧栏布局：部件 id 对应 components/widget 下的组件
export const layoutConfig: LayoutConfig = {
  sidebar: {
    top: ['profile'],
    sticky: ['categories', 'tags', 'links'],
  },
}
