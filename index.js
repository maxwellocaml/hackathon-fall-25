//https://threejs.org/manual/#en/creating-a-scene
import * as THREE from 'three';

//https://github.com/fennec-hub/ThreeOrbitControlsGizmo
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { loadThreeModel } from "/public/js/models.js";
import {RGBELoader} from "three/addons/loaders/RGBELoader";
import {ReinhardToneMapping} from "three";

// Initialize Gird
const resizableGrid = initGrid();
const canvasContainer = document.querySelector("#canvas-container");

//initialize scene variables
//scene
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0xADD8E6); // Light blue color


//camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
//renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(
    canvasContainer.clientWidth,
    canvasContainer.clientHeight
);
renderer.toneMapping = ReinhardToneMapping;
renderer.setAnimationLoop(animate);
canvasContainer.appendChild( renderer.domElement );

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

//threemodel is imported from seperate js file which can import many objects at once
const [threeModel, threeModelAnimation] = loadThreeModel(scene, renderer);
scene.add(threeModel);


// Init Gizmo with OrbitControls
const gizmo = new ViewportGizmo(camera, renderer, {
    container: canvasContainer,
    ...getGizmoConfig(),
});
gizmo.attachControls(new OrbitControls(camera, renderer.domElement));

camera.position.set(5, 5, 5);
gizmo.target.set(0, 0, 0);
camera.lookAt(gizmo.target);

//animation/render loop
function animate(time) {
    threeModelAnimation();
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.render(scene, camera);

    // Render the Gizmo
    renderer.toneMapping = THREE.NoToneMapping;
    gizmo.render();
}


//refresh the size of the content when window size is affected
window.onresize = resize;
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