import fs from 'fs';
import path from 'path';

const H = 0.5;
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
      [[1,0], [1,H]],
    ]
  },
  {
    char: 'v',
    paths: [
      [[1,0], [1,1], [0,1]],
      [[0,0], [0,H]],
    ]
  },
  {
    char: 'z',
    paths: [
      [[1,0], [0,0], [0,1]],
      [[1,1], [1,H]],
    ]
  },
  {
    char: 'l',
    paths: [
      [[0,0], [0,1], [1,1]],
      [[1,0], [H,0]],
    ]
  },
  {
    char: 'x',
    paths: [
      [[1,0], [0,0], [0,1]],
      [[1,1], [H,1]],
    ]
  },
  {
    char: 'k',
    paths: [
      [[0,0], [1,0], [1,1]],
      [[0,H], [0,1]],
      [[H,H], [H,1]],
    ]
  },
  {
    char: 't',
    paths: [
      [[0,0], [0,1], [1,1]],
      [[1,0], [1,H]],
      [[H,H], [H,0]],
    ]
  },
  {
    char: 'q',
    paths: [
      [[1,0], [0,0], [0,1]],
      [[1,1], [1,H]],
      [[H,H], [H,1]],
    ]
  },
  {
    char: 'p',
    paths: [
      [[1,0], [1,1], [0,1]],
      [[0,0], [0,H]],
      [[H,H], [H,0]],
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

const SIZE = 12;
const PADDING = 2;
const GAP = 2;
const COLOR = 'black';
const STROKE_WIDTH = 1;
const STROKE_LINECAP = "square";
const STROKE_LINEJOIN = "miter";
const WIDTH = SIZE;
const HEIGHT = SIZE;

function generatePart(letter, width, height, xOffset, yOffset) {
  const letterPaths = letter.paths;
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
        ...getUnitPositionSize(0, 0, 3, 6, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 0, 3, 6, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 6, 3, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(0, 3, 6, 3, 6)
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
        ...getUnitPositionSize(0, 4, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 4, 3, 2, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(0, 0, 4, 6, 6)
      ));
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(4, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 3, 2, 3, 6)
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
        ...getUnitPositionSize(0, 4, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 4, 3, 2, 6)
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
        ...getUnitPositionSize(2, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 3, 2, 3, 6)
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
        ...getUnitPositionSize(0, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(0, 3, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterC,
        ...getUnitPositionSize(2, 0, 4, 6, 6)
      ));
    } else if (letterV1.type === 'o') {
      parts.push(generatePart(
        letterV1,
        ...getUnitPositionSize(0, 0, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 0, 3, 2, 6)
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
        ...getUnitPositionSize(0, 4, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6)
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
        ...getUnitPositionSize(4, 0, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6)
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
        ...getUnitPositionSize(0, 4, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6)
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
        ...getUnitPositionSize(4, 0, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6)
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
        ...getUnitPositionSize(0, 0, 2, 3, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(0, 3, 2, 3, 6)
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
        ...getUnitPositionSize(0, 0, 3, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(3, 0, 3, 2, 6)
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
        ...getUnitPositionSize(0, 4, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6)
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
        ...getUnitPositionSize(4, 0, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6)
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
        ...getUnitPositionSize(0, 4, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(2, 4, 2, 2, 6)
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
        ...getUnitPositionSize(4, 0, 2, 2, 6)
      ));
      parts.push(generatePart(
        letterV2,
        ...getUnitPositionSize(4, 2, 2, 2, 6)
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
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
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
  if (fs.existsSync(filename)) {
    console.log(`File already exists: ${filename}`);
    return;
  }

  try {
    const svg = generate(syllable);
    fs.writeFileSync(filename, svg);
    console.log(`Generated file: ${filename}`);
  } catch (error) {
    console.error(`Error generating file for syllable "${syllable}": ${error.message}`);
  }
}

function main() {
  /*
  if (fs.existsSync(OUTPUT_DIR))
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  */
  if (!fs.existsSync(OUTPUT_DIR))
    fs.mkdirSync(OUTPUT_DIR);

  // get syllables from stdin
  const input = fs.readFileSync(0, 'utf-8'); // 0 is stdin
  const syllables = input.split(/\s+/).filter(s => s.length > 0);
  console.log(`Generating ${syllables.length} syllables...`);
  console.log(syllables.join(', '));

  for (const syllable of syllables) {
    ensureSyllableFile(syllable);
  }
}

main();
