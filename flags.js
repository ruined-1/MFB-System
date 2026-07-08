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


const RoleIds = ({
  [Flags.Invalid]: null,

  [Flags.User]: "1520583350136606722",
  [Flags.Mod]: "1520632040116981831",
  [Flags.Admin]: "1520577819816497182",
  [Flags.Director]: "1520631787070554182",
  [Flags.CommunityManager]: "1520577654841938080",
  [Flags.Developer]: "1139945088957554721",
  [Flags.Owner]: "1385653102476263565",
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
  return Flags.Invalid;
}

export function IsModOrHigher(userFlags) {
  return hasRoleOrHigher(userFlags, Flags.Mod);
}

export function IsAdminOrHigher(userFlags) {
  return hasRoleOrHigher(userFlags, Flags.Admin);
}

export function IsDirectorOrHigher(userFlags) {
  return hasRoleOrHigher(userFlags, Flags.Director);
}

export function IsCommunityManagerOrHigher(userFlags) {
  return hasRoleOrHigher(userFlags, Flags.CommunityManager);
}

export function IsDeveloperOrHigher(userFlags) {
  return hasRoleOrHigher(userFlags, Flags.Developer);
}

export function IsOwner(userFlags) {
  return hasFlag(userFlags, Flags.Owner);
}

export function getRoleId(flag) {
  return RoleIds[flag] ?? null;
}