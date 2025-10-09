import fs from 'fs';
import path from 'path';

const H = 0.5;
const E = 2/3;
const e = 1 - E;
const letters = [
  {
    char: 'g',
    paths: [
      [[0,0], [1,0], [1,1]]
    ]
  },
  {
    char: 'n',
    paths: [
      [[0,0], [0,1], [1,1]]
    ]
  },
  {
    char: 'm',
    paths: [
      [[1,0], [1,1], [0,1]]
    ]
  },
  {
    char: 's',
    paths: [
      [[1,0], [0,0], [0,1]]
    ]
  },
  {
    char: 'd',
    paths: [
      [[0,0], [0,1], [1,1]],
      [[1,0], [1,e]],
    ]
  },
  {
    char: 'v',
    paths: [
      [[1,0], [1,1], [0,1]],
      [[0,0], [0,e]],
    ]
  },
  {
    char: 'z',
    paths: [
      [[1,0], [0,0], [0,1]],
      [[1,1], [1,E]],
    ]
  },
  {
    char: 'l',
    paths: [
      [[0,0], [0,1], [1,1]],
      [[1,0], [E,0]],
    ]
  },
  {
    char: 'x',
    paths: [
      [[1,0], [0,0], [0,1]],
      [[1,1], [E,1]],
    ]
  },
  {
    char: 'k',
    paths: [
      [[0,0], [1,0], [1,1]],
      [[0,E], [0,1]],
      [[H,E], [H,1]],
    ]
  },
  {
    char: 't',
    paths: [
      [[0,0], [0,1], [1,1]],
      [[1,0], [1,e]],
      [[H,e], [H,0]],
    ]
  },
  {
    char: 'q',
    paths: [
      [[1,0], [0,0], [0,1]],
      [[1,1], [1,E]],
      [[H,E], [H,1]],
    ]
  },
  {
    char: 'p',
    paths: [
      [[1,0], [1,1], [0,1]],
      [[0,0], [0,e]],
      [[H,e], [H,0]],
    ]
  },
  {
    char: 'h',
    paths: [
      [[0,0], [0,1], [H,1], [H,0], [1,0], [1,1]]
    ]
  },
  {
    char: 'r',
    paths: [
      [[0,0], [1,0], [1,H], [0,H], [0,1], [1,1]]
    ]
  },
  {
    char: 'f',
    paths: [
      [[0,0], [0,1], [1,1], [1,0]]
    ]
  },
  {
    char: 'c',
    paths: [
      [[1,0], [0,0], [0,1], [1,1]]
    ]
  },
  {
    char: 'a',
    paths: [
      [[1,0], [1,1]],
      [[0,H], [1,H]]
    ],
    type: 'a'
  },
  {
    char: 'y',
    paths: [
      [[0,0], [0,1]],
      [[0,H], [1,H]]
    ],
    type: 'a'
  },
  {
    char: 'o',
    paths: [
      [[0,0], [1,0]],
      [[H,0], [H,1]]
    ],
    type: 'o'
  },
  {
    char: 'u',
    paths: [
      [[0,1], [1,1]],
      [[H,0], [H,1]]
    ],
    type: 'o'
  },
  {
    char: 'i',
    paths: [
      [[0,H], [1,H]]
    ],
    altPaths: [
      [[H,0], [H,1]],
    ],
    type: 'a'
  },
  {
    char: 'e',
    paths: [
      [[0,0], [1,0]],
      [[0,1], [1,1]]
    ],
    type: 'a'
  },
]

function resizePath(path, width, height) {
  return path.map(([x, y]) => [x * width, y * height]);
}

function pathToString(path) {
  return path.map(([x, y]) => `${x},${y}`).join(' ');
}

function positionPath(path, xOffset, yOffset) {
  return path.map(([x, y]) => [x + xOffset, y + yOffset]);
}

function formPath(path, width, height, xOffset, yOffset) {
  path = resizePath(path, width, height);
  path = positionPath(path, xOffset, yOffset);
  return path;
}

