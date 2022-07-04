import * as bcrypt from "bcrypt"

const SALT = 10;

export function encodePassword(rawPwd: string) {
    return bcrypt.hashSync(rawPwd, SALT);
}
