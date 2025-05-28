const offset = {
    map1p1: {
        x: 100,
        y: -550
    },
    map1p2: {
        x: -2700,
        y: -100
    },
    map2: {
        x: 380,
        y: -735
    },
    map2p2: {
        x: -1100,
        y: 190
    },
    map3: {
        x: -860,
        y: -1500
    }
};
//collision map 1
const collisionMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionMap.push(collisions.slice(i, i + 70));
}

//gate map 1
const gatesMap1 = [];
for (let i = 0; i < gateMap1.length; i += 70) {
    gatesMap1.push(gateMap1.slice(i, i + 70));
}

const createBoundary = (map, offset) => {
    const boundaries = [];
    map.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol === 1025 || symbol === 1026) {
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width + offset.x,
                            y: i * Boundary.height + offset.y
                        }
                    })
                );
            }
        });
    });
    return boundaries;
};

const createGate = (map, offset) => {
    const gates = [];
    map.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol === 1026 || symbol === 1025) {
                gates.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width + offset.x,
                            y: i * Boundary.height + offset.y
                        }
                    })
                );
            }
        });
    });
    return gates;
};

//collision map 2
const collisionsMap02 = [];
for (let i = 0; i < collisionsMap2.length; i += 70) {
    collisionsMap02.push(collisionsMap2.slice(i, i + 70));
}

const gatesMap2 = [];
for (let i = 0; i < gateMap2.length; i += 70) {
    gatesMap2.push(gateMap2.slice(i, i + 70));
}

//collision map 3
const collisionsMap03 = [];
for (let i = 0; i < collisionsMap3.length; i += 70) {
    collisionsMap03.push(collisionsMap3.slice(i, i + 70));
}

//gate map 3
const gatesMap3 = [];
for (let i = 0; i < gateMap3.length; i += 70) {
    gatesMap3.push(gateMap3.slice(i, i + 70));
}

const createConnectGate = (gates1, gates1p2, gates2, gates2p2, gates3) => {
    const connectGate = [
        {
            positionGate1: {
                boundaryPosition: [
                    gates1[0],
                    gates1[1],
                    gates1p2[0],
                    gates1p2[1]
                ],
                connect: {}
            },
            positionGate2: {
                boundaryPosition: [
                    gates1[2],
                    gates1[3],
                    gates1p2[2],
                    gates1p2[3]
                ],
                connect: {
                    numberChangeMap: 2,
                    inforScreen: {
                        x: offset.map2.x,
                        y: offset.map2.y
                    },
                    numberGate: 0
                }
            }
        },
        {
            positionGate1: {
                boundaryPosition: [
                    gates2[2],
                    gates2[3],
                    gates2p2[2],
                    gates2p2[3]
                ],
                connect: {
                    numberChangeMap: 1,
                    inforScreen: {
                        x: offset.map1p2.x,
                        y: offset.map1p2.y
                    },
                    numberGate: 1
                }
            },
            positionGate2: {
                boundaryPosition: [
                    gates2[0],
                    gates2[1],
                    gates2p2[0],
                    gates2p2[1]
                ],
                connect: {
                    numberChangeMap: 3,
                    inforScreen: {
                        x: offset.map3.x,
                        y: offset.map3.y
                    },
                    numberGate: 0
                }
            }
        },
        {
            positionGate1: {
                boundaryPosition: [gates3[2], gates3[3]],
                connect: {
                    numberChangeMap: 2,
                    inforScreen: {
                        x: offset.map2p2.x,
                        y: offset.map2p2.y
                    },
                    numberGate: 1
                }
            },
            positionGate2: {
                boundaryPosition: [gates3[0], gates3[1]],
                connect: {}
            }
        }
    ];
    return connectGate;
};

const battleZonesMap01 = [];
const battleZonesMap02 = [];
const battleZonesMap03 = [];

for (let i = 0; i < battleZonesMap1.length; i += 70) {
    battleZonesMap01.push(battleZonesMap1.slice(i, i + 70));
}

for (let i = 0; i < battleZonesMap2.length; i += 70) {
    battleZonesMap02.push(battleZonesMap2.slice(i, i + 70));
}

for (let i = 0; i < battleZonesMap3.length; i += 70) {
    battleZonesMap03.push(battleZonesMap3.slice(i, i + 70));
}

export {
    offset,
    createConnectGate,
    createBoundary,
    createGate,
    collisionMap,
    gatesMap1,
    gatesMap2,
    gatesMap3,
    collisionsMap02,
    collisionsMap03,
    battleZonesMap01,
    battleZonesMap02,
    battleZonesMap03
};
