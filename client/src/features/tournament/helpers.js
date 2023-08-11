export const divideGroups = (nParts, nGroups) => {
  const maxPartsPerGroup = Math.ceil(nParts / nGroups);
  const groupSizes = [maxPartsPerGroup - 1, maxPartsPerGroup];

  const solutions = Array.from({ length: nParts + 1 }, () => []); //[nParts: [solutions: [first/size, groupCount]]]
  solutions[0].push({ size: null, length: 0 });

  for (const w of groupSizes) {
    for (let i = 1; i <= nParts; i++) {
      if (i - w >= 0) {
        for (const s of solutions[i - w]) {
          solutions[i].push({ size: w, length: s.length + 1 });
        }
      }
    }
  }

  const solution = [];

  let p = nParts;
  let l = nGroups;

  while (l > 0) {
    const end = solutions[p].find((g) => g.length === l);

    const s = end.size;
    solution.push(s);

    p -= end.size;
    l--;
  }

  return solution;
};

export const finalRoundNames = (roundInfo) => {
  switch (roundInfo.fractionOfFinal) {
    case 1:
      return "Finals";
    case 0.5:
      return "Semifinals";
    case 0.25:
      return "Quarterfinals";
    default:
      return `Round of ${Math.round(1 / roundInfo.fractionOfFinal) * 2}`;
  }
};
