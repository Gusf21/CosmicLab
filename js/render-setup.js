import { AddObject, scene, Start as StartRender, PassFrames, BeginMovement, GetCookie } from "./render";

const defaultSystem = [
    {
        id: 1,
        name: "The Sun",
        type: "star",
        mass: 1,
        radius: 1,
        satellites: [
            {
                object: {
                    id: 2,
                    name: "Mercury",
                    type: "planet",
                    mass: 0.055,
                    radius: 0.382
                },
                orbit: {
                    smAxis: 0.387098,
                    eccentricity: 0.205630,
                    inclination: 7.005,
                    longOfAscNode: 48.331,
                    argOfPeri: 29.124,
                }
            },
            {
                object: {
                    id: 3,
                    name: "Venus",
                    type: "planet",
                    mass: 0.815,
                    radius: 0.95
                },
                orbit: {
                    smAxis: 0.723332,
                    eccentricity: 0.006772,
                    inclination: 3.395,
                    longOfAscNode: 76.680,
                    argOfPeri: 54.884,
                }
            },
            {
                object: {
                    id: 4,
                    name: "Earth",
                    type: "planet",
                    mass: 1,
                    radius: 1
                },
                orbit: {
                    smAxis: 1,
                    eccentricity: 0.0167086,
                    inclination: 0.005,
                    longOfAscNode: 174.873,
                    argOfPeri: 288.064
                }
            },
            {
                object: {
                    id: 5,
                    name: "Mars",
                    type: "planet",
                    mass: 0.107,
                    radius: 0.532
                },
                orbit: {
                    smAxis: 1.52368055,
                    eccentricity: 0.0934,
                    inclination: 1.85,
                    longOfAscNode: 49.57854,
                    argOfPeri: 286.5
                }
            },
            {
                object: {
                    id: 6,
                    name: "Jupiter",
                    type: "planet",
                    mass: 317.8,
                    radius: 11
                },
                orbit: {
                    smAxis: 5.2038,
                    eccentricity: 0.0489,
                    inclination: 1.303,
                    longOfAscNode: 100.464,
                    argOfPeri: 273.867
                }
            },
            {
                object: {
                    id: 7,
                    name: "Saturn",
                    type: "planet",
                    mass: 95.159,
                    radius: 9
                },
                orbit: {
                    smAxis: 9.5826,
                    eccentricity: 0.0565,
                    inclination: 2.485,
                    longOfAscNode: 113.665,
                    argOfPeri: 339.392
                }
            },
            {
                object: {
                    id: 8,
                    name: "Uranus",
                    type: "planet",
                    mass: 14.536,
                    radius: 4
                },
                orbit: {
                    smAxis: 19.19126,
                    eccentricity: 0.04717,
                    inclination: 0.773,
                    longOfAscNode: 74.006,
                    argOfPeri: 96.998857
                }
            },
            {
                object: {
                    id: 9,
                    name: "Neptune",
                    type: "planet",
                    mass: 17.147,
                    radius: 3.85
                },
                orbit: {
                    smAxis: 30.07,
                    eccentricity: 0.008678,
                    inclination: 1.770,
                    longOfAscNode: 131.783,
                    argOfPeri: 273.187
                }
            }
        ]
    }
];

let addedItems = [];

const G = 0.0000000000667408;
const AU = 149597870700;
const SM = 1.9884 * (10 ** 30);
const EM = 5.972 * (10 ** 24);

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    rotate(dir, angle) {
        let cosa = Math.cos(angle);
        let sina = Math.sin(angle);
        let one_minus_cosa = 1 - cosa;

        // Rotates point around axis specified by unit vector "dir", by angle "angle" using Rodrigues Rotation Formula
        let new_x = (this.x * cosa) + (this.x * dir.x * dir.x * one_minus_cosa) + (this.y * dir.x * dir.y * one_minus_cosa) - (this.y * dir.z * sina) + (this.z * dir.y * sina) + (this.z * dir.x * dir.z * one_minus_cosa);
        let new_y = (this.x * dir.z * sina) + (this.x * dir.x * dir.y * one_minus_cosa) + (this.y * cosa) + (this.y * dir.y * dir.y * one_minus_cosa) + (-1 * this.z * dir.x * sina) + (this.z * dir.y * dir.z * one_minus_cosa);
        let new_z = (-1 * this.x * dir.y * sina) + (this.x * dir.x * dir.z * one_minus_cosa) + (this.y * dir.x * sina) + (this.y * dir.y * dir.z * one_minus_cosa) + (this.z * cosa) + (this.z * dir.z * dir.z * one_minus_cosa);

        this.x = new_x;
        this.y = new_y;
        this.z = new_z;
    }

    multiply(val) {
        this.x *= val;
        this.y *= val;
        this.z *= val;
    }
}

// I dont know why, but this is the only way to only create one canvas
document.addEventListener("DOMContentLoaded", () => {
    GetCookie("sessionId");
    StartRender();
    AddDefaultPlanets();
});

