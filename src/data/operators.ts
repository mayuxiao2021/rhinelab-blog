export type RhineDivisionKey = 'defense' | 'clinical' | 'ecology' | 'engineering'

export interface RhineOperatorMetric {
  label: string
  value: number
}

export interface RhineOperator {
  slug: string
  code: string
  cn: string
  en: string
  profession: string
  professionEn: string
  rarity: number
  role: string
  division: string
  divisionKey: RhineDivisionKey
  clearance: string
  tags: string[]
  note: string
  redacted: string
  metrics: RhineOperatorMetric[]
  relatedSlug: string
  relatedTitle: string
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
    division: 'DEFENSE / 防卫科',
    divisionKey: 'defense',
    clearance: 'LV.5 · 前防卫科主任',
    tags: ['钙质化', '源石技艺', '防卫科'],
    note: '把「守住」当成实验条件来验证的人。她的盾不是墙，是一条被反复校准的边界。',
    redacted: '【内部批注】防卫科最高权限密钥仍未注销；钙质化立场在实机对抗压力测试中呈零衰减。',
    metrics: [
      { label: 'BOUNDARY / 边界防护', value: 98 },
      { label: 'CALCIFICATION / 钙质结晶', value: 95 },
      { label: 'AUDIT RIGOR / 校验强度', value: 94 },
    ],
    relatedSlug: 'campus-running-app-audit',
    relatedTitle: '某校园跑步 App 安卓客户端安全审计：从静态还原到实机验证',
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
    division: 'CLINICAL / 结构与临床',
    divisionKey: 'clinical',
    clearance: 'LV.4 · 专项研究员',
    tags: ['临床', '研究科', '无人机'],
    note: '记录比结论更重要。她习惯先把每一次失败写清楚，再谈能不能治好。',
    redacted: '【内部批注】要求所有临床原始日志执行二级脱敏后再入库，严禁任何未授权样本外流。',
    metrics: [
      { label: 'CLINICAL / 临床还原', value: 93 },
      { label: 'SANITIZE / 样本脱敏', value: 96 },
      { label: 'DRONE SYNC / 无人机协同', value: 89 },
    ],
    relatedSlug: 'logcat-sanitize-pipeline',
    relatedTitle: '从零搭一条 Android logcat 脱敏抓取管线',
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
    division: 'CLINICAL / 重点监护组',
    divisionKey: 'clinical',
    clearance: 'LV.S · 封存样本',
    tags: ['炎魔计划', '源石技艺', '实验体'],
    note: '档案里她的编号被涂改过三次。火焰是真的，被烧掉的记录也是真的。',
    redacted: '【涂改记录】原实验批次号已由防卫科与临床组联合销毁，仅保留当前恢复阶段遥测。',
    metrics: [
      { label: 'THERMAL / 热能峰值', value: 99 },
      { label: 'VOLATILITY / 波动系数', value: 91 },
      { label: 'CONTAINMENT / 抑制稳定', value: 82 },
    ],
    relatedSlug: 'campus-running-app-audit',
    relatedTitle: '某校园跑步 App 安卓客户端安全审计：从静态还原到实机验证',
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
    division: 'CLINICAL / 数据与神经',
    divisionKey: 'clinical',
    clearance: 'LV.4 · 数据维护员',
    tags: ['数据接口', '神经', '医疗'],
    note: '她说话像在读取一份永远差最后一行校验的报告。停顿不是犹豫，是同步。',
    redacted: '【内部批注】底层日志流存在 256KiB 环形缓冲区溢出痕迹，已切换为守护进程流式转储。',
    metrics: [
      { label: 'THROUGHPUT / 吞吐同步', value: 97 },
      { label: 'PARSING / 结构化解析', value: 95 },
      { label: 'LATENCY / 响应抑制', value: 90 },
    ],
    relatedSlug: 'logcat-sanitize-pipeline',
    relatedTitle: '从零搭一条 Android logcat 脱敏抓取管线',
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
    division: 'ENGINEERING / 鲁特拉工坊',
    divisionKey: 'engineering',
    clearance: 'LV.4 · 首席工程师',
    tags: ['机械工程', '米波', '工坊'],
    note: '如果一台机器不肯工作，她会先检查自己有没有把「耐心」也焊进电路里。',
    redacted: '【内部批注】一人编制独立维护全套自动化组装与18步自检流水线，工坊能耗冗余 92%。',
    metrics: [
      { label: 'AUTOMATION / 自动装配', value: 96 },
      { label: 'MODULARITY / 模块解耦', value: 93 },
      { label: 'FIELD REPAIR / 现场重构', value: 91 },
    ],
    relatedSlug: 'guide',
    relatedTitle: 'Simple Guides for Fuwari',
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
    division: 'ECOLOGY / 极地科考站',
    divisionKey: 'ecology',
    clearance: 'LV.4 · 外勤科考员',
    tags: ['极地科考', '无人机', '测绘'],
    note: '她带回来的不是样本，是一整套关于「远方」的坐标。',
    redacted: '【内部批注】极地遥测信标在离线状态下依旧可维持本地缓存与增量坐标回传。',
    metrics: [
      { label: 'TELEMETRY / 远测覆盖', value: 97 },
      { label: 'ENDURANCE / 极境续航', value: 94 },
      { label: 'CARTOGRAPHY / 坐标测绘', value: 95 },
    ],
    relatedSlug: 'markdown-extended',
    relatedTitle: 'Markdown Extended Features',
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
    role: '源石技艺应用科主任',
    division: 'ENGINEERING / 源石技艺应用科',
    divisionKey: 'engineering',
    clearance: 'LV.5 · 应用科主任',
    tags: ['实验设计', '源石技艺', '陷阱'],
    note: '她把「可能性」做成可以摆放的装置，然后站在旁边，等实验结果自己走过来。',
    redacted: '【内部批注】在测试场布设的共振触发阵列全部通过静态还原与实机双盲校验。',
    metrics: [
      { label: 'RESONANCE / 共振精度', value: 96 },
      { label: 'ARRAY DESIGN / 阵列设计', value: 98 },
      { label: 'ETHICS BOUND / 边界收敛', value: 87 },
    ],
    relatedSlug: 'campus-running-app-audit',
    relatedTitle: '某校园跑步 App 安卓客户端安全审计：从静态还原到实机验证',
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
    role: '生态科主任 · 水',
    division: 'ECOLOGY / 生态科',
    divisionKey: 'ecology',
    clearance: 'LV.5 · 生态科主任',
    tags: ['生态', '水', '莱茵生命'],
    note: '水会记得它流过的容器。她说，档案也是。',
    redacted: '【内部批注】温室流体同位素标记与主档案库保持实时镜像，形态可随容器自适应迁移。',
    metrics: [
      { label: 'ADAPTATION / 形态拟合', value: 99 },
      { label: 'HYDRO-SYNC / 流体镜像', value: 96 },
      { label: 'BIOSPHERE / 生态亲和', value: 95 },
    ],
    relatedSlug: 'logcat-sanitize-pipeline',
    relatedTitle: '从零搭一条 Android logcat 脱敏抓取管线',
    card: '/rhine/art/card-muelsyse.webp',
    art: '/rhine/art/art-muelsyse.webp',
    link: 'https://arknights.wiki.gg/wiki/Muelsyse',
  },
]

export const getOperator = (slug: string) => rhineOperators.find(operator => operator.slug === slug)
