import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from '@constants/constants'

export type SiteConfig = {
  title: string
  subtitle: string

  lang: string

  themeColor: {
    hue: number
    fixed: boolean
  }
  banner: {
    enable: boolean
    src: string
    position?: string
    credit: {
      enable: boolean
      text: string
      url?: string
    }
  }

  favicon: Favicon[]
}

export type Favicon = {
  src: string
  theme?: 'light' | 'dark'
  sizes?: string
}

export enum LinkPreset {
  Home = 0,
  Archive = 1,
  About = 2,
}

export type NavBarLink = {
  name: string
  url: string
  external?: boolean
}

export type NavBarConfig = {
  links: (NavBarLink | LinkPreset)[]
}

export type ProfileConfig = {
  avatar?: string
  name: string
  bio?: string
  links: {
    name: string
    url: string
    icon: string
  }[]
}

export type LicenseConfig = {
  enable: boolean
  name: string
  url: string
}

export type LIGHT_DARK_MODE =
  | typeof LIGHT_MODE
  | typeof DARK_MODE
  | typeof AUTO_MODE

/** 侧栏可配置的部件 id（对应 components/widget 下的组件） */
export type SidebarWidgetId = 'profile' | 'categories' | 'tags' | 'links'

export type LayoutConfig = {
  sidebar: {
    /** 顶部（不吸顶）区域部件顺序 */
    top: SidebarWidgetId[]
    /** 吸顶区域部件顺序 */
    sticky: SidebarWidgetId[]
  }
}