const SIZE = 14;
const PADDING = 2;
const GAP = 2;
const COLOR = '#373a3c';
const STROKE_WIDTH = 1;
const STROKE_LINECAP = "square";
const STROKE_LINEJOIN = "miter";
const WIDTH = SIZE;
const HEIGHT = SIZE;

function parseBoolean(value, defaultValue) {
  if (value === undefined) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return !['0', 'false', 'no', 'off'].includes(normalized);
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (!key) continue;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const MEDIAWIKI_REQUIRED_VARS = ['MEDIAWIKI_API_URL', 'MEDIAWIKI_USERNAME', 'MEDIAWIKI_PASSWORD'];

function loadMediaWikiConfig() {
  if (parseBoolean(process.env.MEDIAWIKI_UPLOAD_ENABLED ?? 'true', true) === false) {
    return { enabled: false, reason: 'Disabled via MEDIAWIKI_UPLOAD_ENABLED' };
  }

  const missing = MEDIAWIKI_REQUIRED_VARS.filter(key => !(process.env[key] && process.env[key].trim().length > 0));
  if (missing.length > 0) {
    return { enabled: false, reason: `Missing env vars: ${missing.join(', ')}` };
  }

  return {
    enabled: true,
    apiUrl: process.env.MEDIAWIKI_API_URL.trim(),
    username: process.env.MEDIAWIKI_USERNAME,
    password: process.env.MEDIAWIKI_PASSWORD,
    filenameTemplate: process.env.MEDIAWIKI_UPLOAD_FILENAME_TEMPLATE ?? '{basename}',
    commentTemplate: process.env.MEDIAWIKI_UPLOAD_COMMENT ?? 'Auto-upload of {basename}',
    textTemplate: process.env.MEDIAWIKI_UPLOAD_TEXT,
    ignoreWarnings: parseBoolean(process.env.MEDIAWIKI_UPLOAD_IGNORE_WARNINGS, true),
  };
}

function applyTemplate(template, context) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      return String(context[key]);
    }
    return '';
  });
}

