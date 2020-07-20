export const CONFIG : any = {};

CONFIG.attributes = {
    bra: 'CONAN.attributes.bra',
    agi: 'CONAN.attributes.agi',
    awa: 'CONAN.attributes.awa',
    coo: 'CONAN.attributes.coo',
    int: 'CONAN.attributes.int',
    wil: 'CONAN.attributes.wil',
    per: 'CONAN.attributes.per'
};

CONFIG.skills = {
    acr: 'CONAN.skills.acr',
    mel: 'CONAN.skills.mel',
    ste: 'CONAN.skills.ste',
    ins: 'CONAN.skills.ins',
    obs: 'CONAN.skills.obs',
    sur: 'CONAN.skills.sur',
    thi: 'CONAN.skills.thi',
    ath: 'CONAN.skills.ath',
    res: 'CONAN.skills.res',
    par: 'CONAN.skills.par',
    ran: 'CONAN.skills.ran',
    sai: 'CONAN.skills.sai',
    alc: 'CONAN.skills.alc',
    cra: 'CONAN.skills.cra',
    hea: 'CONAN.skills.hea',
    lin: 'CONAN.skills.lin',
    lor: 'CONAN.skills.lor',
    war: 'CONAN.skills.war',
    ani: 'CONAN.skills.ani',
    com: 'CONAN.skills.com',
    cou: 'CONAN.skills.cou',
    per: 'CONAN.skills.per',
    soc: 'CONAN.skills.soc',
    dis: 'CONAN.skills.dis',
    sor: 'CONAN.skills.sor'
};

CONFIG.rollDifficultyLevels = {
    1: 'CONAN.skillRollDifficultyLevels.1',
    2: 'CONAN.skillRollDifficultyLevels.2',
    3: 'CONAN.skillRollDifficultyLevels.3',
    4: 'CONAN.skillRollDifficultyLevels.4',
    5: 'CONAN.skillRollDifficultyLevels.5'
};

CONFIG.skillRollResourceSpends = {
    momentum: 'CONAN.skillRollResourceSpends.mome',
    doom: 'CONAN.skillRollResourceSpends.doom'
};

CONFIG.rollResults = {
    success: "CONAN.skillRollSuccess",
    failure: "CONAN.skillRollFailure",
};

CONFIG.encumbranceTypes = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  "1each": 'CONAN.encumbrance1Each'
};

CONFIG.attacks = {
    weapon: 'CONAN.attackTypes.weapon',
    display: 'CONAN.attackTypes.display'
};

CONFIG.availabilityTypes = {
  common: 'CONAN.traitCommon',
  uncommon: 'CONAN.traitUncommon',
  rare: 'CONAN.traitRare',
  unique: 'CONAN.traitUnique'
};

CONFIG.naturesTypes = {
    cautious: 'CONAN.natures.cautious',
    curious: 'CONAN.natures.curious',
    inspirational: 'CONAN.natures.inspirational',
    learned: 'CONAN.natures.learned',
    practical: 'CONAN.natures.practical',
    scheming: 'CONAN.natures.scheming',
    sneaky: 'CONAN.natures.sneaky',
    stoic: 'CONAN.natures.stoic',
    supportive: 'CONAN.natures.supportive',
    wrathful: 'CONAN.natures.wrathful'
};

CONFIG.coverageTypes = {
    head: 'CONAN.coverage.head',
    torso: 'CONAN.coverage.torso',
    larm: 'CONAN.coverage.larm',
    rarm: 'CONAN.coverage.rarm',
    lleg: 'CONAN.coverage.lleg',
    rleg: 'CONAN.coverage.rleg'
};

CONFIG.armorTypes = {
    heavyCloth: 'CONAN.armorTypes.heavycloth',
    lightArmor: 'CONAN.armorTypes.lightarmor',
    heavyArmor: 'CONAN.armorTypes.heavyarmor',
    veryHeavyRrmor: 'CONAN.armorTypes.vheavyarmor'
};

CONFIG.armorQualities = {
    heavy: 'CONAN.qualities.armor.heav',
    noisy: 'CONAN.qualities.armor.nois',
    veryHeavy: 'CONAN.qualities.armor.very'
};

CONFIG.actionTypes = {
    passive: 'CONAN.actionPassive',
    free: 'CONAN.actionFree',
    minor: 'CONAN.actionMinor',
    standard: 'CONAN.actionStandard',
    reaction: 'CONAN.actionReaction'
};

CONFIG.freeActions = {
    adjust: 'CONAN.actions.free.adj',
    dropItem: 'CONAN.actions.free.dro',
    dropProne: 'CONAN.actions.free.pro',
    simpleTask: 'CONAN.actions.free.sim',
    speak: 'CONAN.actions.free.spe'
};

CONFIG.minorActions = {
    clear: 'CONAN.actions.minor.cle',
    drawItem: 'CONAN.actions.minor.dra',
    movement: 'CONAN.actions.minor.mov',
    regainGuard: 'CONAN.actions.minor.reg',
    stand: 'CONAN.actions.minor.sta',
};

CONFIG.standardActions = {
    assist: 'CONAN.actions.standard.ass',
    attack: 'CONAN.actions.standard.att',
    brace: 'CONAN.actions.standard.bra',
    exploit: 'CONAN.actions.standard.exp',
    pass: 'CONAN.actions.standard.pas',
    ready: 'CONAN.actions.standard.rea',
    recover: 'CONAN.actions.standard.rec',
    skillTest: 'CONAN.actions.standard.ski',
    sprint: 'CONAN.actions.standard.spr',
    treatment: 'CONAN.actions.standard.tre',
    withdraw: 'CONAN.actions.standard.wit'
};

