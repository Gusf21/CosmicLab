import { AddObject, scene, Start as StartRender } from "./render";

const default_system = [
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
                    mass: 0.06,
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

let added_items = [];

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
    StartRender();
    AddDefaultPlanets();
});

function AddDefaultPlanets() {
    const length = default_system.length;

    for (let i = 0; i < length; i++) {
        let center_object = {
            celestial_object: {
                id: default_system[i].id,
                name: default_system[i].name,
                type: default_system[i].type,
                mass: default_system[i].mass,
                radius: default_system[i].radius,
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

        const satellites = default_system[i].satellites.length;

        CreateEntry(default_system[i]);
        AddObject(center_object.telemetry.position.x / AU, center_object.telemetry.position.y / AU, center_object.telemetry.position.z / AU, center_object.celestial_object.id);
        added_items.push(center_object);

        for (let j = 0; j < satellites; j++) {
            let orbiting_object = {
                celestial_object: {
                    id: default_system[i].satellites[j].object.id,
                    name: default_system[i].satellites[j].object.name,
                    type: default_system[i].satellites[j].object.type,
                    mass: default_system[i].satellites[j].object.mass,
                    radius: default_system[i].satellites[j].object.radius,
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

            SetupOrbit(center_object, orbiting_object, default_system[i].satellites[j].orbit);

            CreateEntry(default_system[i].satellites[j].object)
            AddObject(orbiting_object.telemetry.position.x / AU, orbiting_object.telemetry.position.y / AU, orbiting_object.telemetry.position.z / AU, orbiting_object.celestial_object.id);
            added_items.push(orbiting_object);
        }
    }
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

function SetupOrbit(center_object, orbiting_object, orbit_parameters) {
    
    const seperation = (orbit_parameters.smAxis - (orbit_parameters.eccentricity * orbit_parameters.smAxis)) * AU;
    
    const offset = new Vector3(seperation, 0, 0);
    const center = new Vector3(center_object.telemetry.position.x, center_object.telemetry.position.y, center_object.telemetry.position.z);
    
    const long_of_asc_node_rads = (orbit_parameters.longOfAscNode * Math.PI) / 180;
    const inclination_rads = (orbit_parameters.inclination * Math.PI) / 180;
    const arg_rads = (orbit_parameters.argOfPeri * Math.PI) / 180;
    
    const cosi = Math.cos(inclination_rads);
    const sini = Math.sin(inclination_rads);
    const coso = Math.cos(long_of_asc_node_rads);
    const sino = Math.sin(long_of_asc_node_rads);
    
    // Rotate around the z axis to set the Longitude of the Ascending Node
    offset.rotate(new Vector3(0, 0, 1), long_of_asc_node_rads);
    
    // Rotate around the axis set by the Longitude of the Ascending Node, sets the inclination
    offset.rotate(new Vector3(sino, -1 * coso, 0), inclination_rads);
    
    // Rotate around the axis of tilt of the center object, sets the distance around the center object of ther peripasis
    // Unit vector calculated by multiplying the rotation matrix for inclining the point around the origin in the xz plane by the rotation matrix around the z-axis
    offset.rotate(new Vector3(-1 * sini * coso, -1 * sini * sino, cosi), arg_rads);
    
    orbiting_object.telemetry.position.x = center.x + offset.x;
    orbiting_object.telemetry.position.y = center.y + offset.y;
    orbiting_object.telemetry.position.z = center.z + offset.z;
    
    let velocity = new Vector3(0, 1, 0);
    velocity.rotate(new Vector3(0, 0, 1), long_of_asc_node_rads);
    velocity.rotate(new Vector3(-1 * sini * coso, -1 * sini * sino, cosi), arg_rads);
    velocity.multiply(CalculateInitialVelocity(orbit_parameters.eccentricity, orbit_parameters.smAxis * AU, center_object.celestial_object.mass * (center_object.celestial_object.type == "planet" ? EM : SM)))
    
    orbiting_object.telemetry.velocity.x = velocity.x;
    orbiting_object.telemetry.velocity.y = velocity.y;
    orbiting_object.telemetry.velocity.z = velocity.z;
}

window.DisplayAdditionalInfo = (element) => {
    if (element.dataset.rotated == "false") {
        element.style.transform = "rotate(0deg)";
        element.dataset.rotated = "true";
    }
    else {
        element.style.transform = "rotate(90deg)";
        element.dataset.rotated = "false";
    }
}