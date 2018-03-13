import THREE = require('three');
import { Geometry, Vector3, Face3, BufferGeometry } from 'three';

const cb = new THREE.Vector3();
const ab = new THREE.Vector3();

// we use a triangle class to represent structure of face slightly differently
class Triangle {
    normal: Vector3;
    v3: Vertex;
    v2: Vertex;
    v1: Vertex;
    c: Face3;
    b: Face3;
    a: Face3;

    constructor(v1: Vertex, v2: Vertex, v3: Vertex, a: Face3, b: Face3, c: Face3) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.normal = new THREE.Vector3();
        this.computeNormal();
        v1.faces.push(this);
        v1.addUniqueNeighbor(v2);
        v1.addUniqueNeighbor(v3);
        v2.faces.push(this);
        v2.addUniqueNeighbor(v1);
        v2.addUniqueNeighbor(v3);
        v3.faces.push(this);
        v3.addUniqueNeighbor(v1);
        v3.addUniqueNeighbor(v2);
    }

    computeNormal() {
        const vA = this.v1.position;
        const vB = this.v2.position;
        const vC = this.v3.position;
        cb.subVectors(vC, vB);
        ab.subVectors(vA, vB);
        cb.cross(ab).normalize();
        this.normal.copy(cb);
    }

    hasVertex(v: Vertex) {
        return v === this.v1 || v === this.v2 || v === this.v3;
    }

    replaceVertex(oldv: Vertex, newv: Vertex) {
        if (oldv === this.v1) {
            this.v1 = newv;
        } else if (oldv === this.v2) {
            this.v2 = newv;
        } else if (oldv === this.v3) {
            this.v3 = newv;
        }
        SimplifyModifier.removeFromArray(oldv.faces, this);
        newv.faces.push(this);
        oldv.removeIfNonNeighbor(this.v1);
        this.v1.removeIfNonNeighbor(oldv);
        oldv.removeIfNonNeighbor(this.v2);
        this.v2.removeIfNonNeighbor(oldv);
        oldv.removeIfNonNeighbor(this.v3);
        this.v3.removeIfNonNeighbor(oldv);
        this.v1.addUniqueNeighbor(this.v2);
        this.v1.addUniqueNeighbor(this.v3);
        this.v2.addUniqueNeighbor(this.v1);
        this.v2.addUniqueNeighbor(this.v3);
        this.v3.addUniqueNeighbor(this.v1);
        this.v3.addUniqueNeighbor(this.v2);
        this.computeNormal();
    }
}
class Vertex {
    minCost: number;
    totalCost: number;
    costCount: number;
    collapseNeighbor: Vertex;
    collapseCost: number;
    neighbors: Vertex[];
    faces: Triangle[];
    id: number;
    position: THREE.Vector3;

    constructor(v: Vector3, id: number) {
        this.position = v;
        this.id = id; // old index id
        this.faces = []; // faces vertex is connected
        this.neighbors = []; // neighbouring vertices aka "adjacentVertices"
        // these will be computed in computeEdgeCostAtVertex()
        this.collapseCost = 0; // cost of collapsing this vertex, the less the better. aka objdist
        this.collapseNeighbor = null; // best candinate for collapsing
    }

    addUniqueNeighbor(vertex: Vertex) {
        SimplifyModifier.pushIfUnique(this.neighbors, vertex);
    }

    removeIfNonNeighbor(n: Vertex) {
        const neighbors = this.neighbors;
        const faces = this.faces;
        const offset = neighbors.indexOf(n);
        if (offset === -1) {
            return;
        }
        for (let i = 0; i < faces.length; i++) {
            if (faces[i].hasVertex(n)) {
                return;
            }
        }
        neighbors.splice(offset, 1);
    }
}

export class SimplifyModifier {
    v1: Vertex;
    v2: Vertex;
    v3: Vertex;

