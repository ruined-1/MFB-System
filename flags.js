export const Flags = {
  INVALID: 0,

  USER: 1 << 0,
  MOD: 1 << 1,
  ADMIN: 1 << 2,
  DIRECTOR: 1 << 3,
  COMMUNITY_MANAGER: 1 << 4,
  DEVELOPER: 1 << 5,
  OWNER: 1 << 6,
};


export const RoleIds = ({
  [Flags.INVALID]: null,

  [Flags.USER]: "1139945613035847750",
  [Flags.MOD]: "1139945562314129438",
  [Flags.ADMIN]: "1139945433192476702",
  [Flags.DIRECTOR]: "1487503432549138503",
  [Flags.COMMUNITY_MANAGER]: "1139954764868763768",
  [Flags.DEVELOPER]: "1139945088957554721",
  [Flags.OWNER]: "1268309914858557562",
});

const RoleHierarchy = [
  Flags.OWNER,
  Flags.DEVELOPER,
  Flags.COMMUNITY_MANAGER,
  Flags.DIRECTOR,
  Flags.ADMIN,
  Flags.MOD,
  Flags.USER,
];


export function hasFlag(userFlags, flag) {
  return (userFlags & flag) !== 0;
}

export function addFlag(userFlags, flag) {
  return userFlags | flag;
}

export function removeFlag(userFlags, flag) {
  return userFlags & ~flag;
}

export function hasRoleOrHigher(userFlags, targetFlag) {
  const index = RoleHierarchy.indexOf(targetFlag);
  if (index === -1) return false;

  for (let i = 0; i <= index; i++) {
    if (userFlags & RoleHierarchy[i]) return true;
  }

  return false;
}

export function getHighestRole(userFlags) {
  for (const role of RoleHierarchy) {
    if (userFlags & role) return role;
  }
  return Flags.INVALID;
}


export function getRoleId(flag) {
  return RoleIds[flag] ?? null;
}