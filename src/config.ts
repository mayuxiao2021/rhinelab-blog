import type {
  LayoutConfig,
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

// ---------------------------------------------------------------------------
// 站点配置 —— 黯的博客（莱茵档案 Rhine Archive 主题）
// 修改说明见 docs/THEMING.md
// ---------------------------------------------------------------------------
export const siteConfig: SiteConfig = {
  title: '黯',
  subtitle: 'RHINE LAB-STYLE PERSONAL ARCHIVE',
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
      name: '入口',
      url: '/start/',
      external: false,
    },
    {
      name: 'GitHub',
      url: 'https://github.com/mayuxiao2021/rhinelab-blog',
      external: true,
    },
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/demo-avatar.png',
  name: '黯',
  bio: '这里是黯的博客（￣︶￣）↗　.',
  links: [
    {
      name: 'Twitter',
      icon: 'fa6-brands:twitter',
      url: 'https://twitter.com',
    },
    {
      name: 'Steam',
      icon: 'fa6-brands:steam',
      url: 'https://store.steampowered.com',
    },
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/mayuxiao2021',
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
    name: '吃掉明卓',
    url: '/EatKun-main/index.html',
    description: '类似于钢琴块，但是明卓',
  },
  {
    name: '明卓跑酷',
    url: '/jump play/index.html',
    description: '一个没完成的小游戏',
  },
  {
    name: '我的大学',
    url: 'https://www.hfut.edu.cn/',
    description: '合肥工业大学',
  },
]

// 侧栏布局：部件 id 对应 components/widget 下的组件
export const layoutConfig: LayoutConfig = {
  sidebar: {
    top: ['profile'],
    sticky: ['categories', 'tags', 'links'],
  },
}
