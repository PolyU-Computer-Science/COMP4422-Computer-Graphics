// js/mesh.js — an INDEXED mesh on the GPU: one vertex buffer (position+normal+uv, interleaved)
// plus one element buffer, wrapped in a VAO.  Drawn with gl.drawElements.
export class Mesh {
  // data = { positions: Float32Array(3n), normals: Float32Array(3n), uvs?: Float32Array(2n), indices: Uint16/32Array }
  // Vertex layout shared by the whole team:  location 0 = aPos, 1 = aNormal, 2 = aTexCoord.
  constructor(gl, data, name = 'mesh') {
    this.name = name;
    this.vertexCount = data.positions.length / 3;
    this.indexCount = data.indices.length;
    this.indexType = data.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

    // Interleave: x y z nx ny nz u v  (8 floats = stride 32 bytes). Missing UVs become (0,0).
    const inter = new Float32Array(this.vertexCount * 8);
    for (let i = 0; i < this.vertexCount; i++) {
      inter.set(data.positions.subarray(i * 3, i * 3 + 3), i * 8);
      inter.set(data.normals.subarray(i * 3, i * 3 + 3), i * 8 + 3);
      if (data.uvs) inter.set(data.uvs.subarray(i * 2, i * 2 + 2), i * 8 + 6);
    }

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);            // VAO records the bindings below

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, inter, gl.STATIC_DRAW);

    this.ebo = gl.createBuffer();            // ELEMENT_ARRAY_BINDING is stored in the VAO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);

    // Fixed attribute locations (declared with layout(location=N) in the vertex shader).
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);   // aPos
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);  // aNormal
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);  // aTexCoord
    gl.bindVertexArray(null);
  }

  draw(gl) {
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.indexCount, this.indexType, 0);
    gl.bindVertexArray(null);
  }
}

// Pick the smallest index type that fits.
export function makeIndices(arr, vertexCount) {
  return vertexCount > 65535 ? Uint32Array.from(arr) : Uint16Array.from(arr);
}