class MediaWikiClient {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.username = config.username;
    this.password = config.password;
    this.commentTemplate = config.commentTemplate;
    this.textTemplate = config.textTemplate;
    this.filenameTemplate = config.filenameTemplate;
    this.ignoreWarnings = config.ignoreWarnings;
    this.cookies = {};
    this.csrfToken = null;
  }

  async init() {
    if (!globalThis.fetch) {
      throw new Error('fetch is not available in this runtime');
    }
    if (typeof FormData === 'undefined' || typeof Blob === 'undefined') {
      throw new Error('FormData/Blob are required for uploads but not supported in this runtime');
    }

    await this.ensureLogin();
    this.csrfToken = await this.fetchCsrfToken();
  }

  async ensureLogin() {
    if (this.loggedIn) return;
    const loginToken = await this.fetchLoginToken();
    const data = await this.post({
      action: 'login',
      lgname: this.username,
      lgpassword: this.password,
      lgtoken: loginToken,
    });

    const result = data?.login?.result;
    if (result !== 'Success') {
      throw new Error(`MediaWiki login failed: ${result ?? 'Unknown response'}`);
    }
    this.loggedIn = true;
  }

  async fetchLoginToken() {
    const data = await this.post({
      action: 'query',
      meta: 'tokens',
      type: 'login',
    });
    const token = data?.query?.tokens?.logintoken;
    if (!token) {
      throw new Error('Unable to obtain login token');
    }
    return token;
  }

  async fetchCsrfToken() {
    const data = await this.post({
      action: 'query',
      meta: 'tokens',
      type: 'csrf',
    });
    const token = data?.query?.tokens?.csrftoken;
    if (!token) {
      throw new Error('Unable to obtain CSRF token');
    }
    return token;
  }

  buildContext({ localPath, syllable }) {
    const basename = path.basename(localPath);
    return { basename, syllable };
  }

  resolveFilename(context) {
    return applyTemplate(this.filenameTemplate, context) || context.basename;
  }

  resolveComment(context) {
    return this.commentTemplate ? applyTemplate(this.commentTemplate, context) : undefined;
  }

  resolveText(context) {
    return this.textTemplate ? applyTemplate(this.textTemplate, context) : undefined;
  }

  async uploadFile({ localPath, syllable }) {
    if (!this.csrfToken) {
      throw new Error('Client not initialised');
    }

    const context = this.buildContext({ localPath, syllable });
    const remoteFilename = this.resolveFilename(context);
    const comment = this.resolveComment(context);
    const text = this.resolveText(context);
    const fileBuffer = fs.readFileSync(localPath);
    const formData = new FormData();
    formData.set('action', 'upload');
    formData.set('format', 'json');
    formData.set('filename', remoteFilename);
    formData.set('token', this.csrfToken);
    if (comment) formData.set('comment', comment);
    if (text) formData.set('text', text);
    if (this.ignoreWarnings) formData.set('ignorewarnings', '1');
    const blob = new Blob([fileBuffer], { type: 'image/svg+xml' });
    formData.set('file', blob, remoteFilename);

    const response = await this.sendRequest({ body: formData });
    const data = await response.json();
    this.throwOnApiError(response, data);

    const result = data?.upload?.result;
    if (result !== 'Success') {
      throw new Error(`MediaWiki upload failed: ${result ?? 'Unknown response'}`);
    }

    const url = data?.upload?.imageinfo?.descriptionurl;
    console.log(`Uploaded ${remoteFilename}${url ? ` → ${url}` : ''}`);
  }

  async post(params) {
    const body = new URLSearchParams(params);
    if (!body.has('format')) body.set('format', 'json');
    const response = await this.sendRequest({ body });
    const data = await response.json();
    this.throwOnApiError(response, data);
    return data;
  }

  async sendRequest({ body }) {
    const headers = {};
    const cookieHeader = this.getCookieHeader();
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body,
      headers,
    });

    this.captureCookies(response);
    return response;
  }

  captureCookies(response) {
    const headerValues = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : response.headers.raw && response.headers.raw()['set-cookie']
        ? response.headers.raw()['set-cookie']
        : response.headers.get('set-cookie')
          ? [response.headers.get('set-cookie')]
          : [];

    for (const cookie of headerValues) {
      if (!cookie) continue;
      const [pair] = cookie.split(';');
      const [name, value] = pair.split('=');
      if (name && value !== undefined) {
        this.cookies[name.trim()] = value.trim();
      }
    }
  }

  getCookieHeader() {
    const entries = Object.entries(this.cookies);
    if (entries.length === 0) return '';
    return entries.map(([name, value]) => `${name}=${value}`).join('; ');
  }

  throwOnApiError(response, data) {
    if (!response.ok) {
      throw new Error(`MediaWiki API HTTP ${response.status}`);
    }
    if (data && data.error) {
      const info = data.error.info ?? JSON.stringify(data.error);
      throw new Error(`MediaWiki API error: ${info}`);
    }
  }
}

function generatePart(letter, width, height, xOffset, yOffset, options = {}) {
  const { useAltPaths = false } = options;
  const letterPaths = useAltPaths && letter.altPaths ? letter.altPaths : letter.paths;
  const paths = letterPaths.map(path => {
    const resizedPath = resizePath(path, width, height);
    const positionedPath = positionPath(resizedPath, xOffset, yOffset);
    const pathString = pathToString(positionedPath);
    return `<polyline points="${pathString}" fill="none" stroke="${COLOR}" stroke-width="${STROKE_WIDTH}" stroke-linecap="${STROKE_LINECAP}" stroke-linejoin="${STROKE_LINEJOIN}" />`;
  });

  return paths.join('\n');
}

function getUnitPositionSize(x, y, w, h, slice) {
  const unit = (SIZE - PADDING * 2 - GAP * (slice - 1)) / slice;
  const width = unit * w + GAP * (w - 1);
  const height = unit * h + GAP * (h - 1);
  const xOffset = PADDING + (unit + GAP) * x;
  const yOffset = PADDING + (unit + GAP) * y;
  return [width, height, xOffset, yOffset];
}

