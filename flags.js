export const Flags = {
  Invalid: 0, // 0

  User: 1 << 0, // 1
  Mod: 1 << 1, // 2
  Admin: 1 << 2, // 4
  Director: 1 << 3, // 8
  CommunityManager: 1 << 4, // 16
  Developer: 1 << 5, // 32
  Owner: 1 << 6, // 64
};


export const RoleIds = ({
  [Flags.Invalid]: null,

  [Flags.User]: "1139945613035847750",
  [Flags.Mod]: "1139945562314129438",
  [Flags.Admin]: "1139945433192476702",
  [Flags.Director]: "1487503432549138503",
  [Flags.CommunityManager]: "1139954764868763768",
  [Flags.Developer]: "1139945088957554721",
  [Flags.Owner]: "1268309914858557562",
});

const RoleHierarchy = [
  Flags.Owner,
  Flags.Developer,
  Flags.CommunityManager,
  Flags.Director,
  Flags.Admin,
  Flags.Mod,
  Flags.User,
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