CONFIG.reactionActions = {
    defend: 'CONAN.actions.reaction.def',
    protect: 'CONAN.actions.reaction.pro',
    retaliate: 'CONAN.actions.reaction.ret'
};

CONFIG.actionCategories = {
    defensive: 'CONAN.talentCategories.def',
    offensive: 'CONAN.talentCategories.off',
    interaction: 'CONAN.talentCategories.int'
};

CONFIG.actionCount = {
    1: 'CONAN.actionCount.1',
    2: 'CONAN.actionCount.2',
    '1r': 'CONAN.actionCount.1r'
};

CONFIG.languages = {
    afghuli: 'CONAN.languages.afgh',
    argossean: 'CONAN.languages.argo',
    aquilonian: 'CONAN.languages.aqui',
    brythunian: 'CONAN.languages.bryt',
    corinthian: 'CONAN.languages.cori',
    cimmerian:  'CONAN.languages.cimm',
    darfari: 'CONAN.languages.darf',
    hyperborean: 'CONAN.languages.hype',
    hyrkanian: 'CONAN.languages.hyrk',
    iranistani: 'CONAN.languages.iran',
    keshani: 'CONAN.languages.kesh',
    kothic: 'CONAN.languages.koth',
    kushite: 'CONAN.languages.kush',
    nemedian: 'CONAN.languages.neme',
    nordheimer: 'CONAN.languages.nord',
    ophirian: 'CONAN.languages.ophi',
    punt: 'CONAN.languages.punt',
    shemitish:  'CONAN.languages.shem',
    stygian: 'CONAN.languages.styg',
    turanian: 'CONAN.languages.tura',
    vendhyan: 'CONAN.languages.vend',
    zembabwein: 'CONAN.languages.zemb'
};

CONFIG.talentRanks = {
    1: 1,
    2: 2,
    3: 3
};

CONFIG.talentTypes = {
    homeland: 'CONAN.talentTypes.homeland',
    caste: 'CONAN.talentTypes.caste',
    bloodline: 'CONAN.talentTypes.bloodline',
    education: 'CONAN.talentTypes.education',
    nature: 'CONAN.talentTypes.nature',
    archetype: 'CONAN.talentTypes.archetype',
    other: 'CONAN.talentTypes.other'
};

CONFIG.weaponQualities = {
    area: 'CONAN.qualities.weapons.area',
    backlash: 'CONAN.qualities.weapons.back',
    blinding: 'CONAN.qualities.weapons.blin',
    cavalry: 'CONAN.qualities.weapons.cava',
    fearsome: 'CONAN.qualities.weapons.fear',
    fragile: 'CONAN.qualities.weapons.frag',
    grappling: 'CONAN.qualities.weapons.grap',
    hidden: 'CONAN.qualities.weapons.hidd',
    improvised: 'CONAN.qualities.weapons.impr',
    incendiary: 'CONAN.qualities.weapons.ince',
    intense: 'CONAN.qualities.weapons.inte',
    knockdown: 'CONAN.qualities.weapons.knoc',
    nonlethal: 'CONAN.qualities.weapons.nonl',
    parrying: 'CONAN.qualities.weapons.parr',
    persistent: 'CONAN.qualities.weapons.pers',
    piercing: 'CONAN.qualities.weapons.pier',
    shield: 'CONAN.qualities.weapons.shie',
    spread: 'CONAN.qualities.weapons.spre',
    stun: 'CONAN.qualities.weapons.stun',
    subtle: 'CONAN.qualities.weapons.subt',
    thrown: 'CONAN.qualities.weapons.thro',
    unforgiving: 'CONAN.qualities.weapons.unfo',
    vicious: 'CONAN.qualities.weapons.vici',
    volley: 'CONAN.qualities.weapons.voll'
};

CONFIG.weaponGroups = {
    axe: 'CONAN.weaponGroup.axe',
    bow: 'CONAN.weaponGroup.bow',
    club: 'CONAN.weaponGroup.clu',
    crossbow: 'CONAN.weaponGroup.cro',
    dagger: 'CONAN.weaponGroup.dag',
    dirk: 'CONAN.weaponGroup.dir',
    flail: 'CONAN.weaponGroup.fla',
    flexile: 'CONAN.weaponGroup.fle',
    hammer: 'CONAN.weaponGroup.ham',
    improvised: 'CONAN.weaponGroup.imp',
    pick: 'CONAN.weaponGroup.pic',
    polearm: 'CONAN.weaponGroup.pol',
    shield: 'CONAN.weaponGroup.shi',
    sling: 'CONAN.weaponGroup.sli',
    sword: 'CONAN.weaponGroup.swo',
    spear: 'CONAN.weaponGroup.spe'
};

CONFIG.weaponTypes = {
    melee: 'CONAN.weaponTypes.melee',
    ranged: 'CONAN.weaponTypes.ranged'
};

CONFIG.weaponSizes = {
    oneHanded: 'CONAN.weaponSizes.1h',
    twoHanded: 'CONAN.weaponSizes.2h',
    unbalanced: 'CONAN.weaponSizes.ub',
    unwieldy: 'CONAN.weaponSizes.uw',
    fixed: 'CONAN.weaponSizes.fi',
    monstrous: 'CONAN.weaponSizes.mo'
};

CONFIG.weaponReaches = {
    1: "1",
    2: "2",
    3: "3",
    4: "4"
};

CONFIG.weaponRanges = {
    close: "CONAN.weaponRanges.c",
    medium: "CONAN.weaponRanges.m",
    long: "CONAN.weaponRanges.l"
};

CONFIG.displayDamageDice = {
    x: 'X'
};

CONFIG.damageDice = {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9'
};
