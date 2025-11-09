//https://threejs.org/manual/#en/creating-a-scene
import * as THREE from 'three';

//https://github.com/fennec-hub/ThreeOrbitControlsGizmo
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { loadThreeModel } from "/public/js/models.js";
import {RGBELoader} from "three/addons/loaders/RGBELoader";
import {Mesh, DoubleSide,  GridHelper, MeshPhysicalMaterial, BoxGeometry, ReinhardToneMapping, Cache as controls} from "three";
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';

// Initialize Gird
const resizableGrid = initGrid();
const canvasContainer = document.querySelector("#canvas-container");

//CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, //near
    1000 //far
);


//RENDERER
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(
    canvasContainer.clientWidth,
    canvasContainer.clientHeight
);
//renderer.shadowMap.enabled = true;
//renderer.toneMapping = ReinhardToneMapping;
renderer.setAnimationLoop(animate);
canvasContainer.appendChild( renderer.domElement );

//WINDOW RESIZE HANDLING
window.addEventListener('resize', resize)
function resize() {
    const [width, height] = [
        canvasContainer.clientWidth,
        canvasContainer.clientHeight,
    ];
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    gizmo.update();
}


//SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Light blue color



//https://cloud.needle.tools/hdris?img=Photo+Studio+Loft+Hall
// Initialize KTX2 loader. The transcoder path can come from three.js or Needle.
const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('https://cdn.needle.tools/static/three/0.179.1/basis2/');
ktx2Loader.detectSupport(renderer);

// Load an HDRI image in FastHDR format
ktx2Loader.load('https://cdn.needle.tools/static/hdris/photo_studio_loft_hall_2k.pmrem.ktx2', (texture) => {
    // Make sure to assign the correct mapping
    texture.mapping = THREE.CubeUVReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
    scene.backgroundBlurriness = 0.08;
});


//CONTROLS
// Init Gizmo with OrbitControls
const gizmo = new ViewportGizmo(camera, renderer, {
    container: canvasContainer,
    ...getGizmoConfig(),
});
gizmo.attachControls(new OrbitControls(camera, renderer.domElement));

camera.position.set(5, 5, 5);
gizmo.target.set(0, 0, 0);
camera.lookAt(gizmo.target);

const materialContainer = new MeshPhysicalMaterial({
    color: 0x1e2742,
    transparent: true,
    opacity: 0.6,
    side: DoubleSide,
    metalness: 0,
    roughness: 0.5,
    ior: 1.5,
    sheen: 0.2,
    sheenRoughness: 0.8,
});

// GRIDHELPER
function createFloor() {
    const floor = new GridHelper(100, 50, 0x111111, 0x111111);
    scene.add(floor);
    floor.userData.ground = true;
}

function createContainer(sx, sy, sz, px, py, pz) {
    let rect = new THREE.Mesh(new THREE.BoxGeometry(), materialContainer);
    rect.scale.set(sx, sy, sz);
    rect.position.set(px, py, pz);
    //rect.castShadow = true;
    //rect.receiveShadow = true;
    scene.add(rect);

    rect.userData.draggable = true;
    rect.userData.isContainer = true;
    rect.userData.capacity = sx * sy * sz;
    rect.userData.fulfilled = 0;
    rect.userData.contents = [];
    rect.userData.name = "CONTAINER"

    return rect;
}

function createObject(px, py, pz) {
    const choice = Math.floor(Math.random() * 13);
    console.log(choice);
    let geometry;
    let geometryType;
    switch(choice) {
        case 0: //CUBE
            geometry = new THREE.BoxGeometry( 1, 1, 1 );
            geometryType = "cube"
            break;
        case 1: //TRIANGULAR CONE
            geometry = new THREE.ConeGeometry(0.75, 1, 3);
            geometryType = "triCone"
            break;
        case 2: //QUAD CONE
            geometry = new THREE.ConeGeometry(0.75, 1, 4);
            geometryType = "quadCone"
            break;
        case 3: //8 CONE
            geometry = new THREE.ConeGeometry(0.5, 1, 8);
            geometryType = "eightCone"
            break;
        case 4: // PENTAGON CYLINDER
            geometry = new THREE.CylinderGeometry( 0.25, 0.75, 1, 5 );
            geometryType = "pentCylinder"
            break;
        case 5: //12side CYLINDER
            geometry = new THREE.CylinderGeometry( 0.25, 0.75, 1, 12 );
            geometryType = "twelveCylinder"
            break;
        case 6: //DODECAHEDRON
            geometry = new THREE.DodecahedronGeometry( 0.75 );
            geometryType = "dodecahedron"
            break;
        case 7: //ICOSAHEDRON
            geometry = new THREE.IcosahedronGeometry( 0.75 );
            geometryType = "icosahedron"
            break;
        case 8: //OCTAHEDRON
            geometry = new THREE.OctahedronGeometry( 0.75 );
            geometryType = "octahedron"
            break;
        case 9: //SPHERE
            geometry = new THREE.SphereGeometry( 0.75, 12, 8 );
            geometryType = "sphere"
            break;
        case 10: //TORUS
            geometry = new THREE.TorusGeometry( 0.3, 0.3, 6, 12 );
            geometryType = "torus"
            break;
        case 11: //KNOTTED TORUS
            geometry = new THREE.TorusKnotGeometry( 0.25, 0.25, 8, 40, 2, 3 );
            geometryType = "knottedTorus"
            break;
        case 12: //UTAH TEAPOT
            geometry = new TeapotGeometry( 0.5, 10 )
            geometryType = "teapot"
            break;
        default:
            geometry = new THREE.BoxGeometry( 1, 1, 1 );
            geometryType = "cube"
    }

    const materialObject = new MeshPhysicalMaterial({
        color: Math.random() * 0xffffff,
        opacity: 1,
        metalness: 0,
        roughness: 0.5,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        ior: 1.2,
        sheen: 0.2,
        sheenRoughness: 0.8,
    });
    let obj = new THREE.Mesh(geometry, materialObject);
    obj.position.set(px, py, pz);

    scene.add(obj);

    obj.userData.draggable = true;
    obj.userData.isObject = true;
    obj.userData.capacity = 1;
    obj.userData.name = geometryType;
    return obj;
}

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
const moveMouse = new THREE.Vector2();
let draggable; //THREE.Object3D

