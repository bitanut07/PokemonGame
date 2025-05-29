const audio = {
    Map: new Howl({
        src: 'Audio/map.wav',
        volume: 0.1,
        loop: true
    }),
    Enemy: new Howl({
        src: 'Audio/enemy.wav',
        volume: 0.1
    }),
    initBattle: new Howl({
        src: 'Audio/initBattle.wav',
        volume: 0.1
    }),
    battle: new Howl({
        src: 'Audio/battle.mp3',
        volume: 0.1
    }),
    victory: new Howl({
        src: 'Audio/victory.wav',
        volume: 0.1
    }),
    fireball: new Howl({
        src: 'Audio/fireballHit.wav',
        volume: 0.5
    }),
    initFireball: new Howl({
        src: 'Audio/initFireball.wav',
        volume: 0.5
    })
};
