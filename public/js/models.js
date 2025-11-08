//https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/common/threeModel.js
import {
    Group,
    Mesh,
    PMREMGenerator,
    AmbientLight,
    DirectionalLight,
    PointLight,
    Clock,
    MeshPhysicalMaterial,
    DoubleSide,
    SphereGeometry,
    BoxGeometry,
    OctahedronGeometry,
    ConeGeometry,
    CineonToneMapping,
    Color,
    GridHelper,
} from "three";
//import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
//import { FontLoader } from "three/addons/loaders/FontLoader.js";
//import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const ROOT = "../../three-viewport-gizmo/assets/";

export const loadThreeModel = (scene, renderer) => {
    const threeModel = new Group();
    scene.add(threeModel);


    //reactive threejs site for tweaking materials:
    //https://threejs.org/docs/scenes/material-browser.html#MeshPhysicalMaterial
    const materialTest = new MeshPhysicalMaterial({
        color: 0x1e2742,
        transparent: true,
        opacity: 0.6,
        side: DoubleSide,
        depthTest: true,
        depthWrite: true,
        metalness: 0,
        roughness: 0.5,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0,
        transmission: 0,
        //reflectivity: 0.5,
        ior: 1.5,
        //iridescence: 0.2,
        //iridescenceIOR: 0.5,
        sheen: 0.2,
        sheenRoughness: 0.8,
        specularIntensity: 1,
    });

    // Material
    const material = new MeshPhysicalMaterial({
        color: 0,
        transparent: true,
        side: DoubleSide,
        metalness: 1,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1,
        transmission: 0,
        opacity: 0.5,
        reflectivity: 1,
        ior: 2.33,
        iridescence: 0.2,
        iridescenceIOR: 0.5,
        sheen: 2,
        sheenRoughness: 0.5,
        specularIntensity: 1,
    });
    // GridHelper
    threeModel.add(new GridHelper(10, 10, 0x111111, 0x111111));

    // Lights
    const lightGroup = new Group();


    //lightGroup.add(pointLight1, pointLight2, pointLight3);
    //threeModel.add(lightGroup, new AmbientLight(0x000000, 100));

    // Lighting
    const ambientLight = new AmbientLight(new Color(1.0, 1.0, 1.0), 0.25);
    threeModel.add(ambientLight);
    const directionalLight = new DirectionalLight(0xffffff, 0.35);
    directionalLight.position.set(150, 200, 50);
// Shadows
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.left = -75;
    directionalLight.shadow.camera.right = 75;
    directionalLight.shadow.camera.top = 75;
    directionalLight.shadow.camera.bottom = -75;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = -0.001;
    directionalLight.shadow.blurSamples = 8;
    directionalLight.shadow.radius = 4;
    threeModel.add(directionalLight);
    const directionalLight2 = new DirectionalLight(0xffffff, 0.15);
    directionalLight2.color.setRGB(1.0, 1.0, 1.0);
    directionalLight2.position.set(-50, 200, -150);
    threeModel.add(directionalLight2);
    threeModel.add(lightGroup, new AmbientLight(0x000000, 100));

    // Environment
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();


    // Primitives
    const sphere = new Mesh(new SphereGeometry(0.5, 100, 100), material);
    sphere.position.set(4, 2.5, 0);

    const octahedron = new Mesh(new OctahedronGeometry(0.5), material);
    octahedron.position.set(1, 6, 0);
    octahedron.rotation.z = Math.PI / 4;

    const cone = new Mesh(new ConeGeometry(0.5, 1.5), material);
    cone.position.set(-4, 2, 0);
    cone.rotation.z = -Math.PI / 6;

    const cube = new Mesh(new BoxGeometry(5, 1, 3), materialTest);
    cube.position.set(1, 1, 0);

    const cone2 = new Mesh(new ConeGeometry(1, 1.5), materialTest);
    cone2.position.set(-2, 2, 0);
    cone2.rotation.z = -Math.PI / 6;

    threeModel.add(sphere, octahedron, cone, cone2, cube);

    const clock = new Clock();
    function threeModelAnimation() {
        const time = clock.getElapsedTime();

        // Rotation
        lightGroup.rotation.y += 0.01;
        octahedron.rotation.y += 0.01;
        cone.rotation.y += 0.01;

        // Float
        sphere.position.y = 2.5 + Math.cos(time + 2) * 0.25;
        octahedron.position.y = 6 + Math.cos(time + 1) * 0.2;
        cone.position.y = 2 + Math.cos(time) * 0.3;
    }

    // Dom Credit
    document.body.appendChild(
        Object.assign(document.createElement("div"), {
            style:
                "position:absolute;bottom:1em;left:1em;z-index:1000;font:13px sans-serif;color:#111;",
            innerHTML:
                'Thanks to <a href="https://sketchfab.com/mevedia" style="color:#fff;text-decoration:none;">Fyrestar</a>, for the <a href="https://sketchfab.com/3d-models/threejs-60320862bf904b7ab0e032c27daf7c7c" style="color:#fff;text-decoration:none;">Three.js 3D logo</a>',
        })
    );

    return [threeModel, threeModelAnimation];
};