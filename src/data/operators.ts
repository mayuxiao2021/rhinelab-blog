export interface RhineOperator {
  slug: string
  code: string
  cn: string
  en: string
  profession: string
  professionEn: string
  rarity: number
  role: string
  tags: string[]
  note: string
  card: string
  art: string
  link: string
}

export const rhineOperators: RhineOperator[] = [
  {
    slug: 'saria',
    code: 'RL-01',
    cn: '塞雷娅',
    en: 'SARIA',
    profession: '重装',
    professionEn: 'DEFENDER',
    rarity: 6,
    role: '防卫科主任',
    tags: ['钙质化', '源石技艺', '防卫科'],
    note: '把「守住」当成实验条件来验证的人。她的盾不是墙，是一条被反复校准的边界。',
    card: '/rhine/art/card-saria.webp',
    art: '/rhine/art/art-saria.webp',
    link: 'https://arknights.wiki.gg/wiki/Saria',
  },
  {
    slug: 'silence',
    code: 'RL-02',
    cn: '赫默',
    en: 'SILENCE',
    profession: '医疗',
    professionEn: 'MEDIC',
    rarity: 5,
    role: '研究科 · 临床',
    tags: ['临床', '研究科', '无人机'],
    note: '记录比结论更重要。她习惯先把每一次失败写清楚，再谈能不能治好。',
    card: '/rhine/art/card-silence.webp',
    art: '/rhine/art/art-silence.webp',
    link: 'https://arknights.wiki.gg/wiki/Silence',
  },
  {
    slug: 'ifrit',
    code: 'RL-03',
    cn: '伊芙利特',
    en: 'IFRIT',
    profession: '术师',
    professionEn: 'CASTER',
    rarity: 6,
    role: '特殊实验体',
    tags: ['炎魔计划', '源石技艺', '实验体'],
    note: '档案里她的编号被涂改过三次。火焰是真的，被烧掉的记录也是真的。',
    card: '/rhine/art/card-ifrit.webp',
    art: '/rhine/art/art-ifrit.webp',
    link: 'https://arknights.wiki.gg/wiki/Ifrit',
  },
  {
    slug: 'ptilopsis',
    code: 'RL-04',
    cn: '白面鸮',
    en: 'PTILOPSIS',
    profession: '医疗',
    professionEn: 'MEDIC',
    rarity: 5,
    role: '数据接口 · 神经',
    tags: ['数据接口', '神经', '医疗'],
    note: '她说话像在读取一份永远差最后一行校验的报告。停顿不是犹豫，是同步。',
    card: '/rhine/art/card-ptilopsis.webp',
    art: '/rhine/art/art-ptilopsis.webp',
    link: 'https://arknights.wiki.gg/wiki/Ptilopsis',
  },
  {
    slug: 'mayer',
    code: 'RL-05',
    cn: '梅尔',
    en: 'MAYER',
    profession: '辅助',
    professionEn: 'SUPPORTER',
    rarity: 5,
    role: '机械工程 · 米波',
    tags: ['机械工程', '米波', '工坊'],
    note: '如果一台机器不肯工作，她会先检查自己有没有把「耐心」也焊进电路里。',
    card: '/rhine/art/card-mayer.webp',
    art: '/rhine/art/art-mayer.webp',
    link: 'https://arknights.wiki.gg/wiki/Mayer',
  },
  {
    slug: 'magallan',
    code: 'RL-06',
    cn: '麦哲伦',
    en: 'MAGALLAN',
    profession: '辅助',
    professionEn: 'SUPPORTER',
    rarity: 6,
    role: '极地科考 · 无人机',
    tags: ['极地科考', '无人机', '测绘'],
    note: '她带回来的不是样本，是一整套关于「远方」的坐标。',
    card: '/rhine/art/card-magallan.webp',
    art: '/rhine/art/art-magallan.webp',
    link: 'https://arknights.wiki.gg/wiki/Magallan',
  },
  {
    slug: 'dorothy',
    code: 'RL-07',
    cn: '多萝西',
    en: 'DOROTHY',
    profession: '特种',
    professionEn: 'SPECIALIST',
    rarity: 6,
    role: '实验设计 · 陷阱',
    tags: ['实验设计', '源石技艺', '陷阱'],
    note: '她把「可能性」做成可以摆放的装置，然后站在旁边，等实验结果自己走过来。',
    card: '/rhine/art/card-dorothy.webp',
    art: '/rhine/art/art-dorothy.webp',
    link: 'https://arknights.wiki.gg/wiki/Dorothy',
  },
  {
    slug: 'muelsyse',
    code: 'RL-08',
    cn: '缪尔赛思',
    en: 'MUELSYSE',
    profession: '先锋',
    professionEn: 'VANGUARD',
    rarity: 6,
    role: '生态科 · 水',
    tags: ['生态', '水', '莱茵生命'],
    note: '水会记得它流过的容器。她说，档案也是。',
    card: '/rhine/art/card-muelsyse.webp',
    art: '/rhine/art/art-muelsyse.webp',
    link: 'https://arknights.wiki.gg/wiki/Muelsyse',
  },
]

export const getOperator = (slug: string) => rhineOperators.find(operator => operator.slug === slug)
