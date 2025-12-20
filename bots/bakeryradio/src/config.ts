import * as path from 'node:path';

export const IS_WINDOWS = process.platform === 'win32';
export const SLASH = IS_WINDOWS ? '\\' : '/';
export const SAVE_FILE = path.resolve('.') + SLASH + 'save.json';
export const TOKEN = 'token was here, but i won\'t give you the token; don\'t hope i\'ll do so';
export const RADIO_COMMANDS_CHANNEL = "1235604839078035537";
export const RADIO_CHANNEL = "1400854386753798216";
export const PIEKARNIA_AD = '💎 Szukasz radia na swój serwer Discord? Skontaktuj się z administratorami Piekarnii Eklerki: <https://discord.gg/aEyZS3nMDE>';