window.addEventListener("beforeunload", () => {
    fetch(`https://localhost:7168/api/Data/DeleteSimulation?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
});

function AddDefaultPlanets() {
    const length = defaultSystem.length;

    for (let i = 0; i < length; i++) {
        let centerObject = {
            CelestialObject: {
                id: defaultSystem[i].id,
                name: defaultSystem[i].name,
                type: defaultSystem[i].type,
                mass: defaultSystem[i].mass,
                radius: defaultSystem[i].radius,
            },
            telemetry: {
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                velocity: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }
        }

        const satellites = defaultSystem[i].satellites.length;

        CreateEntry(defaultSystem[i]);
        AddObject(centerObject.telemetry.position.x / AU, centerObject.telemetry.position.y / AU, centerObject.telemetry.position.z / AU, centerObject.CelestialObject.radius * 10, centerObject.CelestialObject.id, centerObject.CelestialObject.name);
        addedItems.push(centerObject);

        for (let j = 0; j < satellites; j++) {
            let orbitingObject = {
                CelestialObject: {
                    id: defaultSystem[i].satellites[j].object.id,
                    name: defaultSystem[i].satellites[j].object.name,
                    type: defaultSystem[i].satellites[j].object.type,
                    mass: defaultSystem[i].satellites[j].object.mass,
                    radius: defaultSystem[i].satellites[j].object.radius,
                },
                telemetry: {
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    velocity: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            }

            SetupOrbit(centerObject, orbitingObject, defaultSystem[i].satellites[j].orbit);

            CreateEntry(defaultSystem[i].satellites[j].object)
            AddObject(orbitingObject.telemetry.position.x / AU, orbitingObject.telemetry.position.y / AU, orbitingObject.telemetry.position.z / AU, orbitingObject.CelestialObject.radius, orbitingObject.CelestialObject.id, orbitingObject.CelestialObject.name);
            addedItems.push(orbitingObject);
        }
    }
    PassSystemToBackend();
}

function CreateEntry(object) {
    const container = document.getElementById("card-container");
    const template = document.getElementById("info-card-template");

    const clone = template.content.cloneNode(true);
    clone.querySelector("span").innerText = object.name;
    clone.querySelector("div").id = object.id;
    container.appendChild(clone);
}

// Calculates initial veloicty for an object in a specific orbit
function CalculateInitialVelocity(E, a, M) {
    let r = a - (E * a)
    return Math.sqrt((G * M) * ((2 / r) - (1 / a)));
}

function SetupOrbit(centerObject, orbitingObject, orbitParameters) {

    const seperation = (orbitParameters.smAxis - (orbitParameters.eccentricity * orbitParameters.smAxis)) * AU;

    const offset = new Vector3(seperation, 0, 0);
    const center = new Vector3(centerObject.telemetry.position.x, centerObject.telemetry.position.y, centerObject.telemetry.position.z);

    const longOfAscNodeRads = (orbitParameters.longOfAscNode * Math.PI) / 180;
    const inclinationRads = (orbitParameters.inclination * Math.PI) / 180;
    const argRads = (orbitParameters.argOfPeri * Math.PI) / 180;

    const cosi = Math.cos(inclinationRads);
    const sini = Math.sin(inclinationRads);
    const coso = Math.cos(longOfAscNodeRads);
    const sino = Math.sin(longOfAscNodeRads);

    // Rotate around the z axis to set the Longitude of the Ascending Node
    offset.rotate(new Vector3(0, 0, 1), longOfAscNodeRads);

    // Rotate around the axis set by the Longitude of the Ascending Node, sets the inclination
    offset.rotate(new Vector3(sino, -1 * coso, 0), inclinationRads);

    // Rotate around the axis of tilt of the center object, sets the distance around the center object of ther peripasis
    // Unit vector calculated by multiplying the rotation matrix for inclining the point around the origin in the xz plane by the rotation matrix around the z-axis
    offset.rotate(new Vector3(-1 * sini * coso, -1 * sini * sino, cosi), argRads);

    orbitingObject.telemetry.position.x = center.x + offset.x;
    orbitingObject.telemetry.position.y = center.y + offset.y;
    orbitingObject.telemetry.position.z = center.z + offset.z;

    let velocity = new Vector3(0, 1, 0);
    velocity.rotate(new Vector3(0, 0, 1), longOfAscNodeRads);
    velocity.rotate(new Vector3(-1 * sini * coso, -1 * sini * sino, cosi), argRads);
    velocity.multiply(CalculateInitialVelocity(orbitParameters.eccentricity, orbitParameters.smAxis * AU, centerObject.CelestialObject.mass * (centerObject.CelestialObject.type == "planet" ? EM : SM)))

    orbitingObject.telemetry.velocity.x = velocity.x;
    orbitingObject.telemetry.velocity.y = velocity.y;
    orbitingObject.telemetry.velocity.z = velocity.z;
}

async function PassSystemToBackend() {
    let system = {};
    system.Objects = addedItems;
    system.SessionId = GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase();
    system.Timescale = 3600;

    let frames;

    const response = await fetch(`https://localhost:7168/api/Data/StartSimulation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(system)
    }).then(async () => {
        frames = await fetch(`https://localhost:7168/api/Data/GetFrames?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}&timescale=3600&num=2000`);
    });

    PassFrames(JSON.parse(await frames.text()));
    BeginMovement();
}