    static pushIfUnique(array: any, object: any) {
        if (array.indexOf(object) === -1) {
            array.push(object);
        }
    }
    static removeFromArray(array: any, object: any) {
        const k = array.indexOf(object);
        if (k > -1) {
            array.splice(k, 1);
        }
    }
    computeEdgeCollapseCost(u: Vertex, v: Vertex) {
        // if we collapse edge uv by moving u to v then how
        // much different will the model change, i.e. the "error".
        const edgelength = v.position.distanceTo(u.position);
        let curvature = 0;
        const sideFaces = [];
        // tslint:disable-next-line:prefer-const
        let i, uFaces = u.faces, il = u.faces.length, face, sideFace;
        // find the "sides" triangles that are on the edge uv
        for (i = 0; i < il; i++) {
            face = u.faces[i];
            if (face.hasVertex(v)) {
                sideFaces.push(face);
            }
        }
        // use the triangle facing most away from the sides
        // to determine our curvature term
        for (i = 0; i < il; i++) {
            let minCurvature = 1;
            face = u.faces[i];
            for (let j = 0; j < sideFaces.length; j++) {
                sideFace = sideFaces[j];
                // use dot product of face normals.
                const dotProd = face.normal.dot(sideFace.normal);
                minCurvature = Math.min(minCurvature, (1.001 - dotProd) / 2);
            }
            curvature = Math.max(curvature, minCurvature);
        }
        // crude approach in attempt to preserve borders
        // though it seems not to be totally correct
        const borders = 0;
        if (sideFaces.length < 2) {
            // we add some arbitrary cost for borders,
            // borders += 10;
            curvature = 1;
        }
        const amt = edgelength * curvature + borders;
        return amt;
    }
    computeEdgeCostAtVertex(v: Vertex) {
        // compute the edge collapse cost for all edges that start
        // from vertex v.  Since we are only interested in reducing
        // the object by selecting the min cost edge at each step, we
        // only cache the cost of the least cost edge at this vertex
        // (in member variable collapse) as well as the value of the
        // cost (in member variable collapseCost).
        if (v.neighbors.length === 0) {
            // collapse if no neighbors.
            v.collapseNeighbor = null;
            v.collapseCost = -0.01;
            return;
        }
        v.collapseCost = 100000;
        v.collapseNeighbor = null;
        // search all neighboring edges for "least cost" edge
        for (let i = 0; i < v.neighbors.length; i++) {
            const collapseCost = this.computeEdgeCollapseCost(v, v.neighbors[i]);
            if (!v.collapseNeighbor) {
                v.collapseNeighbor = v.neighbors[i];
                v.collapseCost = collapseCost;
                v.minCost = collapseCost;
                v.totalCost = 0;
                v.costCount = 0;
            }
            v.costCount++;
            v.totalCost += collapseCost;
            if (collapseCost < v.minCost) {
                v.collapseNeighbor = v.neighbors[i];
                v.minCost = collapseCost;
            }
        }
        // we average the cost of collapsing at this vertex
        v.collapseCost = v.totalCost / v.costCount;
        // v.collapseCost = v.minCost;
    }
    removeVertex(v: Vertex, vertices: Vertex[]) {
        console.assert(v.faces.length === 0);
        while (v.neighbors.length) {
            const n = v.neighbors.pop();
            SimplifyModifier.removeFromArray(n.neighbors, v);
        }
        SimplifyModifier.removeFromArray(vertices, v);
    }
    removeFace(f: Triangle, faces: Triangle[]) {
        SimplifyModifier.removeFromArray(faces, f);
        if (f.v1) {
            SimplifyModifier.removeFromArray(f.v1.faces, f);
        }
        if (f.v2) {
            SimplifyModifier.removeFromArray(f.v2.faces, f);
        }
        if (f.v3) {
            SimplifyModifier.removeFromArray(f.v3.faces, f);
        }
        // TODO optimize this!
        const vs = [this.v1, this.v2, this.v3];
        let v1, v2;
        for (let i = 0; i < 3; i++) {
            v1 = vs[i];
            v2 = vs[(i + 1) % 3];
            if (!v1 || !v2) {
                continue;
            }
            v1.removeIfNonNeighbor(v2);
            v2.removeIfNonNeighbor(v1);
        }
    }
    collapse(vertices: Vertex[], faces: Triangle[], u: Vertex, v: Vertex) {
        // Collapse the edge uv by moving vertex u onto v
        if (!v) {
            this.
                // u is a vertex all by itself so just delete it..
                removeVertex(u, vertices);
            return;
        }
        let i;
        const tmpVertices = [];
        for (i = 0; i < u.neighbors.length; i++) {
            tmpVertices.push(u.neighbors[i]);
        }
        // delete triangles on edge uv:
        for (i = u.faces.length - 1; i >= 0; i--) {
            if (u.faces[i].hasVertex(v)) {
                this.removeFace(u.faces[i], faces);
            }
        }
        // update remaining triangles to have v instead of u
        for (i = u.faces.length - 1; i >= 0; i--) {
            u.faces[i].replaceVertex(u, v);
        }
        this.removeVertex(u, vertices);
        // recompute the edge collapse costs in neighborhood
        for (i = 0; i < tmpVertices.length; i++) {
            this.computeEdgeCostAtVertex(tmpVertices[i]);
        }
    }
    minimumCostEdge(vertices: Vertex[]) {
        // O(n * n) approach. TODO optimize this
        let least = vertices[0];
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].collapseCost < least.collapseCost) {
                least = vertices[i];
            }
        }
        return least;
    }
    modify(geometry: Geometry, count: number) {
        geometry.mergeVertices();
        const oldVertices = geometry.vertices; // Three Position
        const oldFaces = geometry.faces; // Three Face
        const newGeometry = new THREE.Geometry();
        // conversion
        const vertices = new Array(oldVertices.length); // Simplify Custom Vertex Struct
        const faces = new Array(oldFaces.length); // Simplify Custom Traignle Struct
        let i, il, face;
        //
        // put data of original geometry in different data structures
        //
        // add vertices
        for (i = 0, il = oldVertices.length; i < il; i++) {
            vertices[i] = new Vertex(oldVertices[i], i);
        }
        // add faces
        for (i = 0, il = oldFaces.length; i < il; i++) {
            face = oldFaces[i];
            faces[i] = new Triangle(vertices[face.a], vertices[face.b], vertices[face.c], face.a, face.b, face.c);
        }
        // compute all edge collapse costs
        for (i = 0, il = vertices.length; i < il; i++) {
            this.computeEdgeCostAtVertex(vertices[i]);
        }
        const permutation = new Array(vertices.length);
        const map = new Array(vertices.length);
        let nextVertex;
        let z = count;
        // console.time('z')
        // console.profile('zz');
        while (z--) {
            nextVertex = this.minimumCostEdge(vertices);
            if (!nextVertex) {
                console.log('no next vertex');
                break;
            }
            this.collapse(vertices, faces, nextVertex, nextVertex.collapseNeighbor);
        }
        // console.profileEnd('zz');
        // console.timeEnd('z')
        // TODO convert to buffer geometry.
        const newGeo = new THREE.Geometry();
        for (i = 0; i < vertices.length; i++) {
            const v = vertices[i];
            newGeo.vertices.push(v.position);
        }
        for (i = 0; i < faces.length; i++) {
            const tri = faces[i];
            newGeo.faces.push(new THREE.Face3(vertices.indexOf(tri.v1), vertices.indexOf(tri.v2), vertices.indexOf(tri.v3)));
        }
        return newGeo;
    }
}
