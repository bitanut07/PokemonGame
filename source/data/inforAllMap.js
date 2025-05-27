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

//Lấy tọa độ của collision map 1 phan 1
const boundaries = [];

collisionMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 || symbol === 1026) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + 100,
                        y: i * Boundary.height - 540
                    }
                })
            );
        }
    });
});

//Lấy tọa độ của collision map 1 phan 2
const boundaries1p2 = [];

collisionMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 || symbol === 1026) {
            boundaries1p2.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width - 2660,
                        y: i * Boundary.height - 110
                    }
                })
            );
        }
    });
});

// Lấy tọa độ của gate map 1 phan 1
const gates1 = [];
gatesMap1.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1026 || symbol === 1025) {
            gates1.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + 100,
                        y: i * Boundary.height - 540
                    }
                })
            );
        }
    });
});

//Lấy tọa độ của gate map 1 phan 2
const gates1p2 = [];
gatesMap1.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1026 || symbol === 1025) {
            gates1p2.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width - 2660,
                        y: i * Boundary.height - 110
                    }
                })
            );
        }
    });
});

//collision map 2
const collisionsMap02 = [];
for (let i = 0; i < collisionsMap2.length; i += 70) {
    collisionsMap02.push(collisionsMap2.slice(i, i + 70));
}

//Lấy tọa độ của collision map 2 phan 1
const boundaries2 = [];

collisionsMap02.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 || symbol === 1026) {
            boundaries2.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + 370,
                        y: i * Boundary.height - 733
                    }
                })
            );
        }
    });
});

//Lấy tọa độ của collision map 2 phan 2
const boundaries2p2 = [];

collisionsMap02.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 || symbol === 1026) {
            boundaries2p2.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width - 1100,
                        y: i * Boundary.height + 190
                    }
                })
            );
        }
    });
});

const gatesMap2 = [];
for (let i = 0; i < gateMap2.length; i += 70) {
    gatesMap2.push(gateMap2.slice(i, i + 70));
}

//gate map 2 phan 1
const gates2 = [];
gatesMap2.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1026 || symbol === 1025) {
            gates2.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + 370,
                        y: i * Boundary.height - 733
                    }
                })
            );
        }
    });
});

//gate map 2 phan 2
const gates2p2 = [];
gatesMap2.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1026 || symbol === 1025) {
            gates2p2.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width - 1100,
                        y: i * Boundary.height + 190
                    }
                })
            );
        }
    });
});

//collision map 3
const collisionsMap03 = [];
for (let i = 0; i < collisionsMap3.length; i += 70) {
    collisionsMap03.push(collisionsMap3.slice(i, i + 70));
}

//Lấy tọa độ của collision map 3 phan 1
const boundaries3 = [];

collisionsMap03.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 || symbol === 1026) {
            boundaries3.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width - 860,
                        y: i * Boundary.height - 1460
                    }
                })
            );
        }
    });
});

//gate map 3
const gatesMap3 = [];
for (let i = 0; i < gateMap3.length; i += 70) {
    gatesMap3.push(gateMap3.slice(i, i + 70));
}
//gate map 3
const gates3 = [];
gatesMap3.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025 || symbol === 1026) {
            gates3.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width - 860,
                        y: i * Boundary.height - 1460
                    }
                })
            );
        }
    });
});

const connectGate = [
    {
        positionGate1: {
            boundaryPosition: [gates1[0], gates1[1]],
            connect: {}
        },
        positionGate2: {
            boundaryPosition: [gates1[2], gates1[3]],
            connect: {
                numberChangeMap: 2,
                inforScreen: {
                    x: 4905,
                    y: -200
                },
                numberGate: 0
            }
        }
    },
    {
        positionGate1: {
            boundaryPosition: [gates2[2], gates2[3]],
            connect: {
                numberChangeMap: 1,
                inforScreen: {
                    x: 1780,
                    y: 420
                },
                numberGate: 1
            }
        },
        positionGate2: {
            boundaryPosition: [gates2[0], gates2[1]],
            connect: {
                numberChangeMap: 3,
                inforScreen: {
                    x: 820,
                    y: -500
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
                    x: 580,
                    y: 1150
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

export {
    boundaries,
    boundaries1p2,
    boundaries2,
    boundaries2p2,
    boundaries3,
    gates1,
    gates1p2,
    gates2,
    gates2p2,
    gates3,
    connectGate
};
