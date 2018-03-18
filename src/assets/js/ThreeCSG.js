THREE.CSG = {
  toCSG: function (three_model) {
    var i, geometry, polygons, vertices;

    if (!CSG) {
      throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
    }

    if (three_model instanceof THREE.Mesh) {
      geometry = new THREE.Geometry();
      geometry.mergeMesh(three_model);
    } else if (three_model instanceof THREE.Geometry) {
      geometry = three_model;
    } else {
      throw 'Model type not supported.';
    }

    var polygons = [];
    for (i = 0; i < geometry.faces.length; i++) {
      if (geometry.faces[i] instanceof THREE.Face3) {
        vertices = [
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].a])),
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].b])),
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].c]))
        ];
        polygons.push(new CSG.Polygon(vertices));
      } else if (geometry.faces[i] instanceof THREE.Face4) {
        vertices = [
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].a])),
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].b])),
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].d]))
        ];
        polygons.push(new CSG.Polygon(vertices));
        vertices = [
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].b])),
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].c])),
          new CSG.Vertex(new CSG.Vector3D(geometry.vertices[geometry.faces[i].d]))
        ];
        polygons.push(new CSG.Polygon(vertices));
      } else {
        throw 'Model contains unsupported face.';
      }
    }

    return CSG.fromPolygons(polygons);
  },

  fromCSG: function (csg_model) {
    var i, j, vertices, face,
      three_geometry = new THREE.Geometry(),
      polygons = csg_model.toPolygons();

    if (!CSG) {
      throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
    }

    for (i = 0; i < polygons.length; i++) {

      // Vertices
      vertices = [];
      for (j = 0; j < polygons[i].vertices.length; j++) {
        vertices.push(this.getGeometryVertice(three_geometry, polygons[i].vertices[j].pos));
      }
      if (vertices[0] === vertices[vertices.length - 1]) {
        vertices.pop();
      }

      for (var j = 2; j < vertices.length; j++) {
        face = new THREE.Face3(vertices[0], vertices[j - 1], vertices[j], new THREE.Vector3().copy(polygons[i].plane.normal));
        three_geometry.faces.push(face);
        //three_geometry.faceVertexUvs[0].push( new THREE.UV( ) );
      }
    }

    three_geometry.computeBoundingBox();

    return three_geometry;
  },

  getGeometryVertice: function getGeometryVertice(geometry, vertice_position) {
    //var i;
    //for ( i = 0; i < geometry.vertices.length; i++ ) {
    //	if ( geometry.vertices[i].position.x === vertice_position.x
    //		&& geometry.vertices[i].position.y === vertice_position.y
    //		&& geometry.vertices[i].position.z === vertice_position.z ) {
    //		// Vertice already exists
    //		return i;
    //	}
    //};

    geometry.vertices.push(new THREE.Vector3(vertice_position.x, vertice_position.y, vertice_position.z));
    return geometry.vertices.length - 1;
  }
};