function shouldUseAltPaths(letter, nucleus) {
  if (!letter.altPaths) return false;
  if (letter.char !== 'i') return false;
  if (!nucleus || nucleus.length < 2) return false;

  const hasTypeO = nucleus.split('').some(char => {
    return char=== 'o';
  });

  return !hasTypeO;
}

function generateSyllable(syllable) {
  const SYLLABLE_RE = /^([gmnsvzdlxktpqhrfc]{0,2})([aiueoy]{0,2})([gmnsvzdlxktpqhrfc]{0,2})$/;
  const match = syllable.match(SYLLABLE_RE);
  if (!match) {
    throw new Error(`Invalid syllable: ${syllable}`);
  }

  const [, onset, nucleus, coda] = match;

  const parts = [];

  console.log(`Generating syllable: ${syllable} (onset: ${onset}, nucleus: ${nucleus}, coda: ${coda})`);

  // 1. C
  if (onset.length === 1 && nucleus.length === 0 && coda.length === 0) {
    console.log('Pattern: C');
    const letter = letters.find(l => l.char === onset);
    if (!letter) {
      throw new Error(`Invalid letter: ${onset}`);
    }

    parts.push(generatePart(
      letter,
      ...getUnitPositionSize(0, 0, 6, 6, 6)
    ));
  }

  // 2. CC
  else if (onset.length === 2 && nucleus.length === 0 && coda.length === 0) {
    console.log('Pattern: CC');
    const letter1 = letters.find(l => l.char === onset[0]);
    const letter2 = letters.find(l => l.char === onset[1]);
    if (!letter1 || !letter2) {
      throw new Error(`Invalid letters: ${onset}`);
    }

    parts.push(generatePart(
      letter1,
      ...getUnitPositionSize(0, 0, 3, 6, 6)
    ));
    parts.push(generatePart(
      letter2,
      ...getUnitPositionSize(3, 0, 3, 6, 6)
    ));
  }

  // 3. V
  else if (onset.length === 0 && nucleus.length === 1 && coda.length === 0) {
    console.log('Pattern: V');
    const letter = letters.find(l => l.char === nucleus);
    if (!letter) {
      throw new Error(`Invalid letter: ${nucleus}`);
    }

    parts.push(generatePart(
      letter,
      ...getUnitPositionSize(0, 0, 6, 6, 6)
    ));
  }

  // 4. CV
  else if (onset.length === 1 && nucleus.length === 1 && coda.length === 0) {
    console.log('Pattern: CV');
    const letterC = letters.find(l => l.char === onset);
    const letterV = letters.find(l => l.char === nucleus);
    if (!letterC || !letterV) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(0, 0, 6, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 4, 6, 2, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(0, 0, 4, 6, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(4, 0, 2, 6, 6)
      ));
    } else {
      throw new Error(`Invalid vowel type: ${nucleus}`);
    }
  }

  // 5. CCV
  else if (onset.length === 2 && nucleus.length === 1 && coda.length === 0) {
    console.log('Pattern: CCV');
    const letterC1 = letters.find(l => l.char === onset[0]);
    const letterC2 = letters.find(l => l.char === onset[1]);
    const letterV = letters.find(l => l.char === nucleus);
    if (!letterC1 || !letterC2 || !letterV) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 3, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(3, 0, 3, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 4, 6, 2, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 3, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 3, 4, 3, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(4, 0, 2, 6, 6)
      ));
    } else {
      throw new Error(`Invalid vowel type: ${nucleus}`);
    }
  }

  // 6. VC
  else if (onset.length === 0 && nucleus.length === 1 && coda.length === 1) {
    console.log('Pattern: VC');
    const letterV = letters.find(l => l.char === nucleus);
    const letterC = letters.find(l => l.char === coda);
    if (!letterV || !letterC) {
      throw new Error(`Invalid letters: ${nucleus}, ${coda}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 0, 6, 2, 6)
      ));
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(0, 2, 6, 4, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 0, 2, 6, 6)
      ));
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(2, 0, 4, 6, 6)
      ));
    } else {
      throw new Error(`Invalid vowel type: ${nucleus}`);
    }
  }

  // 7. CVC
  else if (onset.length === 1 && nucleus.length === 1 && coda.length === 1) {
    console.log('Pattern: CVC');
    const letterC1 = letters.find(l => l.char === onset);
    const letterV = letters.find(l => l.char === nucleus);
    const letterC2 = letters.find(l => l.char === coda);
    if (!letterC1 || !letterV || !letterC2) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 4, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(4, 0, 2, 6, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(4, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 4, 6, 2, 6)
      ));
    } else {
      throw new Error(`Invalid vowel type: ${nucleus}`);
    }
  }

  // 8. CCVC
  else if (onset.length === 2 && nucleus.length === 1 && coda.length === 1) {
    console.log('Pattern: CCVC');
    const letterC1 = letters.find(l => l.char === onset[0]);
    const letterC2 = letters.find(l => l.char === onset[1]);
    const letterV = letters.find(l => l.char === nucleus);
    const letterC3 = letters.find(l => l.char === coda);
    if (!letterC1 || !letterC2 || !letterV || !letterC3) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(2, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 4, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(4, 0, 2, 6, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 2, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(4, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(0, 4, 6, 2, 6)
      ));
    }

    // 9. VCC
  } else if (onset.length === 0 && nucleus.length === 1 && coda.length === 2) {
    console.log('Pattern: VCC');
    const letterV = letters.find(l => l.char === nucleus);
    const letterC1 = letters.find(l => l.char === coda[0]);
    const letterC2 = letters.find(l => l.char === coda[1]);
    if (!letterV || !letterC1 || !letterC2) {
      throw new Error(`Invalid letters: ${nucleus}, ${coda}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 0, 2, 6, 6)
      ));
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(2, 0, 4, 3, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(2, 3, 4, 3, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 0, 6, 2, 6)
      ));
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 2, 3, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(3, 2, 3, 4, 6)
      ));
    }
  }

  // 10. CVCC
  else if (onset.length === 1 && nucleus.length === 1 && coda.length === 2) {
    console.log('Pattern: CVCC');
    const letterC1 = letters.find(l => l.char === onset);
    const letterV = letters.find(l => l.char === nucleus);
    const letterC2 = letters.find(l => l.char === coda[0]);
    const letterC3 = letters.find(l => l.char === coda[1]);
    if (!letterC1 || !letterV || !letterC2 || !letterC3) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 4, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(4, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(4, 3, 2, 3, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(4, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 4, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(3, 4, 3, 2, 6)
      ));
    }
  }

  // 11. CCVCC
  else if (onset.length === 2 && nucleus.length === 1 && coda.length === 2) {
    console.log('Pattern: CCVCC');
    const letterC1 = letters.find(l => l.char === onset[0]);
    const letterC2 = letters.find(l => l.char === onset[1]);
    const letterV = letters.find(l => l.char === nucleus);
    const letterC3 = letters.find(l => l.char === coda[0]);
    const letterC4 = letters.find(l => l.char === coda[1]);
    if (!letterC1 || !letterC2 || !letterV || !letterC3 || !letterC4) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(2, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(0, 4, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(4, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterC4,
        ...getUnitPositionSize(4, 3, 2, 3, 6)
      ));
    } else if (letterV.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 4, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV,
        ...getUnitPositionSize(2, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(4, 0, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterC4,
        ...getUnitPositionSize(4, 2, 3, 2, 6)
      ));
    }
  }

  // 12. VV
  else if (onset.length === 0 && nucleus.length === 2 && coda.length === 0) {
    console.log('Pattern: VV');
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    if (!letterV1 || !letterV2) {
      throw new Error(`Invalid letters: ${nucleus}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 3, 6, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 0, 3, 6, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 6, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(0, 3, 6, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
    }
  }

  // 13. CVV
  else if (onset.length === 1 && nucleus.length === 2 && coda.length === 0) {
    console.log('Pattern: CVV');
    const letterC = letters.find(l => l.char === onset);
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    if (!letterC || !letterV1 || !letterV2) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(0, 0, 6, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 4, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 4, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(0, 0, 4, 6, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(4, 0, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 3, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
    }
  }

  // 14. CCVV
  else if (onset.length === 2 && nucleus.length === 2 && coda.length === 0) {
    console.log('Pattern: CCVV');
    const letterC1 = letters.find(l => l.char === onset[0]);
    const letterC2 = letters.find(l => l.char === onset[1]);
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    if (!letterC1 || !letterC2 || !letterV1 || !letterV2) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 3, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(3, 0, 3, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 4, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 4, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 2, 6, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 3, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(2, 0, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 3, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
    }
  }

  // 15. VVC
  else if (onset.length === 0 && nucleus.length === 2 && coda.length === 1) {
    console.log('Pattern: VVC');
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    const letterC = letters.find(l => l.char === coda);
    if (!letterV1 || !letterV2 || !letterC) {
      throw new Error(`Invalid letters: ${nucleus}, ${coda}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(0, 3, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(2, 0, 4, 6, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 0, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(0, 2, 6, 4, 6)
      ));
    } else {
      throw new Error(`Invalid vowel type: ${nucleus}`);
    }
  }

  // 16. CVVC
  else if (onset.length === 1 && nucleus.length === 2 && coda.length === 1) {
    console.log('Pattern: CVVC');
    const letterC1 = letters.find(l => l.char === onset);
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    const letterC2 = letters.find(l => l.char === coda);
    if (!letterC1 || !letterV1 || !letterV2 || !letterC2) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(4, 0, 2, 6, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(4, 0, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 4, 6, 2, 6)
      ));
    }
  }

  // 17. CCVVC
  else if (onset.length === 2 && nucleus.length === 2 && coda.length === 1) {
    console.log('Pattern: CCVVC');
    const letterC1 = letters.find(l => l.char === onset[0]);
    const letterC2 = letters.find(l => l.char === onset[1]);
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    const letterC3 = letters.find(l => l.char === coda);
    if (!letterC1 || !letterC2 || !letterV1 || !letterV2 || !letterC3) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(2, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(4, 0, 2, 6, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 2, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(4, 0, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(0, 4, 6, 2, 6)
      ));
    }
  }

  // 18. VVCC
  else if (onset.length === 0 && nucleus.length === 2 && coda.length === 2) {
    console.log('Pattern: VVCC');
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    const letterC1 = letters.find(l => l.char === coda[0]);
    const letterC2 = letters.find(l => l.char === coda[1]);
    if (!letterV1 || !letterV2 || !letterC1 || !letterC2) {
      throw new Error(`Invalid letters: ${nucleus}, ${coda}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(0, 3, 2, 3, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(2, 0, 4, 3, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(2, 3, 4, 3, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 0, 3, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 2, 3, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(3, 2, 3, 4, 6)
      ));
    }
  }

  // 19. CVVCC
  else if (onset.length === 1 && nucleus.length === 2 && coda.length === 2) {
    console.log('Pattern: CVVCC');
    const letterC1 = letters.find(l => l.char === onset);
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    const letterC2 = letters.find(l => l.char === coda[0]);
    const letterC3 = letters.find(l => l.char === coda[1]);
    if (!letterC1 || !letterV1 || !letterV2 || !letterC2 || !letterC3) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(4, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(4, 3, 2, 3, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(4, 0, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 4, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(3, 4, 3, 2, 6)
      ));
    }
  }

  // 20. CCVVCC
  else if (onset.length === 2 && nucleus.length === 2 && coda.length === 2) {
    console.log('Pattern: CCVVCC');
    const letterC1 = letters.find(l => l.char === onset[0]);
    const letterC2 = letters.find(l => l.char === onset[1]);
    const letterV1 = letters.find(l => l.char === nucleus[0]);
    const letterV2 = letters.find(l => l.char === nucleus[1]);
    const letterC3 = letters.find(l => l.char === coda[0]);
    const letterC4 = letters.find(l => l.char === coda[1]);
    if (!letterC1 || !letterC2 || !letterV1 || !letterV2 || !letterC3 || !letterC4) {
      throw new Error(`Invalid letters: ${onset}, ${nucleus}, ${coda}`);
    }

    if (letterV1.type === 'a') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(2, 0, 2, 4, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(4, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterC4,
        ...getUnitPositionSize(4, 3, 2, 3, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterC1,
        ...getUnitPositionSize(0, 0, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterC2,
        ...getUnitPositionSize(0, 2, 4, 2, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(4, 0, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV1, nucleus) }
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6),
        { useAltPaths: shouldUseAltPaths(letterV2, nucleus) }
      ));
      parts.push(generatePart(
        letterC3,
        ...getUnitPositionSize(0, 4, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterC4,
        ...getUnitPositionSize(3, 4, 3, 2, 6)
      ));
    }
  }

  else {
    throw new Error(`Unsupported syllable structure: ${syllable}`);
  }

  return parts;
}

function generateSVG(parts) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" style="color: black;">
<rect width="100%" height="100%" fill="white"/>
  ${parts.join('\n')}
</svg>
  `.trim();
}

function generate(syllable) {
  const parts = generateSyllable(syllable);
  return generateSVG(parts);
}

const OUTPUT_DIR = './output';
function ensureSyllableFile(syllable) {
  const filename = `${OUTPUT_DIR}/zasocaravita-${syllable}.svg`;
  let created = false;
  try {
    const svg = generate(syllable);
    if (fs.existsSync(filename)) {
      created = true;
      console.log(`Overwriting file: ${filename}`);
    } else {
      created = true;
      console.log(`Generated file: ${filename}`);
    }
    fs.writeFileSync(filename, svg);
  } catch (error) {
    console.error(`Error generating file for syllable "${syllable}": ${error.message}`);
    return null;
  }

  return { filename, created };
}

async function main() {
  loadEnv();

  if (!fs.existsSync(OUTPUT_DIR))
    fs.mkdirSync(OUTPUT_DIR);

  // get syllables from stdin
  const input = fs.readFileSync(0, 'utf-8'); // 0 is stdin
  const syllables = input.match(/[a-z]+/g) || [];
  console.log(`Generating ${syllables.length} syllables...`);
  console.log(syllables.join(', '));

  const filesToUpload = [];
  for (const syllable of syllables) {
    const result = ensureSyllableFile(syllable);
    if (result) {
      filesToUpload.push({ ...result, syllable });
    }
  }

  const mediaWikiConfig = loadMediaWikiConfig();
  if (!mediaWikiConfig.enabled) {
    if (mediaWikiConfig.reason) {
      console.log(`MediaWiki upload skipped: ${mediaWikiConfig.reason}`);
    }
    return;
  }

  if (filesToUpload.length === 0) {
    console.log('No files generated to upload.');
    return;
  }

  const { enabled: _enabled, reason: _reason, ...clientConfig } = mediaWikiConfig;
  try {
    const client = new MediaWikiClient(clientConfig);
    await client.init();
    const failures = [];
    for (const fileInfo of filesToUpload) {
      try {
        await client.uploadFile({ localPath: fileInfo.filename, syllable: fileInfo.syllable });
      } catch (error) {
        const message = `Upload failed for ${fileInfo.filename}: ${error.message}`;
        console.error(message);
        failures.push({ file: fileInfo.filename, error: error.message });
      }
    }
    if (failures.length > 0) {
      console.error(`MediaWiki upload completed with ${failures.length} failure(s).`);
    }
  } catch (error) {
    console.error(`MediaWiki upload failed: ${error.message}`);
  }

  if (fs.existsSync(OUTPUT_DIR))
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
