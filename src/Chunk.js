import SimplexNoise from "simplex-noise";
import {
  triangulation,
  cornerIndexAFromEdge,
  cornerIndexBFromEdge,
  CornerTable,
  EdgeIndexes,
} from "./CubeData.js";
import { v3 } from "twgl.js";

const simplex = new SimplexNoise("seed");
const isoLevel = 0.1;

export default class Chunk {
  constructor() {
    this.width = 16;
    this.height = 16;
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.data = [];
    this.initData();

    this.interpolate = true;
    this.indexed = true;
  }

  initData() {
    let then = new Date().getTime();

    this.data = [];

    let cx = this.width / 2;
    let cy = this.height / 2;
    let cz = this.width / 2;
    let r = this.width / 2 - 1;
    for (let x = 0; x < this.width + 1; x++) {
      this.data[x] = [];
      for (let y = 0; y < this.height + 1; y++) {
        this.data[x][y] = [];
        for (let z = 0; z < this.width + 1; z++) {
          let v =
            Math.pow(x - cx, 2) + Math.pow(y - cy, 2) + Math.pow(z - cz, 2);

          if (v < r * r) {
            this.data[x][y][z] = 1 - Math.sqrt(v) / r;
          } else {
            this.data[x][y][z] = 0;
          }
          /*
          if (v < r * r) {
            this.data[x][y][z] = simplex.noise3D(
              x / (this.width / 2),
              y / (this.height / 2),
              z / (this.width / 2)
            );
          } else {
            this.data[x][y][z] = 0;
          }*/

          if (
            x > this.width - 1 ||
            x < 1 ||
            y > this.height - 1 ||
            y < 1 ||
            z > this.width - 1 ||
            z < 1
          ) {
            this.data[x][y][z] = 1;
          }
        }
      }
    }
    console.log(`data creation time:  ${new Date().getTime() - then} ms`);
  }

