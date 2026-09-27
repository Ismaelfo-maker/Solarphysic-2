const CONSTANTS = {
    G: 6.67430e-11, // m^3 kg^-1 s^-2
    AU: 149597870700, // metros
    DAY: 86400 // segundos
};

// Datos reales (simplificados a órbitas circulares/elípticas básicas para la posición inicial)
const SOLAR_SYSTEM = [
    { name: "Sol", mass: 1.989e30, radius: 696340000, distance: 0, velocity: 0, color: 0xffcc00 },
    { name: "Mercurio", mass: 3.3011e23, radius: 2439700, distance: 0.387 * CONSTANTS.AU, velocity: 47400, color: 0xaaaaaa },
    { name: "Venus", mass: 4.8675e24, radius: 6051800, distance: 0.723 * CONSTANTS.AU, velocity: 35000, color: 0xffaa55 },
    { name: "Tierra", mass: 5.972e24, radius: 6371000, distance: 1.000 * CONSTANTS.AU, velocity: 29780, color: 0x3333ff },
    { name: "Marte", mass: 6.4171e23, radius: 3389500, distance: 1.524 * CONSTANTS.AU, velocity: 24070, color: 0xff3300 },
    { name: "Júpiter", mass: 1.8982e27, radius: 69911000, distance: 5.204 * CONSTANTS.AU, velocity: 13070, color: 0xddaa77 },
    { name: "Saturno", mass: 5.6834e26, radius: 58232000, distance: 9.582 * CONSTANTS.AU, velocity: 9690, color: 0xeeddaa }
];