canvasContainer.addEventListener('click', event => {
    event.preventDefault();

    if (draggable) {
        console.log("dropping draggable " +draggable.userData.name);
        draggable = null;
        return;
    }

    //because the canvas doesn't take up the full screen, we need to offset it when normalizing mouse screen coords
    const offsetWidth = (window.innerWidth - canvasContainer.clientWidth);
    const offsetHeight = (window.innerHeight - canvasContainer.clientHeight);
    clickMouse.x = ( (event.clientX - offsetWidth) / canvasContainer.clientWidth) * 2 -1;
    clickMouse.y = - ( (event.clientY - offsetHeight) / canvasContainer.clientHeight) * 2 +1;
    console.log("x : " + clickMouse.x + " y : " + clickMouse.y);


    raycaster.setFromCamera(clickMouse, camera);
    const found = raycaster.intersectObjects(scene.children, true);
    //Gridhelper messes up most raycastings, so filter returned array to only include mesh objects
    const foundFiltered = found.filter(function (el) {
        return el.object.isMesh === true;
    });
    console.log(foundFiltered)

    if (foundFiltered.length > 0 && foundFiltered[0].object.userData.draggable) {
        draggable = foundFiltered[0].object;
        console.log(`found draggable ${draggable.userData.name}`)
    }
})

canvasContainer.addEventListener('mousemove', event => {
    //because the canvas doesn't take up the full screen, we need to offset it when normalizing mouse screen coords
    const offsetWidth = (window.innerWidth - canvasContainer.clientWidth);
    const offsetHeight = (window.innerHeight - canvasContainer.clientHeight);
    moveMouse.x = ( (event.clientX - offsetWidth) / canvasContainer.clientWidth) * 2 -1;
    moveMouse.y = - ( (event.clientY - offsetHeight) / canvasContainer.clientHeight) * 2 +1;
    //console.log("x : " + moveMouse.x + " y : " + moveMouse.y);
})

function dragObject () {
    if (draggable !== null) {
        console.log("draggable");
        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children, true);
        if (found.length > 0) {
            for(let o of found) {
                if(!o.object.userData.ground)
                    continue
                draggable.position.x = o.point.x;
                draggable.position.z = o.point.z;
            }
        }
    }
}

createFloor();
createContainer(2, 1, 3);
for(let i = 0; i < 10; i++) {
    createObject(i, 1, 0)
}
const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 5);
scene.add(hemiLight);





function animate(time) {
    renderer.render(scene, camera);
    // Render the Gizmo
    gizmo.render();
}