  resetMesh() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
  }

  createMesh() {
    let then = new Date().getTime();

    this.resetMesh();

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.width; z++) {
          this.marchCube(x, y, z);
        }
      }
    }

    //draw mesh

    console.log(`mesh creation time:  ${new Date().getTime() - then} ms`);

    if (this.indexed) {
      this.calculateIndexedFaceNormals();
    } else {
      this.calculateFaceNormals();
    }
  }

  calculateIndexedFaceNormals() {
    let then = new Date().getTime();

    let vertex = [];
    let n = 0;
    let fx, fy, fz;
    let sx, sy, sz;
    let tx, ty, tz;
    for (let i = 0; i < this.indices.length; i++) {
      let x = this.indices[i] * 3;
      let y = x + 1;
      let z = x + 2;

      vertex[n] = [this.vertices[x], this.vertices[y], this.vertices[z]];

      if (n === 0) {
        fx = x;
        fy = y;
        fz = z;
      }

      if (n === 1) {
        sx = x;
        sy = y;
        sz = z;
      }

      if (n === 2) {
        tx = x;
        ty = y;
        tz = z;
      }
      n++;

      if (n % 3 === 0) {
        let p = v3.cross(
          v3.subtract(vertex[1], vertex[0]),
          v3.subtract(vertex[2], vertex[0])
        );

        this.normals[fx] += p[0];
        this.normals[fy] += p[1];
        this.normals[fz] += p[2];

        this.normals[sx] += p[0];
        this.normals[sy] += p[1];
        this.normals[sz] += p[2];

        this.normals[tx] += p[0];
        this.normals[ty] += p[1];
        this.normals[tz] += p[2];

        n = 0;
      }
    }

    for (let i = 0; i < this.normals.length; i += 3) {
      let x = i;
      let y = i + 1;
      let z = i + 2;

      const lenSq =
        this.normals[x] * this.normals[x] +
        this.normals[y] * this.normals[y] +
        this.normals[z] * this.normals[z];
      const len = Math.sqrt(lenSq);
      this.normals[x] = this.normals[x] / len;
      this.normals[y] = this.normals[y] / len;
      this.normals[z] = this.normals[z] / len;
    }

    console.log(
      `indexed face normal calculation time:  ${new Date().getTime() - then} ms`
    );
  }

  calculateFaceNormals() {
    let then = new Date().getTime();

    let vertex = [];
    let n = 0;
    for (let i = 0; i < this.indices.length; i++) {
      let x = this.indices[i] * 3;
      let y = x + 1;
      let z = x + 2;

      vertex[n] = [this.vertices[x], this.vertices[y], this.vertices[z]];

      n++;
      if (n % 3 === 0) {
        let p = v3.cross(
          v3.subtract(vertex[1], vertex[0]),
          v3.subtract(vertex[2], vertex[0])
        );

        this.normals.push(p[0], p[1], p[2]);
        this.normals.push(p[0], p[1], p[2]);
        this.normals.push(p[0], p[1], p[2]);

        n = 0;
      }
    }

    console.log(
      `face normal calculation time:  ${new Date().getTime() - then} ms`
    );
  }

  marchCube(x, y, z) {
    let cubeCorners = [];
    let cubeIndex = 0;

    for (let i = 0; i < 8; i++) {
      let p = CornerTable[i];

      cubeCorners[i] = this.data[x + p[0]][y + p[1]][z + p[2]];

      if (cubeCorners[i] < isoLevel) cubeIndex |= 1 << i;
    }

    if (cubeIndex === 0 || cubeIndex === 255) {
      return;
    }

    let n = 0;
    let vertex = [];
    for (let i = 0; triangulation[cubeIndex][i] != -1; i++) {
      let vA = CornerTable[cornerIndexAFromEdge[triangulation[cubeIndex][i]]];
      let vB = CornerTable[cornerIndexBFromEdge[triangulation[cubeIndex][i]]];

      if (this.interpolate) {
        // Get the terrain values at either end of our current edge from the cube array created above.
        let vert1Sample =
          cubeCorners[cornerIndexAFromEdge[triangulation[cubeIndex][i]]];
        let vert2Sample =
          cubeCorners[cornerIndexBFromEdge[triangulation[cubeIndex][i]]];

        // Calculate the difference between the terrain values.
        let difference = vert2Sample - vert1Sample;

        // If the difference is 0, then the terrain passes through the middle.
        if (difference == 0) difference = isoLevel;
        else difference = (isoLevel - vert1Sample) / difference;

        // Calculate the point along the edge that passes through.
        vertex[n] = [
          x + (vA[0] + (vB[0] - vA[0]) * difference),
          y + (vA[1] + (vB[1] - vA[1]) * difference),
          z + (vA[2] + (vB[2] - vA[2]) * difference),
        ];
      } else {
        vertex[n] = [
          x + (vA[0] + vB[0]) / 2,
          y + (vA[1] + vB[1]) / 2,
          z + (vA[2] + vB[2]) / 2,
        ];
      }

      if (this.indexed) {
        this.vertForIndice(vertex[n]);
      } else {
        this.vertices.push(vertex[n][0], vertex[n][1], vertex[n][2]);
        this.indices.push(this.vertices.length / 3 - 1);
      }
    }
  }

  vertForIndice(vert) {
    // Loop through all the vertices currently in the vertices list.
    for (let i = 0; i < this.vertices.length; i += 3) {
      // If we find a vert that matches ours, then simply return this index.
      if (
        this.vertices[i] == vert[0] &&
        this.vertices[i + 1] == vert[1] &&
        this.vertices[i + 2] == vert[2]
      ) {
        this.indices.push(i / 3);
        return;
      }
    }

    // If we didn't find a match, add this vert to the list and return last index.
    this.vertices.push(vert[0], vert[1], vert[2]);
    this.indices.push(this.vertices.length / 3 - 1);
    this.normals.push(0, 0, 0);
  }
}
