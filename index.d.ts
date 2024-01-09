export type ErrorType = undefined | string | Error | null;

export interface UserCreationArgs {
  username: string;
  create_home: boolean;
  shell?: string | null;
  home_dir?: string;
  expiredate?: string | Date;
  skel?: string;
  system?: boolean;
  selinux_user?: boolean;
  other_args?: string;
}

export interface UserInfo {
  username: string;
  password: string;
  uid: number;
  gid: number;
  fullname: string;
  homedir: string;
  shell: string;
}

export interface GroupInfo {
  groupname: string;
  password: string;
  gid: number;
  members: string[];
}

export interface UserExpirationInfo {
  changed: Date;
  passwordExpires: null | Date;
  inactive: null | Date;
  accountExpires: null | Date;
  minDays: number;
  maxDays: number;
  warnDays: number;
}

export interface UserExpirationEditArgs {
  lastday: Date | string;
  expiredate: Date | string;
  inactive: Date | string;
  minDays: number;
  maxDays: number;
  warnDays: number;
}

export default class LinuxUser {
  static addUser(
    args: UserCreationArgs | string,
    callback: (error: ErrorType, user?: UserInfo | null) => void
  ): void;
  static removeUser(
    username: string,
    callback: (error: ErrorType) => void
  ): void;
  static getUserGroups(
    username: string,
    callback: (error: ErrorType, groups?: string[]) => void
  ): void;
  static getUsers(
    callback: (error: ErrorType, users?: UserInfo[]) => void
  ): void;
  static getUserInfo(
    username: string,
    callback: (error: ErrorType, user?: UserInfo) => void
  ): void;
  static setPassword(
    username: string,
    password: string,
    callback: (error: ErrorType) => void
  ): void;
  static addGroup(
    groupName: string,
    callback: (error: ErrorType, group?: GroupInfo | null) => void
  ): void;
  static removeGroup(
    groupName: string,
    callback: (error: ErrorType) => void
  ): void;
  static getGroups(
    callback: (error: ErrorType, groups?: GroupInfo[]) => void
  ): void;
  static getGroupInfo(
    groupName: string,
    callback: (error: ErrorType, group?: GroupInfo | null) => void
  ): void;
  static addUserToGroup(
    username: string,
    groupName: string,
    callback: (error: ErrorType) => void
  ): void;
  static getExpiration(
    username: string,
    callback: (error: ErrorType, data?: UserExpirationInfo) => void
  ): void;
  static setExpiration(
    username: string,
    args: UserExpirationEditArgs,
    callback: (error: ErrorType, data: any) => void
  ): void;
  static verifySSHKey(
    key: string,
    callback: (error: ErrorType, done?: boolean) => void
  ): void;
  static addSSHtoUser(
    username: string,
    key: string,
    callback: (error: ErrorType, done?: boolean) => void
  ): void;
  static validateUsername(username: string): boolean;
}