function initGrid() {
    // Handle col resizing
    document.querySelectorAll(".resize-handle-x").forEach((handle) => {
        handle.addEventListener("mousedown", startColumnResize);
    });

    // Handle row resizing
    document.querySelectorAll(".resize-handle-y").forEach((handle) => {
        handle.addEventListener("mousedown", startRowResize);
    });

    function startColumnResize(e) {
        e.preventDefault();
        const column = e.target.parentElement;
        const gridContainer = column.parentElement;
        const initialX = e.clientX;
        const columnIndex = Array.from(gridContainer.children).indexOf(
            column
        );
        const initialColumnWidths = Array.from(gridContainer.children).map(
            (col) => col.getBoundingClientRect().width
        );

        function onMouseMove(e) {
            const deltaX = e.clientX - initialX;
            let newWidths = [...initialColumnWidths];

            if (columnIndex < gridContainer.children.length - 1) {
                // Update widths based on mouse movement
                newWidths[columnIndex] += deltaX;
                newWidths[columnIndex + 1] -= deltaX;

                // Ensure minimum width (10% of total)
                const totalWidth = gridContainer.getBoundingClientRect().width;
                const minWidth = totalWidth * 0.1;
                newWidths = newWidths.map((width) => Math.max(width, minWidth));

                // Convert to fractions and normalize to sum to 1
                let fractions = newWidths.map((width) => width / totalWidth);
                const sum = fractions.reduce((a, b) => a + b, 0);
                fractions = fractions.map((fr) => fr / sum);

                // Apply the normalized fractions
                gridContainer.style.gridTemplateColumns = fractions
                    .map((fr) => `${fr.toFixed(3)}fr`)
                    .join(" ");
            }

            resize();
            controls.enabled = false;
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            controls.enabled = true;
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    function startRowResize(e) {
        e.preventDefault();
        const cell = e.target.parentElement;
        const column = cell.parentElement;
        const initialY = e.clientY;
        const rowIndex = Array.from(column.children).indexOf(cell);
        const cells = Array.from(column.children).filter((el) =>
            el.classList.contains("cell")
        );
        const initialRowHeights = cells.map(
            (row) => row.getBoundingClientRect().height
        );
        const totalHeight = column.getBoundingClientRect().height;

        function onMouseMove(e) {
            const deltaY = e.clientY - initialY;
            const newHeights = [...initialRowHeights];

            if (rowIndex < cells.length - 1) {
                newHeights[rowIndex] += deltaY;
                newHeights[rowIndex + 1] -= deltaY;

                let fractions = newHeights.map((height) => height / totalHeight);

                const minFraction = 0.1;
                fractions = fractions.map((fr) => Math.max(fr, minFraction));

                const sum = fractions.reduce((a, b) => a + b, 0);
                fractions = fractions.map((fr) => fr / sum);

                column.style.gridTemplateRows = fractions
                    .map((fr) => `${fr.toFixed(3)}fr`)
                    .join(" ");

                resize();
                controls.enabled = false;
            }
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            controls.enabled = true;
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }
}

//rounded-cube better fits our purposes
function getGizmoConfig() {
    // Gizmo URL type `?type=sphere|cube|rounded-cube`
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type") || "sphere";

    if (type === "sphere") return {};

    if (type === "rounded-cube") {
        const faceConfig = {
            color: 0x444444,
            labelColor: 0xffffff,
            hover: {
                color: 0x4bac84,
            },
        };
        const edgeConfig = {
            color: 0x555555,
            opacity: 1,
            hover: {
                color: 0x4bac84,
            },
        };
        const cornerConfig = {
            ...faceConfig,
            color: 0x444444,
            hover: {
                color: 0x4bac84,
            },
        };
        return {
            type,
            corners: cornerConfig,
            edges: edgeConfig,
            right: faceConfig,
            top: faceConfig,
            front: faceConfig,
            left: faceConfig,
            bottom: faceConfig,
            back: faceConfig,
        }
    }

    const darkColors = {
        color: 0x333333,
        labelColor: 0xdddddd,
        hover: {
            color: 0x4bac84,
            labelColor: 0xffffff,
        },
    };

    const darkBackground = {
        color: 0x444444,
        hover: { color: 0x444444 },
    };

    const darkCubeConfig = {
        type,
        background: darkBackground,
        corners: darkColors,
        edges: darkColors,
        right: darkColors,
        top: darkColors,
        front: darkColors,
    };

    return darkCubeConfig;
}

export function onCreateContainer() {
    event.preventDefault();
    console.log("creating container");
    const containerName = document.getElementById("containerName").value
    const containerHeight = document.getElementById("containerHeight").value
    const containerWidth = document.getElementById("containerWidth").value
    const containerLength = document.getElementById("containerLength").value
    console.log(containerName);
    console.log(containerHeight);
    console.log(containerWidth);
    console.log(containerLength);

    const container = createContainer(containerWidth, containerHeight, containerLength, 1, 1, 1);
    $.post('/create-Container', {
        //_id: container.uuid,
        name: containerName,
        height: containerHeight,
        width: containerWidth,
        length: containerLength
    }).done(function (data) {
            console.log(data.message);
            if(data.message==='success') {
                scene.add(container);
                //renderer.render(scene, camera);
            }
        })

}



export function onCreateRock() {
    event.preventDefault();
    console.log("creating rock");
    const containerName = document.getElementById("containerName").value
    const containerHeight = document.getElementById("containerHeight").value
    const containerWidth = document.getElementById("containerWidth").value
    const containerLength = document.getElementById("containerLength").value
    console.log(containerName);
    console.log(containerHeight);
    console.log(containerWidth);
    console.log(containerLength);

    const container = createContainer(containerWidth, containerHeight, containerLength, 1, 1, 1);
    $.post('/create-Container', {
        //_id: container.uuid,
        name: containerName,
        height: containerHeight,
        width: containerWidth,
        length: containerLength
    }).done(function (data) {
        console.log(data.message);
        if(data.message==='success') {
            scene.add(container);
            //renderer.render(scene, camera);
        }
    })

}

