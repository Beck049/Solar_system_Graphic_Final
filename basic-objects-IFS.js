
/**
 * The functions in this file create models in an
 * IFS format that can be drawn using gl.drawElements
 * with primitive type gl.TRIANGLES.  Objects have
 * vertex coordinates, normal vectors, and texture
 * coordinates for each vertex, plus a list of indicies
 * for the element array buffer.  The return value
 * of each function is an object, model, with properties:
 * model.vertexPositions -- the vertex coordinates;
 * model.vertexNormals -- the normal vectors;
 * model.vertexTextureCoords -- the texture coordinates;
 * model.indices -- the face indices. The first three
 * properties are of type Float32Array, while model.indices
 * is of type Uint16Array.
 *
 * This file also defines a variable (not a function) teapotIFS
 * which is s model of the OpenGL teapot in the same format.
 */
 
 /**
  * Create a model of a cube, centered at the origin.  (This is not
  * a particularly good format for a cube, since an IFS representation
  * has a lot of redundancy.)
  * @side the length of a side of the cube.  If not given, the value will be 1.
  */
function cube(side) {
    var s = (side || 1)/2;
    var coords = [];
    var normals = [];
    var texCoords = [];
    var indices = [];
    function face(xyz, nrm) {
        var start = coords.length/3;
        var i;
        for (i = 0; i < 12; i++) {
            coords.push(xyz[i]);
        }
        for (i = 0; i < 4; i++) {
            normals.push(nrm[0],nrm[1],nrm[2]);
        }
        texCoords.push(0,0,1,0,1,1,0,1);
        indices.push(start,start+1,start+2,start,start+2,start+3);
    }
    face( [-s,-s, s,  s,-s, s,  s, s, s, -s, s, s], [ 0, 0, 1] );
    face( [-s,-s,-s, -s, s,-s,  s, s,-s,  s,-s,-s], [ 0, 0,-1] );
    face( [-s, s,-s, -s, s, s,  s, s, s,  s, s,-s], [ 0, 1, 0] );
    face( [-s,-s,-s,  s,-s,-s,  s,-s, s, -s,-s, s], [ 0,-1, 0] );
    face( [ s,-s,-s,  s, s,-s,  s, s, s,  s,-s, s], [ 1, 0, 0] );
    face( [-s,-s,-s, -s,-s, s, -s, s, s, -s, s,-s], [-1, 0, 0] );
    return {
        vertexPositions: new Float32Array(coords),
        vertexNormals: new Float32Array(normals),
        vertexTextureCoords: new Float32Array(texCoords),
        indices: new Uint16Array(indices)
    }
}

/**
 * Creates a modle of an annulus or disk lying in the xy plane,
 * centered at the origin.  (This is not a great representation,
 * since all the normals are the same.)
 * @param innerRadius the radius of the hole in the radius; a value of
 *    zero will give a disk rather than a ring.  If not present,
 *    the default value is 0.25.
 * @param outerRadius the radius of the ring, from the center to teh
 *    outer edge.  Must be greater than innerRadius.  If not provided,
 *    the default value is 2*innerRadius or is 0.5 if innerRadius is 0.
 * @slices the number of radial subdivisions in the circular approximation
 *    of an annulus.  If not provided, the value will be 32.
 */
function ring(innerRadius, outerRadius, slices) {
    if (arguments.length == 0)
        innerRadius = 0.25;
    outerRadius = outerRadius || innerRadius * 2 || 0.5;
    slices = slices || 32;
    var vertexCount, vertices, normals, texCoords, indices, i;
    vertexCount = (innerRadius == 0)? slices + 1 : slices * 2;
    vertices = new Float32Array( 3*vertexCount );
    normals = new Float32Array( 3* vertexCount );
    texCoords = new Float32Array( 2*vertexCount );
    indices = new Uint16Array( innerRadius == 0 ?  3*slices : 3*2*slices );
    var d = 2*Math.PI/slices;
    var k = 0;
    var t = 0;
    var n = 0;
    if (innerRadius == 0) {
        for (i = 0; i < slices; i++) {
            c = Math.cos(d*i);
            s = Math.sin(d*i);
            vertices[k++] = c*outerRadius;
            vertices[k++] = s*outerRadius;
            vertices[k++] = 0;
            texCoords[t++] = 0.5 + 0.5*c;
            texCoords[t++] = 0.5 + 0.5*s;
            indices[n++] = slices;
            indices[n++] = i;
            indices[n++] = i == slices-1 ? 0 : i + 1;
        }
        vertices[k++] = vertices[k++] = vertices[k++] = 0;
        texCoords[t++] = texCoords[t++] = 0;
    } else {
        var r = innerRadius / outerRadius;
        for (i = 0; i < slices; i++) {
            c = Math.cos(d*i);
            s = Math.sin(d*i);
            vertices[k++] = c*innerRadius;
            vertices[k++] = s*innerRadius;
            vertices[k++] = 0;
            texCoords[t++] = 0.5 + 0.5*c*r;
            texCoords[t++] = 0.5 + 0.5*s*r;
            vertices[k++] = c*outerRadius;
            vertices[k++] = s*outerRadius;
            vertices[k++] = 0;
            texCoords[t++] = 0.5 + 0.5*c;
            texCoords[t++] = 0.5 + 0.5*s;
        }
        for (i = 0; i < slices - 1; i++) {
            indices[n++] = 2*i;
            indices[n++] = 2*i+1;
            indices[n++] = 2*i+3;
            indices[n++] = 2*i;
            indices[n++] = 2*i+3;
            indices[n++] = 2*i+2;
        }
        indices[n++] = 2*i;
        indices[n++] = 2*i+1;
        indices[n++] = 1;
        indices[n++] = 2*i;
        indices[n++] = 1;
        indices[n++] = 0;
    }
    for (i = 0; i < vertexCount; i++) {
        normals[3*i] = normals[3*i+1] = 0;
        normals[3*i+2] = 1;
    }
    return {
        vertexPositions: vertices,
        vertexNormals: normals,
        vertexTextureCoords: texCoords,
        indices: indices
    };
}

/**
 * Create a model of a sphere.  The z-axis is the axis of the sphere,
 * with the north pole on the positive z-axis and the center at (0,0,0).
 * @param radius the radius of the sphere, default 0.5 if not specified.
 * @param slices the number of lines of longitude, default 32
 * @param stacks the number of lines of latitude plus 1, default 16.  (This 
 *    is the number of vertical slices, bounded by lines of latitude, the
 *    north pole and the south pole.)
 */
function obj_sphere(radius, pos_x, pos_y, pos_z ,alpha ,degree)
{

    this.numVertices = 0;
    this.pointsArray = [];
    this.colorsArray = [];
    this.normalsArray = [];
    this.texcoords = [];
    this.pos_loc = [pos_x,pos_y,pos_z];

    let tex_index = 0;//test_for_texcord
    this.spherePoint = function (theta, phi) {
        var V = vec4(radius*Math.cos(theta)*Math.cos(phi)+pos_x, radius*Math.sin(phi)+pos_y, radius*Math.sin(theta)*Math.cos(phi)+pos_z, 1.0);//計算座標
        //var V = vec4(Math.cos(theta)*Math.cos(phi)+pos_x/radius, 0, Math.sin(theta)*Math.cos(phi)+pos_z/radius, 1.0);
        var smallV = scalev(radius, V); // scale the sphere to the range of [-0.5, 0.5]


        this.pointsArray.push(smallV);
        V[3]=0.0;
        V[0]-=pos_x;
        V[1]-=pos_y;
        V[2]-=pos_z; // convert point to vector
        normalize(V, 1);
        this.normalsArray.push(V);
        this.colorsArray.push(vec4(1.0, 0.0, 0.0, alpha));
        this.texcoords.push(0+theta/Math.PI/2.0);//test_for_texcord
        this.texcoords.push(0+phi/Math.PI+0.5);//test_for_texcord
    }

    var step = degree;//模組細節度->>推測
    var rP1, rP2, rT1, rT2;
    var phi, theta, lastPhi=-90, lastTheta=0;

    for (phi=-90+step; phi<=90; phi+=step) {
        rP1 = lastPhi / 180.0 * Math.PI;
        rP2 = phi / 180.0 * Math.PI;

        for (theta=step; theta<=360+step; theta+=step) {
            rT1 = lastTheta / 180.0 * Math.PI;
            rT2 = theta / 180.0 * Math.PI;
            
            // first triangle, may be skipped for the south pole
            if (lastPhi != -90) {
                this.spherePoint(rT1, rP1);
                this.spherePoint(rT2, rP1);
                this.spherePoint(rT1, rP2);
                this.numVertices += 3;
            }
            
            // second triangle, may be skipped for the north pole
            if (phi != 90) {
                this.spherePoint(rT2, rP2);
                this.spherePoint(rT1, rP2);
                this.spherePoint(rT2, rP1);
                this.numVertices += 3;
            }
            lastTheta = theta;
        }     
        lastPhi = phi;    
    }
}



function obj_ring(inner_radius,outer_radius, pos_x, pos_y, pos_z ,alpha ,degree)
{
    this.numVertices = 0;
    this.pointsArray = [];
    this.colorsArray = [];
    this.normalsArray = [];
    this.texcoords = [];
    this.pos_loc = [pos_x,pos_y,pos_z];
    this.spherePoint = function (theta, radius) {
        var V = vec4(radius*Math.cos(theta)+pos_x, 0+pos_y, radius*Math.sin(theta)+pos_z, 1.0);//計算座標
        var smallV = scalev(radius, V); // scale the sphere to the range of [-0.5, 0.5]

        this.pointsArray.push(smallV);
        V[3]=0.0;
        V[0]-=pos_x;
        V[1]-=pos_y;
        V[2]-=pos_z; // convert point to vector
        normalize(V, 1);
        this.normalsArray.push(V);
        this.colorsArray.push(vec4(1.0, 0.0, 0.0, alpha));
    }

    var step = degree;//模組細節度->>推測 改得越低->>越圓
    var rP1, rP2, rT1, rT2;
    var phi, theta, lastPhi=-90, lastTheta=0;

    for (theta=step; theta<=360; theta+=step) {
        rT1 = lastTheta / 180.0 * Math.PI;
        rT2 = theta / 180.0 * Math.PI;
            
        this.spherePoint(rT1, inner_radius);
        this.texcoords.push(1);//test_for_texcord
        this.texcoords.push(1);
        this.spherePoint(rT2, outer_radius);
        this.texcoords.push(0);//test_for_texcord
        this.texcoords.push(0);
        this.spherePoint(rT1, outer_radius);
        this.texcoords.push(1);//test_for_texcord
        this.texcoords.push(0);
        this.numVertices += 3;
            
        this.spherePoint(rT2, outer_radius);
        this.texcoords.push(0);//test_for_texcord
        this.texcoords.push(0);
        this.spherePoint(rT1, inner_radius);
        this.texcoords.push(1);//test_for_texcord
        this.texcoords.push(1);
        this.spherePoint(rT2, inner_radius);
        this.texcoords.push(0);//test_for_texcord
        this.texcoords.push(1);
        this.numVertices += 3;
        lastTheta = theta;
    }     
}


function uvSphere(radius, slices, stacks, pos_x, pos_y, pos_z) {
    radius = radius || 0.5;
    slices = slices || 32;
    stacks = stacks || 16;
    pos_x = pos_x||0;
    pos_y = pos_y||0;
    pos_z = pos_z||0;
    var vertexCount = (slices+1)*(stacks+1);
    var vertices  = new Float32Array( 3*vertexCount );
    var normals   = new Float32Array( 3* vertexCount );
    var texCoords = new Float32Array( 2*vertexCount );
    var indices   = new Uint16Array( 2*slices*stacks*3 );
    var du = 2*Math.PI/slices;
    var dv = Math.PI/stacks;
    var i,j,u,v,x,y,z;
    var indexV = 0;
    var indexT = 0;
    for (i = 0; i <= stacks; i++) {
        v = -Math.PI/2 + i*dv;
        for (j = 0; j <= slices; j++) {
            u = j*du;
            x = Math.cos(u)*Math.cos(v);
            y = Math.sin(u)*Math.cos(v);
            z = Math.sin(v);
            vertices[indexV] = radius*x+pos_x;
            normals[indexV++] = x;
            vertices[indexV] = radius*y+pos_y;
            normals[indexV++] = y;
            vertices[indexV] = radius*z+pos_z;
            normals[indexV++] = z;
            texCoords[indexT++] = j/slices;
            texCoords[indexT++] = i/stacks;
        } 
    }
    var k = 0;
    for (j = 0; j < stacks; j++) {
        var row1 = j*(slices+1);
        var row2 = (j+1)*(slices+1);
        for (i = 0; i < slices; i++) {
            indices[k++] = row1 + i;
            indices[k++] = row2 + i + 1;
            indices[k++] = row2 + i;
            indices[k++] = row1 + i;
            indices[k++] = row1 + i + 1;
            indices[k++] = row2 + i + 1;
        }
    }
    return {
        vertexPositions: vertices,
        vertexNormals: normals,
        vertexTextureCoords: texCoords,
        indices: indices
    };
}


/**
 * Create a model of a torus (surface of a doughnut).  The z-axis goes through the doughnut hole,
 * and the center of the torus is at (0,0,0).
 * @param outerRadius the distance from the center to the outside of the tube, 0.5 if not specified.
 * @param innerRadius the distance from the center to the inside of the tube, outerRadius/3 if not
 *    specified.  (This is the radius of the doughnut hole.)
 * @param slices the number of lines of longitude, default 32.  These are slices parallel to the
 * z-axis and go around the tube the short way (through the hole).
 * @param stacks the number of lines of latitude plus 1, default 16.  These lines are perpendicular
 * to the z-axis and go around the tube the long way (arouind the hole).
 */
function uvTorus(outerRadius, innerRadius, slices, stacks) {
    outerRadius = outerRadius || 0.5;
    innerRadius = innerRadius || outerRadius/3;
    slices = slices || 32;
    stacks = stacks || 16;
    var vertexCount = (slices+1)*(stacks+1);
    var vertices = new Float32Array( 3*vertexCount );
    var normals = new Float32Array( 3* vertexCount );
    var texCoords = new Float32Array( 2*vertexCount );
    var indices = new Uint16Array( 2*slices*stacks*3 );
    var du = 2*Math.PI/slices;
    var dv = 2*Math.PI/stacks;
    var centerRadius = (innerRadius+outerRadius)/2;
    var tubeRadius = outerRadius - centerRadius;
    var i,j,u,v,cx,cy,sin,cos,x,y,z;
    var indexV = 0;
    var indexT = 0;
    for (j = 0; j <= stacks; j++) {
        v = -Math.PI + j*dv;
        cos = Math.cos(v);
        sin = Math.sin(v);
        for (i = 0; i <= slices; i++) {
            u = i*du;
            cx = Math.cos(u);
            cy = Math.sin(u);
            x = cx*(centerRadius + tubeRadius*cos);
            y = cy*(centerRadius + tubeRadius*cos);
            z = sin*tubeRadius;
            vertices[indexV] = x;
            normals[indexV++] = cx*cos;
            vertices[indexV] = y
            normals[indexV++] = cy*cos;
            vertices[indexV] = z
            normals[indexV++] = sin;
            texCoords[indexT++] = i/slices;
            texCoords[indexT++] = j/stacks;
        } 
    }
    var k = 0;
    for (j = 0; j < stacks; j++) {
        var row1 = j*(slices+1);
        var row2 = (j+1)*(slices+1);
        for (i = 0; i < slices; i++) {
            indices[k++] = row1 + i;
            indices[k++] = row2 + i + 1;
            indices[k++] = row2 + i;
            indices[k++] = row1 + i;
            indices[k++] = row1 + i + 1;
            indices[k++] = row2 + i + 1;
        }
    }
    return {
        vertexPositions: vertices,
        vertexNormals: normals,
        vertexTextureCoords: texCoords,
        indices: indices
    };
}

/**
 * Defines a model of a cylinder.  The axis of the cylinder is the z-axis,
 * and the center is at (0,0,0).
 * @param radius the radius of the cylinder
 * @param height the height of the cylinder.  The cylinder extends from -height/2
 * to height/2 along the z-axis.
 * @param slices the number of slices, like the slices of an orange.
 * @param noTop if missing or false, the cylinder has a top; if set to true,
 *   the cylinder has a top. The top is a disk at the positive end of the cylinder.
 * @param noBottom if missing or false, the cylinder has a bottom; if set to true,
 *   the cylinder has a bottom. The bottom is a disk at the negtive end of the cylinder.
 */
function uvCylinder(radius, height, slices, noTop, noBottom) {
    radius = radius || 0.5;
    height = height || 2*radius;
    slices = slices || 32;
    var vertexCount = 2*(slices+1);
    if (!noTop)
        vertexCount += slices + 2;
    if (!noBottom)
        vertexCount += slices + 2;
    var triangleCount = 2*slices;
    if (!noTop)
        triangleCount += slices;
    if (!noBottom)
        triangleCount += slices; 
    var vertices = new Float32Array(vertexCount*3);
    var normals = new Float32Array(vertexCount*3);
    var texCoords = new Float32Array(vertexCount*2);
    var indices = new Uint16Array(triangleCount*3);
    var du = 2*Math.PI / slices;
    var kv = 0;
    var kt = 0;
    var k = 0;
    var i,u;
    for (i = 0; i <= slices; i++) {
        u = i*du;
        var c = Math.cos(u);
        var s = Math.sin(u);
        vertices[kv] = c*radius;
        normals[kv++] = c;
        vertices[kv] = s*radius;
        normals[kv++] = s;
        vertices[kv] = -height/2;
        normals[kv++] = 0;
        texCoords[kt++] = i/slices;
        texCoords[kt++] = 0;
        vertices[kv] = c*radius;
        normals[kv++] = c;
        vertices[kv] = s*radius;
        normals[kv++] = s;
        vertices[kv] = height/2;
        normals[kv++] = 0;
        texCoords[kt++] = i/slices;
        texCoords[kt++] = 1;
    }
    for (i = 0; i < slices; i++) {
            indices[k++] = 2*i;
            indices[k++] = 2*i+3;
            indices[k++] = 2*i+1;
            indices[k++] = 2*i;
            indices[k++] = 2*i+2;
            indices[k++] = 2*i+3;
    }
    var startIndex = kv/3;
    if (!noBottom) {
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = -height/2;
        normals[kv++] = -1;
        texCoords[kt++] = 0.5;
        texCoords[kt++] = 0.5; 
        for (i = 0; i <= slices; i++) {
            u = 2*Math.PI - i*du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c*radius;
            normals[kv++] = 0;
            vertices[kv] = s*radius;
            normals[kv++] = 0;
            vertices[kv] = -height/2;
            normals[kv++] = -1;
            texCoords[kt++] = 0.5 - 0.5*c;
            texCoords[kt++] = 0.5 + 0.5*s;
        }
        for (i = 0; i < slices; i++) {
            indices[k++] = startIndex;
            indices[k++] = startIndex + i + 1;
            indices[k++] = startIndex + i + 2;
        }
    }
    var startIndex = kv/3;
    if (!noTop) {
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = height/2;
        normals[kv++] = 1;
        texCoords[kt++] = 0.5;
        texCoords[kt++] = 0.5; 
        for (i = 0; i <= slices; i++) {
            u = i*du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c*radius;
            normals[kv++] = 0;
            vertices[kv] = s*radius;
            normals[kv++] = 0;
            vertices[kv] = height/2;
            normals[kv++] = 1;
            texCoords[kt++] = 0.5 + 0.5*c;
            texCoords[kt++] = 0.5 + 0.5*s;
        }
        for (i = 0; i < slices; i++) {
            indices[k++] = startIndex;
            indices[k++] = startIndex + i + 1;
            indices[k++] = startIndex + i + 2;
        }
    }
    return {
        vertexPositions: vertices,
        vertexNormals: normals,
        vertexTextureCoords: texCoords,
        indices: indices
    };
}


/**
 * Defines a model of a cone.  The axis of the cone is the z-axis,
 * and the center is at (0,0,0).
 * @param radius the radius of the cone
 * @param height the height of the cone.  The cone extends from -height/2
 * to height/2 along the z-axis, with the tip at (0,0,height/2).
 * @param slices the number of slices, like the slices of an orange.
 * @param noBottom if missing or false, the cone has a bottom; if set to true,
 *   the cone has a bottom. The bottom is a disk at the wide end of the cone.
 */
function uvCone(radius, height, slices, noBottom) {
    radius = radius || 0.5;
    height = height || 2*radius;
    slices = slices || 32;
    var fractions = [ 0, 0.5, 0.75, 0.875, 0.9375 ];
    var vertexCount = fractions.length*(slices+1) + slices;
    if (!noBottom)
        vertexCount += slices + 2;
    var triangleCount = (fractions.length-1)*slices*2 + slices;
    if (!noBottom)
        triangleCount += slices;
    var vertices = new Float32Array(vertexCount*3);
    var normals = new Float32Array(vertexCount*3);
    var texCoords = new Float32Array(vertexCount*2);
    var indices = new Uint16Array(triangleCount*3);
    var normallength = Math.sqrt(height*height+radius*radius);
    var n1 = height/normallength;
    var n2 = radius/normallength; 
    var du = 2*Math.PI / slices;
    var kv = 0;
    var kt = 0;
    var k = 0;
    var i,j,u;
    for (j = 0; j < fractions.length; j++) {
        var uoffset = (j % 2 == 0? 0 : 0.5);
        for (i = 0; i <= slices; i++) {
            var h1 = -height/2 + fractions[j]*height;
            u = (i+uoffset)*du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c*radius*(1-fractions[j]);
            normals[kv++] = c*n1;
            vertices[kv] = s*radius*(1-fractions[j]);
            normals[kv++] = s*n1;
            vertices[kv] = h1;
            normals[kv++] = n2;
            texCoords[kt++] = (i+uoffset)/slices;
            texCoords[kt++] = fractions[j];
        }
    }
    var k = 0;
    for (j = 0; j < fractions.length-1; j++) {
        var row1 = j*(slices+1);
        var row2 = (j+1)*(slices+1);
        for (i = 0; i < slices; i++) {
            indices[k++] = row1 + i;
            indices[k++] = row2 + i + 1;
            indices[k++] = row2 + i;
            indices[k++] = row1 + i;
            indices[k++] = row1 + i + 1;
            indices[k++] = row2 + i + 1;
        }
    }
    var start = kv/3 - (slices+1);
    for (i = 0; i < slices; i++) { // slices points at top, with different normals, texcoords
        u = (i+0.5)*du;
        var c = Math.cos(u);
        var s = Math.sin(u);
        vertices[kv] = 0;
        normals[kv++] = c*n1;
        vertices[kv] = 0;
        normals[kv++] = s*n1;
        vertices[kv] = height/2;
        normals[kv++] = n2;
        texCoords[kt++] = (i+0.5)/slices;
        texCoords[kt++] = 1;
    }
    for (i = 0; i < slices; i++) {
        indices[k++] = start+i;
        indices[k++] = start+i+1;
        indices[k++] = start+(slices+1)+i;
    }
    if (!noBottom) {
        var startIndex = kv/3;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = 0;
        normals[kv++] = 0;
        vertices[kv] = -height/2;
        normals[kv++] = -1;
        texCoords[kt++] = 0.5;
        texCoords[kt++] = 0.5; 
        for (i = 0; i <= slices; i++) {
            u = 2*Math.PI - i*du;
            var c = Math.cos(u);
            var s = Math.sin(u);
            vertices[kv] = c*radius;
            normals[kv++] = 0;
            vertices[kv] = s*radius;
            normals[kv++] = 0;
            vertices[kv] = -height/2;
            normals[kv++] = -1;
            texCoords[kt++] = 0.5 - 0.5*c;
            texCoords[kt++] = 0.5 + 0.5*s;
        }
        for (i = 0; i < slices; i++) {
            indices[k++] = startIndex;
            indices[k++] = startIndex + i + 1;
            indices[k++] = startIndex + i + 2;
        }
    } 
    return {
        vertexPositions: vertices,
        vertexNormals: normals,
        vertexTextureCoords: texCoords,
        indices: indices
    };   
}


/** An IFS of the famous teapot, about 20 units big. */
var teapotModel = {

"vertexPositions" : new Float32Array( [5.929688, 4.125, 0, 5.387188, 4.125, 2.7475, 5.2971, 4.494141, 2.70917,
    5.832031, 4.494141, 0, 5.401602, 4.617188, 2.753633, 5.945313, 4.617188, 0, 5.614209, 4.494141,
    2.844092, 6.175781, 4.494141, 0, 5.848437, 4.125, 2.94375, 6.429688, 4.125, 0, 3.899688, 4.125, 4.97,
    3.830352, 4.494141, 4.900664, 3.910782, 4.617188, 4.981094, 4.074414, 4.494141, 5.144727, 4.254687,
    4.125, 5.325, 1.677188, 4.125, 6.4575, 1.638858, 4.494141, 6.367412, 1.68332, 4.617188, 6.471914,
    1.77378, 4.494141, 6.684522, 1.873438, 4.125, 6.91875, -1.070312, 4.125, 7, -1.070312, 4.494141,
    6.902344, -1.070312, 4.617188, 7.015625, -1.070312, 4.494141, 7.246094, -1.070312, 4.125, 7.5,
    -1.070312, 4.125, 7, -4.007656, 4.125, 6.4575, -3.859572, 4.494141, 6.367412, -1.070312, 4.494141,
    6.902344, -3.847676, 4.617188, 6.471914, -1.070312, 4.617188, 7.015625, -3.917371, 4.494141,
    6.684522, -1.070312, 4.494141, 7.246094, -4.014062, 4.125, 6.91875, -1.070312, 4.125, 7.5, -6.209063,
    4.125, 4.97, -6.042168, 4.494141, 4.900664, -6.0725, 4.617188, 4.981094, -6.217675, 4.494141,
    5.144727, -6.395312, 4.125, 5.325, -7.591093, 4.125, 2.7475, -7.464421, 4.494141, 2.70917, -7.550137,
    4.617188, 2.753633, -7.755822, 4.494141, 2.844092, -7.989062, 4.125, 2.94375, -8.070313, 4.125, 0,
    -7.972656, 4.494141, 0, -8.085938, 4.617188, 0, -8.316406, 4.494141, 0, -8.570313, 4.125, 0,
    -8.070313, 4.125, 0, -7.527812, 4.125, -2.7475, -7.437724, 4.494141, -2.70917, -7.972656, 4.494141,
    0, -7.542227, 4.617188, -2.753633, -8.085938, 4.617188, 0, -7.754834, 4.494141, -2.844092, -8.316406,
    4.494141, 0, -7.989062, 4.125, -2.94375, -8.570313, 4.125, 0, -6.040312, 4.125, -4.97, -5.970977,
    4.494141, -4.900664, -6.051406, 4.617188, -4.981094, -6.215039, 4.494141, -5.144727, -6.395312,
    4.125, -5.325, -3.817812, 4.125, -6.4575, -3.779482, 4.494141, -6.367412, -3.823945, 4.617188,
    -6.471914, -3.914404, 4.494141, -6.684522, -4.014062, 4.125, -6.91875, -1.070312, 4.125, -7,
    -1.070312, 4.494141, -6.902344, -1.070312, 4.617188, -7.015625, -1.070312, 4.494141, -7.246094,
    -1.070312, 4.125, -7.5, -1.070312, 4.125, -7, 1.677188, 4.125, -6.4575, 1.638858, 4.494141,
    -6.367412, -1.070312, 4.494141, -6.902344, 1.68332, 4.617188, -6.471914, -1.070312, 4.617188,
    -7.015625, 1.77378, 4.494141, -6.684522, -1.070312, 4.494141, -7.246094, 1.873438, 4.125, -6.91875,
    -1.070312, 4.125, -7.5, 3.899688, 4.125, -4.97, 3.830352, 4.494141, -4.900664, 3.910782, 4.617188,
    -4.981094, 4.074414, 4.494141, -5.144727, 4.254687, 4.125, -5.325, 5.387188, 4.125, -2.7475, 5.2971,
    4.494141, -2.70917, 5.401602, 4.617188, -2.753633, 5.614209, 4.494141, -2.844092, 5.848437, 4.125,
    -2.94375, 5.929688, 4.125, 0, 5.832031, 4.494141, 0, 5.945313, 4.617188, 0, 6.175781, 4.494141, 0,
    6.429688, 4.125, 0, 6.429688, 4.125, 0, 5.848437, 4.125, 2.94375, 6.695264, 2.162109, 3.304053,
    7.347656, 2.162109, 0, 7.433985, 0.234375, 3.61836, 8.148438, 0.234375, 0, 7.956494, -1.623047,
    3.840674, 8.714844, -1.623047, 0, 8.154688, -3.375, 3.925, 8.929688, -3.375, 0, 4.254687, 4.125,
    5.325, 4.906446, 2.162109, 5.976758, 5.475, 0.234375, 6.545312, 5.877149, -1.623047, 6.947461,
    6.029688, -3.375, 7.1, 1.873438, 4.125, 6.91875, 2.23374, 2.162109, 7.765576, 2.548047, 0.234375,
    8.504297, 2.770362, -1.623047, 9.026807, 2.854688, -3.375, 9.225, -1.070312, 4.125, 7.5, -1.070312,
    2.162109, 8.417969, -1.070312, 0.234375, 9.21875, -1.070312, -1.623047, 9.785156, -1.070312, -3.375,
    10, -1.070312, 4.125, 7.5, -4.014062, 4.125, 6.91875, -4.374365, 2.162109, 7.765576, -1.070312,
    2.162109, 8.417969, -4.688672, 0.234375, 8.504297, -1.070312, 0.234375, 9.21875, -4.910986,
    -1.623047, 9.026807, -1.070312, -1.623047, 9.785156, -4.995313, -3.375, 9.225, -1.070312, -3.375, 10,
    -6.395312, 4.125, 5.325, -7.047071, 2.162109, 5.976758, -7.615624, 0.234375, 6.545312, -8.017773,
    -1.623047, 6.947461, -8.170312, -3.375, 7.1, -7.989062, 4.125, 2.94375, -8.835889, 2.162109,
    3.304053, -9.57461, 0.234375, 3.61836, -10.097119, -1.623047, 3.840674, -10.295313, -3.375, 3.925,
    -8.570313, 4.125, 0, -9.488281, 2.162109, 0, -10.289063, 0.234375, 0, -10.855469, -1.623047, 0,
    -11.070313, -3.375, 0, -8.570313, 4.125, 0, -7.989062, 4.125, -2.94375, -8.835889, 2.162109,
    -3.304053, -9.488281, 2.162109, 0, -9.57461, 0.234375, -3.61836, -10.289063, 0.234375, 0, -10.097119,
    -1.623047, -3.840674, -10.855469, -1.623047, 0, -10.295313, -3.375, -3.925, -11.070313, -3.375, 0,
    -6.395312, 4.125, -5.325, -7.047071, 2.162109, -5.976758, -7.615624, 0.234375, -6.545312, -8.017773,
    -1.623047, -6.947461, -8.170312, -3.375, -7.1, -4.014062, 4.125, -6.91875, -4.374365, 2.162109,
    -7.765576, -4.688672, 0.234375, -8.504297, -4.910986, -1.623047, -9.026807, -4.995313, -3.375,
    -9.225, -1.070312, 4.125, -7.5, -1.070312, 2.162109, -8.417969, -1.070312, 0.234375, -9.21875,
    -1.070312, -1.623047, -9.785156, -1.070312, -3.375, -10, -1.070312, 4.125, -7.5, 1.873438, 4.125,
    -6.91875, 2.23374, 2.162109, -7.765576, -1.070312, 2.162109, -8.417969, 2.548047, 0.234375,
    -8.504297, -1.070312, 0.234375, -9.21875, 2.770362, -1.623047, -9.026807, -1.070312, -1.623047,
    -9.785156, 2.854688, -3.375, -9.225, -1.070312, -3.375, -10, 4.254687, 4.125, -5.325, 4.906446,
    2.162109, -5.976758, 5.475, 0.234375, -6.545312, 5.877149, -1.623047, -6.947461, 6.029688, -3.375,
    -7.1, 5.848437, 4.125, -2.94375, 6.695264, 2.162109, -3.304053, 7.433985, 0.234375, -3.61836,
    7.956494, -1.623047, -3.840674, 8.154688, -3.375, -3.925, 6.429688, 4.125, 0, 7.347656, 2.162109, 0,
    8.148438, 0.234375, 0, 8.714844, -1.623047, 0, 8.929688, -3.375, 0, 8.929688, -3.375, 0, 8.154688,
    -3.375, 3.925, 7.794336, -4.857422, 3.77168, 8.539063, -4.857422, 0, 7.001562, -5.953125, 3.434375,
    7.679688, -5.953125, 0, 6.208789, -6.697266, 3.09707, 6.820313, -6.697266, 0, 5.848437, -7.125,
    2.94375, 6.429688, -7.125, 0, 6.029688, -3.375, 7.1, 5.752343, -4.857422, 6.822656, 5.142187,
    -5.953125, 6.2125, 4.532031, -6.697266, 5.602344, 4.254687, -7.125, 5.325, 2.854688, -3.375, 9.225,
    2.701367, -4.857422, 8.864649, 2.364063, -5.953125, 8.071875, 2.026758, -6.697266, 7.279101,
    1.873438, -7.125, 6.91875, -1.070312, -3.375, 10, -1.070312, -4.857422, 9.609375, -1.070312,
    -5.953125, 8.75, -1.070312, -6.697266, 7.890625, -1.070312, -7.125, 7.5, -1.070312, -3.375, 10,
    -4.995313, -3.375, 9.225, -4.841992, -4.857422, 8.864649, -1.070312, -4.857422, 9.609375, -4.504687,
    -5.953125, 8.071875, -1.070312, -5.953125, 8.75, -4.167383, -6.697266, 7.279101, -1.070312,
    -6.697266, 7.890625, -4.014062, -7.125, 6.91875, -1.070312, -7.125, 7.5, -8.170312, -3.375, 7.1,
    -7.892968, -4.857422, 6.822656, -7.282812, -5.953125, 6.2125, -6.672656, -6.697266, 5.602344,
    -6.395312, -7.125, 5.325, -10.295313, -3.375, 3.925, -9.934961, -4.857422, 3.77168, -9.142187,
    -5.953125, 3.434375, -8.349414, -6.697266, 3.09707, -7.989062, -7.125, 2.94375, -11.070313, -3.375,
    0, -10.679688, -4.857422, 0, -9.820313, -5.953125, 0, -8.960938, -6.697266, 0, -8.570313, -7.125, 0,
    -11.070313, -3.375, 0, -10.295313, -3.375, -3.925, -9.934961, -4.857422, -3.77168, -10.679688,
    -4.857422, 0, -9.142187, -5.953125, -3.434375, -9.820313, -5.953125, 0, -8.349414, -6.697266,
    -3.09707, -8.960938, -6.697266, 0, -7.989062, -7.125, -2.94375, -8.570313, -7.125, 0, -8.170312,
    -3.375, -7.1, -7.892968, -4.857422, -6.822656, -7.282812, -5.953125, -6.2125, -6.672656, -6.697266,
    -5.602344, -6.395312, -7.125, -5.325, -4.995313, -3.375, -9.225, -4.841992, -4.857422, -8.864649,
    -4.504687, -5.953125, -8.071875, -4.167383, -6.697266, -7.279101, -4.014062, -7.125, -6.91875,
    -1.070312, -3.375, -10, -1.070312, -4.857422, -9.609375, -1.070312, -5.953125, -8.75, -1.070312,
    -6.697266, -7.890625, -1.070312, -7.125, -7.5, -1.070312, -3.375, -10, 2.854688, -3.375, -9.225,
    2.701367, -4.857422, -8.864649, -1.070312, -4.857422, -9.609375, 2.364063, -5.953125, -8.071875,
    -1.070312, -5.953125, -8.75, 2.026758, -6.697266, -7.279101, -1.070312, -6.697266, -7.890625,
    1.873438, -7.125, -6.91875, -1.070312, -7.125, -7.5, 6.029688, -3.375, -7.1, 5.752343, -4.857422,
    -6.822656, 5.142187, -5.953125, -6.2125, 4.532031, -6.697266, -5.602344, 4.254687, -7.125, -5.325,
    8.154688, -3.375, -3.925, 7.794336, -4.857422, -3.77168, 7.001562, -5.953125, -3.434375, 6.208789,
    -6.697266, -3.09707, 5.848437, -7.125, -2.94375, 8.929688, -3.375, 0, 8.539063, -4.857422, 0,
    7.679688, -5.953125, 0, 6.820313, -6.697266, 0, 6.429688, -7.125, 0, 6.429688, -7.125, 0, 5.848437,
    -7.125, 2.94375, 5.691685, -7.400391, 2.877056, 6.259766, -7.400391, 0, 4.853868, -7.640625,
    2.520586, 5.351563, -7.640625, 0, 2.783648, -7.810547, 1.639761, 3.107422, -7.810547, 0, -1.070312,
    -7.875, 0, 4.254687, -7.125, 5.325, 4.134043, -7.400391, 5.204355, 3.489219, -7.640625, 4.559531,
    1.895879, -7.810547, 2.966191, -1.070312, -7.875, 0, 1.873438, -7.125, 6.91875, 1.806743, -7.400391,
    6.761997, 1.450274, -7.640625, 5.92418, 0.569448, -7.810547, 3.85396, -1.070312, -7.875, 0,
    -1.070312, -7.125, 7.5, -1.070312, -7.400391, 7.330078, -1.070312, -7.640625, 6.421875, -1.070312,
    -7.810547, 4.177734, -1.070312, -7.875, 0, -1.070312, -7.125, 7.5, -4.014062, -7.125, 6.91875,
    -3.947368, -7.400391, 6.761997, -1.070312, -7.400391, 7.330078, -3.590898, -7.640625, 5.92418,
    -1.070312, -7.640625, 6.421875, -2.710073, -7.810547, 3.85396, -1.070312, -7.810547, 4.177734,
    -1.070312, -7.875, 0, -6.395312, -7.125, 5.325, -6.274668, -7.400391, 5.204355, -5.629844, -7.640625,
    4.559531, -4.036504, -7.810547, 2.966191, -1.070312, -7.875, 0, -7.989062, -7.125, 2.94375,
    -7.832309, -7.400391, 2.877056, -6.994492, -7.640625, 2.520586, -4.924272, -7.810547, 1.639761,
    -1.070312, -7.875, 0, -8.570313, -7.125, 0, -8.400391, -7.400391, 0, -7.492188, -7.640625, 0,
    -5.248047, -7.810547, 0, -1.070312, -7.875, 0, -8.570313, -7.125, 0, -7.989062, -7.125, -2.94375,
    -7.832309, -7.400391, -2.877056, -8.400391, -7.400391, 0, -6.994492, -7.640625, -2.520586, -7.492188,
    -7.640625, 0, -4.924272, -7.810547, -1.639761, -5.248047, -7.810547, 0, -1.070312, -7.875, 0,
    -6.395312, -7.125, -5.325, -6.274668, -7.400391, -5.204355, -5.629844, -7.640625, -4.559531,
    -4.036504, -7.810547, -2.966191, -1.070312, -7.875, 0, -4.014062, -7.125, -6.91875, -3.947368,
    -7.400391, -6.761997, -3.590898, -7.640625, -5.92418, -2.710073, -7.810547, -3.85396, -1.070312,
    -7.875, 0, -1.070312, -7.125, -7.5, -1.070312, -7.400391, -7.330078, -1.070312, -7.640625, -6.421875,
    -1.070312, -7.810547, -4.177734, -1.070312, -7.875, 0, -1.070312, -7.125, -7.5, 1.873438, -7.125,
    -6.91875, 1.806743, -7.400391, -6.761997, -1.070312, -7.400391, -7.330078, 1.450274, -7.640625,
    -5.92418, -1.070312, -7.640625, -6.421875, 0.569448, -7.810547, -3.85396, -1.070312, -7.810547,
    -4.177734, -1.070312, -7.875, 0, 4.254687, -7.125, -5.325, 4.134043, -7.400391, -5.204355, 3.489219,
    -7.640625, -4.559531, 1.895879, -7.810547, -2.966191, -1.070312, -7.875, 0, 5.848437, -7.125,
    -2.94375, 5.691685, -7.400391, -2.877056, 4.853868, -7.640625, -2.520586, 2.783648, -7.810547,
    -1.639761, -1.070312, -7.875, 0, 6.429688, -7.125, 0, 6.259766, -7.400391, 0, 5.351563, -7.640625, 0,
    3.107422, -7.810547, 0, -1.070312, -7.875, 0, -9.070313, 2.25, 0, -8.992188, 2.425781, 0.84375,
    -11.47583, 2.405457, 0.84375, -11.40625, 2.232422, 0, -13.298828, 2.263184, 0.84375, -13.132813,
    2.109375, 0, -14.421631, 1.877014, 0.84375, -14.203125, 1.775391, 0, -14.804688, 1.125, 0.84375,
    -14.570313, 1.125, 0, -8.820313, 2.8125, 1.125, -11.628906, 2.786134, 1.125, -13.664063, 2.601563,
    1.125, -14.902344, 2.100586, 1.125, -15.320313, 1.125, 1.125, -8.648438, 3.199219, 0.84375,
    -11.781982, 3.166809, 0.84375, -14.029297, 2.939941, 0.84375, -15.383057, 2.324158, 0.84375,
    -15.835938, 1.125, 0.84375, -8.570313, 3.375, 0, -11.851563, 3.339844, 0, -14.195313, 3.09375, 0,
    -15.601563, 2.425781, 0, -16.070313, 1.125, 0, -8.570313, 3.375, 0, -8.648438, 3.199219, -0.84375,
    -11.781982, 3.166809, -0.84375, -11.851563, 3.339844, 0, -14.029297, 2.939941, -0.84375, -14.195313,
    3.09375, 0, -15.383057, 2.324158, -0.84375, -15.601563, 2.425781, 0, -15.835938, 1.125, -0.84375,
    -16.070313, 1.125, 0, -8.820313, 2.8125, -1.125, -11.628906, 2.786134, -1.125, -13.664063, 2.601563,
    -1.125, -14.902344, 2.100586, -1.125, -15.320313, 1.125, -1.125, -8.992188, 2.425781, -0.84375,
    -11.47583, 2.405457, -0.84375, -13.298828, 2.263184, -0.84375, -14.421631, 1.877014, -0.84375,
    -14.804688, 1.125, -0.84375, -9.070313, 2.25, 0, -11.40625, 2.232422, 0, -13.132813, 2.109375, 0,
    -14.203125, 1.775391, 0, -14.570313, 1.125, 0, -14.570313, 1.125, 0, -14.804688, 1.125, 0.84375,
    -14.588013, 0.00705, 0.84375, -14.375, 0.105469, 0, -13.90918, -1.275146, 0.84375, -13.757813,
    -1.125, 0, -12.724976, -2.540863, 0.84375, -12.671875, -2.355469, 0, -10.992188, -3.609375, 0.84375,
    -11.070313, -3.375, 0, -15.320313, 1.125, 1.125, -15.056641, -0.209473, 1.125, -14.242188, -1.605469,
    1.125, -12.841797, -2.94873, 1.125, -10.820313, -4.125, 1.125, -15.835938, 1.125, 0.84375,
    -15.525269, -0.425995, 0.84375, -14.575195, -1.935791, 0.84375, -12.958618, -3.356598, 0.84375,
    -10.648438, -4.640625, 0.84375, -16.070313, 1.125, 0, -15.738281, -0.524414, 0, -14.726563,
    -2.085938, 0, -13.011719, -3.541992, 0, -10.570313, -4.875, 0, -16.070313, 1.125, 0, -15.835938,
    1.125, -0.84375, -15.525269, -0.425995, -0.84375, -15.738281, -0.524414, 0, -14.575195, -1.935791,
    -0.84375, -14.726563, -2.085938, 0, -12.958618, -3.356598, -0.84375, -13.011719, -3.541992, 0,
    -10.648438, -4.640625, -0.84375, -10.570313, -4.875, 0, -15.320313, 1.125, -1.125, -15.056641,
    -0.209473, -1.125, -14.242188, -1.605469, -1.125, -12.841797, -2.94873, -1.125, -10.820313, -4.125,
    -1.125, -14.804688, 1.125, -0.84375, -14.588013, 0.00705, -0.84375, -13.90918, -1.275146, -0.84375,
    -12.724976, -2.540863, -0.84375, -10.992188, -3.609375, -0.84375, -14.570313, 1.125, 0, -14.375,
    0.105469, 0, -13.757813, -1.125, 0, -12.671875, -2.355469, 0, -11.070313, -3.375, 0, 7.429688, -0.75,
    0, 7.429688, -1.394531, 1.85625, 10.01123, -0.677124, 1.676074, 9.828125, -0.199219, 0, 11.101563,
    0.84668, 1.279688, 10.867188, 1.125, 0, 11.723145, 2.629761, 0.883301, 11.4375, 2.730469, 0,
    12.898438, 4.125, 0.703125, 12.429688, 4.125, 0, 7.429688, -2.8125, 2.475, 10.414063, -1.728516,
    2.234766, 11.617188, 0.234375, 1.70625, 12.351563, 2.408203, 1.177734, 13.929688, 4.125, 0.9375,
    7.429688, -4.230469, 1.85625, 10.816895, -2.779907, 1.676074, 12.132813, -0.37793, 1.279688,
    12.97998, 2.186646, 0.883301, 14.960938, 4.125, 0.703125, 7.429688, -4.875, 0, 11, -3.257813, 0,
    12.367188, -0.65625, 0, 13.265625, 2.085938, 0, 15.429688, 4.125, 0, 7.429688, -4.875, 0, 7.429688,
    -4.230469, -1.85625, 10.816895, -2.779907, -1.676074, 11, -3.257813, 0, 12.132813, -0.37793,
    -1.279688, 12.367188, -0.65625, 0, 12.97998, 2.186646, -0.883301, 13.265625, 2.085938, 0, 14.960938,
    4.125, -0.703125, 15.429688, 4.125, 0, 7.429688, -2.8125, -2.475, 10.414063, -1.728516, -2.234766,
    11.617188, 0.234375, -1.70625, 12.351563, 2.408203, -1.177734, 13.929688, 4.125, -0.9375, 7.429688,
    -1.394531, -1.85625, 10.01123, -0.677124, -1.676074, 11.101563, 0.84668, -1.279688, 11.723145,
    2.629761, -0.883301, 12.898438, 4.125, -0.703125, 7.429688, -0.75, 0, 9.828125, -0.199219, 0,
    10.867188, 1.125, 0, 11.4375, 2.730469, 0, 12.429688, 4.125, 0, 12.429688, 4.125, 0, 12.898438,
    4.125, 0.703125, 13.291077, 4.346237, 0.65918, 12.789063, 4.335938, 0, 13.525879, 4.422729, 0.5625,
    13.054688, 4.40625, 0, 13.532898, 4.350357, 0.46582, 13.132813, 4.335938, 0, 13.242188, 4.125,
    0.421875, 12.929688, 4.125, 0, 13.929688, 4.125, 0.9375, 14.395508, 4.368896, 0.878906, 14.5625,
    4.458984, 0.75, 14.413086, 4.38208, 0.621094, 13.929688, 4.125, 0.5625, 14.960938, 4.125, 0.703125,
    15.499939, 4.391556, 0.65918, 15.599121, 4.495239, 0.5625, 15.293274, 4.413804, 0.46582, 14.617188,
    4.125, 0.421875, 15.429688, 4.125, 0, 16.001953, 4.401855, 0, 16.070313, 4.511719, 0, 15.693359,
    4.428224, 0, 14.929688, 4.125, 0, 15.429688, 4.125, 0, 14.960938, 4.125, -0.703125, 15.499939,
    4.391556, -0.65918, 16.001953, 4.401855, 0, 15.599121, 4.495239, -0.5625, 16.070313, 4.511719, 0,
    15.293274, 4.413804, -0.46582, 15.693359, 4.428224, 0, 14.617188, 4.125, -0.421875, 14.929688, 4.125,
    0, 13.929688, 4.125, -0.9375, 14.395508, 4.368896, -0.878906, 14.5625, 4.458984, -0.75, 14.413086,
    4.38208, -0.621094, 13.929688, 4.125, -0.5625, 12.898438, 4.125, -0.703125, 13.291077, 4.346237,
    -0.65918, 13.525879, 4.422729, -0.5625, 13.532898, 4.350357, -0.46582, 13.242188, 4.125, -0.421875,
    12.429688, 4.125, 0, 12.789063, 4.335938, 0, 13.054688, 4.40625, 0, 13.132813, 4.335938, 0,
    12.929688, 4.125, 0, 0.501414, 7.628906, 0.670256, 0.632813, 7.628906, 0, -1.070312, 7.875, 0,
    0.429278, 7.03125, 0.639395, 0.554688, 7.03125, 0, -0.162029, 6.292969, 0.38696, -0.085937, 6.292969,
    0, -0.147812, 5.625, 0.3925, -0.070312, 5.625, 0, 0.140489, 7.628906, 1.210801, -1.070312, 7.875, 0,
    0.084844, 7.03125, 1.155156, -0.370879, 6.292969, 0.699434, -0.360312, 5.625, 0.71, -0.400056,
    7.628906, 1.571726, -1.070312, 7.875, 0, -0.430918, 7.03125, 1.49959, -0.683352, 6.292969, 0.908284,
    -0.677812, 5.625, 0.9225, -1.070312, 7.628906, 1.703125, -1.070312, 7.875, 0, -1.070312, 7.03125,
    1.625, -1.070312, 6.292969, 0.984375, -1.070312, 5.625, 1, -1.740569, 7.628906, 1.571726, -1.070312,
    7.628906, 1.703125, -1.070312, 7.875, 0, -1.709707, 7.03125, 1.49959, -1.070312, 7.03125, 1.625,
    -1.457273, 6.292969, 0.908284, -1.070312, 6.292969, 0.984375, -1.462812, 5.625, 0.9225, -1.070312,
    5.625, 1, -2.281113, 7.628906, 1.210801, -1.070312, 7.875, 0, -2.225469, 7.03125, 1.155156,
    -1.769746, 6.292969, 0.699434, -1.780312, 5.625, 0.71, -2.642038, 7.628906, 0.670256, -1.070312,
    7.875, 0, -2.569902, 7.03125, 0.639395, -1.978596, 6.292969, 0.38696, -1.992812, 5.625, 0.3925,
    -2.773438, 7.628906, 0, -1.070312, 7.875, 0, -2.695313, 7.03125, 0, -2.054687, 6.292969, 0,
    -2.070312, 5.625, 0, -2.642038, 7.628906, -0.670256, -2.773438, 7.628906, 0, -1.070312, 7.875, 0,
    -2.569902, 7.03125, -0.639395, -2.695313, 7.03125, 0, -1.978596, 6.292969, -0.38696, -2.054687,
    6.292969, 0, -1.992812, 5.625, -0.3925, -2.070312, 5.625, 0, -2.281113, 7.628906, -1.210801,
    -1.070312, 7.875, 0, -2.225469, 7.03125, -1.155156, -1.769746, 6.292969, -0.699434, -1.780312, 5.625,
    -0.71, -1.740569, 7.628906, -1.571726, -1.070312, 7.875, 0, -1.709707, 7.03125, -1.49959, -1.457273,
    6.292969, -0.908284, -1.462812, 5.625, -0.9225, -1.070312, 7.628906, -1.703125, -1.070312, 7.875, 0,
    -1.070312, 7.03125, -1.625, -1.070312, 6.292969, -0.984375, -1.070312, 5.625, -1, -0.400056,
    7.628906, -1.571726, -1.070312, 7.628906, -1.703125, -1.070312, 7.875, 0, -0.430918, 7.03125,
    -1.49959, -1.070312, 7.03125, -1.625, -0.683352, 6.292969, -0.908284, -1.070312, 6.292969, -0.984375,
    -0.677812, 5.625, -0.9225, -1.070312, 5.625, -1, 0.140489, 7.628906, -1.210801, -1.070312, 7.875, 0,
    0.084844, 7.03125, -1.155156, -0.370879, 6.292969, -0.699434, -0.360312, 5.625, -0.71, 0.501414,
    7.628906, -0.670256, -1.070312, 7.875, 0, 0.429278, 7.03125, -0.639395, -0.162029, 6.292969,
    -0.38696, -0.147812, 5.625, -0.3925, 0.632813, 7.628906, 0, -1.070312, 7.875, 0, 0.554688, 7.03125,
    0, -0.085937, 6.292969, 0, -0.070312, 5.625, 0, -0.070312, 5.625, 0, -0.147812, 5.625, 0.3925,
    1.034141, 5.179688, 0.895391, 1.210938, 5.179688, 0, 2.735, 4.875, 1.619062, 3.054688, 4.875, 0,
    4.262891, 4.570313, 2.26914, 4.710938, 4.570313, 0, 4.925938, 4.125, 2.55125, 5.429688, 4.125, 0,
    -0.360312, 5.625, 0.71, 0.549375, 5.179688, 1.619688, 1.858438, 4.875, 2.92875, 3.034375, 4.570313,
    4.104687, 3.544688, 4.125, 4.615, -0.677812, 5.625, 0.9225, -0.174922, 5.179688, 2.104453, 0.54875,
    4.875, 3.805313, 1.198828, 4.570313, 5.333203, 1.480938, 4.125, 5.99625, -1.070312, 5.625, 1,
    -1.070312, 5.179688, 2.28125, -1.070312, 4.875, 4.125, -1.070312, 4.570313, 5.78125, -1.070312,
    4.125, 6.5, -1.070312, 5.625, 1, -1.462812, 5.625, 0.9225, -1.965703, 5.179688, 2.104453, -1.070312,
    5.179688, 2.28125, -2.689375, 4.875, 3.805313, -1.070312, 4.875, 4.125, -3.339453, 4.570313,
    5.333203, -1.070312, 4.570313, 5.78125, -3.621562, 4.125, 5.99625, -1.070312, 4.125, 6.5, -1.780312,
    5.625, 0.71, -2.69, 5.179688, 1.619688, -3.999062, 4.875, 2.92875, -5.174999, 4.570313, 4.104687,
    -5.685312, 4.125, 4.615, -1.992812, 5.625, 0.3925, -3.174765, 5.179688, 0.895391, -4.875625, 4.875,
    1.619062, -6.403516, 4.570313, 2.26914, -7.066563, 4.125, 2.55125, -2.070312, 5.625, 0, -3.351562,
    5.179688, 0, -5.195313, 4.875, 0, -6.851563, 4.570313, 0, -7.570313, 4.125, 0, -2.070312, 5.625, 0,
    -1.992812, 5.625, -0.3925, -3.174765, 5.179688, -0.895391, -3.351562, 5.179688, 0, -4.875625, 4.875,
    -1.619062, -5.195313, 4.875, 0, -6.403516, 4.570313, -2.26914, -6.851563, 4.570313, 0, -7.066563,
    4.125, -2.55125, -7.570313, 4.125, 0, -1.780312, 5.625, -0.71, -2.69, 5.179688, -1.619688, -3.999062,
    4.875, -2.92875, -5.174999, 4.570313, -4.104687, -5.685312, 4.125, -4.615, -1.462812, 5.625, -0.9225,
    -1.965703, 5.179688, -2.104453, -2.689375, 4.875, -3.805313, -3.339453, 4.570313, -5.333203,
    -3.621562, 4.125, -5.99625, -1.070312, 5.625, -1, -1.070312, 5.179688, -2.28125, -1.070312, 4.875,
    -4.125, -1.070312, 4.570313, -5.78125, -1.070312, 4.125, -6.5, -1.070312, 5.625, -1, -0.677812,
    5.625, -0.9225, -0.174922, 5.179688, -2.104453, -1.070312, 5.179688, -2.28125, 0.54875, 4.875,
    -3.805313, -1.070312, 4.875, -4.125, 1.198828, 4.570313, -5.333203, -1.070312, 4.570313, -5.78125,
    1.480938, 4.125, -5.99625, -1.070312, 4.125, -6.5, -0.360312, 5.625, -0.71, 0.549375, 5.179688,
    -1.619688, 1.858438, 4.875, -2.92875, 3.034375, 4.570313, -4.104687, 3.544688, 4.125, -4.615,
    -0.147812, 5.625, -0.3925, 1.034141, 5.179688, -0.895391, 2.735, 4.875, -1.619062, 4.262891,
    4.570313, -2.26914, 4.925938, 4.125, -2.55125, -0.070312, 5.625, 0, 1.210938, 5.179688, 0, 3.054688,
    4.875, 0, 4.710938, 4.570313, 0, 5.429688, 4.125, 0] ), 

"vertexNormals" : new Float32Array( [-0.966742, -0.255752, 0, -0.893014, -0.256345, -0.369882, -0.893437, 0.255996,
    -0.369102, -0.966824, 0.255443, 0, -0.083877, 0.995843, -0.035507, -0.092052, 0.995754, 0, 0.629724,
    0.73186, 0.260439, 0.68205, 0.731305, 0, 0.803725, 0.49337, 0.332584, 0.870301, 0.492521, 0,
    -0.683407, -0.256728, -0.683407, -0.683531, 0.256068, -0.683531, -0.064925, 0.995776, -0.064925,
    0.481399, 0.732469, 0.481399, 0.614804, 0.493997, 0.614804, -0.369882, -0.256345, -0.893014,
    -0.369102, 0.255996, -0.893437, -0.035507, 0.995843, -0.083877, 0.260439, 0.73186, 0.629724,
    0.332584, 0.493369, 0.803725, -0.002848, -0.257863, -0.966177, -0.001923, 0.254736, -0.967009,
    -0.000266, 0.995734, -0.09227, 0.000024, 0.731295, 0.682061, 0, 0.492521, 0.870301, -0.002848,
    -0.257863, -0.966177, 0.379058, -0.3593, -0.852771, 0.37711, 0.149085, -0.914091, -0.001923,
    0.254736, -0.967009, 0.027502, 0.992081, -0.122552, -0.000266, 0.995734, -0.09227, -0.26101,
    0.726762, 0.635367, 0.000024, 0.731295, 0.682061, -0.332485, 0.492546, 0.804271, 0, 0.492521,
    0.870301, 0.663548, -0.41079, -0.625264, 0.712664, 0.073722, -0.697621, 0.099726, 0.987509,
    -0.121983, -0.48732, 0.723754, 0.488569, -0.615242, 0.492602, 0.615484, 0.880028, -0.332906,
    -0.338709, 0.917276, 0.167113, -0.361493, 0.113584, 0.992365, -0.04807, -0.63415, 0.727508, 0.261889,
    -0.804126, 0.492634, 0.332705, 0.96669, -0.255738, 0.010454, 0.967442, 0.252962, 0.008103, 0.093436,
    0.995624, 0.001281, -0.682167, 0.731196, -0.000343, -0.870322, 0.492483, -0.000054, 0.96669,
    -0.255738, 0.010454, 0.893014, -0.256345, 0.369882, 0.893437, 0.255996, 0.369102, 0.967442, 0.252962,
    0.008103, 0.083877, 0.995843, 0.035507, 0.093436, 0.995624, 0.001281, -0.629724, 0.73186, -0.260439,
    -0.682167, 0.731196, -0.000343, -0.803725, 0.49337, -0.332584, -0.870322, 0.492483, -0.000054,
    0.683407, -0.256728, 0.683407, 0.683531, 0.256068, 0.683531, 0.064925, 0.995776, 0.064925, -0.481399,
    0.732469, -0.481399, -0.614804, 0.493997, -0.614804, 0.369882, -0.256345, 0.893014, 0.369102,
    0.255996, 0.893437, 0.035507, 0.995843, 0.083877, -0.260439, 0.73186, -0.629724, -0.332584, 0.493369,
    -0.803725, 0, -0.255752, 0.966742, 0, 0.255443, 0.966824, 0, 0.995754, 0.092052, 0, 0.731305,
    -0.68205, 0, 0.492521, -0.870301, 0, -0.255752, 0.966742, -0.369882, -0.256345, 0.893014, -0.369102,
    0.255996, 0.893437, 0, 0.255443, 0.966824, -0.035507, 0.995843, 0.083877, 0, 0.995754, 0.092052,
    0.260439, 0.73186, -0.629724, 0, 0.731305, -0.68205, 0.332584, 0.49337, -0.803725, 0, 0.492521,
    -0.870301, -0.683407, -0.256728, 0.683407, -0.683531, 0.256068, 0.683531, -0.064925, 0.995776,
    0.064925, 0.481399, 0.732469, -0.481399, 0.614804, 0.493997, -0.614804, -0.893014, -0.256345,
    0.369882, -0.893437, 0.255996, 0.369102, -0.083877, 0.995843, 0.035507, 0.629724, 0.73186, -0.260439,
    0.803725, 0.493369, -0.332584, -0.966742, -0.255752, 0, -0.966824, 0.255443, 0, -0.092052, 0.995754,
    0, 0.68205, 0.731305, 0, 0.870301, 0.492521, 0, 0.870301, 0.492521, 0, 0.803725, 0.49337, 0.332584,
    0.845438, 0.403546, 0.349835, 0.915321, 0.402725, 0, 0.869996, 0.336859, 0.360047, 0.941808,
    0.336151, 0, 0.904193, 0.205791, 0.37428, 0.97869, 0.205342, 0, 0.921879, -0.06637, 0.381752,
    0.997804, -0.06624, 0, 0.614804, 0.493997, 0.614804, 0.646802, 0.404096, 0.646802, 0.665655,
    0.337351, 0.665655, 0.691923, 0.20612, 0.691923, 0.705543, -0.06648, 0.705542, 0.332584, 0.493369,
    0.803725, 0.349835, 0.403546, 0.845438, 0.360047, 0.336859, 0.869996, 0.37428, 0.205791, 0.904193,
    0.381752, -0.066369, 0.921879, 0, 0.492521, 0.870301, 0, 0.402725, 0.915321, 0, 0.336151, 0.941808,
    0, 0.205342, 0.97869, 0, -0.06624, 0.997804, 0, 0.492521, 0.870301, -0.332485, 0.492546, 0.804271,
    -0.349835, 0.403546, 0.845438, 0, 0.402725, 0.915321, -0.360047, 0.336859, 0.869996, 0, 0.336151,
    0.941808, -0.37428, 0.205791, 0.904193, 0, 0.205342, 0.97869, -0.381752, -0.06637, 0.921879, 0,
    -0.06624, 0.997804, -0.615242, 0.492602, 0.615484, -0.646802, 0.404096, 0.646802, -0.665655,
    0.337351, 0.665655, -0.691923, 0.20612, 0.691923, -0.705542, -0.06648, 0.705543, -0.804126, 0.492634,
    0.332705, -0.845438, 0.403546, 0.349835, -0.869996, 0.336859, 0.360047, -0.904193, 0.205791, 0.37428,
    -0.921879, -0.066369, 0.381752, -0.870322, 0.492483, -0.000054, -0.915321, 0.402725, 0, -0.941808,
    0.336151, 0, -0.97869, 0.205342, 0, -0.997804, -0.06624, 0, -0.870322, 0.492483, -0.000054,
    -0.803725, 0.49337, -0.332584, -0.845438, 0.403546, -0.349835, -0.915321, 0.402725, 0, -0.869996,
    0.336859, -0.360047, -0.941808, 0.336151, 0, -0.904193, 0.205791, -0.37428, -0.97869, 0.205342, 0,
    -0.921879, -0.06637, -0.381752, -0.997804, -0.06624, 0, -0.614804, 0.493997, -0.614804, -0.646802,
    0.404096, -0.646802, -0.665655, 0.337351, -0.665655, -0.691923, 0.20612, -0.691923, -0.705543,
    -0.06648, -0.705542, -0.332584, 0.493369, -0.803725, -0.349835, 0.403546, -0.845438, -0.360047,
    0.336859, -0.869996, -0.37428, 0.205791, -0.904193, -0.381752, -0.066369, -0.921879, 0, 0.492521,
    -0.870301, 0, 0.402725, -0.915321, 0, 0.336151, -0.941808, 0, 0.205342, -0.97869, 0, -0.06624,
    -0.997804, 0, 0.492521, -0.870301, 0.332584, 0.49337, -0.803725, 0.349835, 0.403546, -0.845438, 0,
    0.402725, -0.915321, 0.360047, 0.336859, -0.869996, 0, 0.336151, -0.941808, 0.37428, 0.205791,
    -0.904193, 0, 0.205342, -0.97869, 0.381752, -0.06637, -0.921879, 0, -0.06624, -0.997804, 0.614804,
    0.493997, -0.614804, 0.646802, 0.404096, -0.646802, 0.665655, 0.337351, -0.665655, 0.691923, 0.20612,
    -0.691923, 0.705542, -0.06648, -0.705543, 0.803725, 0.493369, -0.332584, 0.845438, 0.403546,
    -0.349835, 0.869996, 0.336859, -0.360047, 0.904193, 0.205791, -0.37428, 0.921879, -0.066369,
    -0.381752, 0.870301, 0.492521, 0, 0.915321, 0.402725, 0, 0.941808, 0.336151, 0, 0.97869, 0.205342, 0,
    0.997804, -0.06624, 0, 0.997804, -0.06624, 0, 0.921879, -0.06637, 0.381752, 0.831437, -0.43618,
    0.344179, 0.900182, -0.435513, 0, 0.673512, -0.684666, 0.278594, 0.729611, -0.683863, 0, 0.640399,
    -0.720924, 0.264874, 0.693951, -0.720022, 0, 0.732949, -0.608995, 0.303167, 0.79395, -0.607983, 0,
    0.705543, -0.06648, 0.705542, 0.636092, -0.436778, 0.636092, 0.514965, -0.68529, 0.514965, 0.489651,
    -0.721446, 0.489651, 0.560555, -0.609554, 0.560555, 0.381752, -0.066369, 0.921879, 0.344179,
    -0.43618, 0.831437, 0.278595, -0.684666, 0.673512, 0.264874, -0.720924, 0.640399, 0.303167,
    -0.608995, 0.732949, 0, -0.06624, 0.997804, 0, -0.435513, 0.900182, 0, -0.683863, 0.729611, 0,
    -0.720022, 0.693951, 0, -0.607983, 0.79395, 0, -0.06624, 0.997804, -0.381752, -0.06637, 0.921879,
    -0.344179, -0.43618, 0.831437, 0, -0.435513, 0.900182, -0.278594, -0.684666, 0.673512, 0, -0.683863,
    0.729611, -0.264874, -0.720924, 0.640399, 0, -0.720022, 0.693951, -0.303167, -0.608995, 0.732949, 0,
    -0.607983, 0.79395, -0.705542, -0.06648, 0.705543, -0.636092, -0.436778, 0.636092, -0.514965,
    -0.68529, 0.514965, -0.489651, -0.721446, 0.489651, -0.560555, -0.609554, 0.560555, -0.921879,
    -0.066369, 0.381752, -0.831437, -0.43618, 0.344179, -0.673512, -0.684666, 0.278595, -0.640399,
    -0.720924, 0.264874, -0.732949, -0.608995, 0.303167, -0.997804, -0.06624, 0, -0.900182, -0.435513, 0,
    -0.729611, -0.683863, 0, -0.693951, -0.720022, 0, -0.79395, -0.607983, 0, -0.997804, -0.06624, 0,
    -0.921879, -0.06637, -0.381752, -0.831437, -0.43618, -0.344179, -0.900182, -0.435513, 0, -0.673512,
    -0.684666, -0.278594, -0.729611, -0.683863, 0, -0.640399, -0.720924, -0.264874, -0.693951, -0.720022,
    0, -0.732949, -0.608995, -0.303167, -0.79395, -0.607983, 0, -0.705543, -0.06648, -0.705542,
    -0.636092, -0.436778, -0.636092, -0.514965, -0.68529, -0.514965, -0.489651, -0.721446, -0.489651,
    -0.560555, -0.609554, -0.560555, -0.381752, -0.066369, -0.921879, -0.344179, -0.43618, -0.831437,
    -0.278595, -0.684666, -0.673512, -0.264874, -0.720924, -0.640399, -0.303167, -0.608995, -0.732949, 0,
    -0.06624, -0.997804, 0, -0.435513, -0.900182, 0, -0.683863, -0.729611, 0, -0.720022, -0.693951, 0,
    -0.607983, -0.79395, 0, -0.06624, -0.997804, 0.381752, -0.06637, -0.921879, 0.344179, -0.43618,
    -0.831437, 0, -0.435513, -0.900182, 0.278594, -0.684666, -0.673512, 0, -0.683863, -0.729611,
    0.264874, -0.720924, -0.640399, 0, -0.720022, -0.693951, 0.303167, -0.608995, -0.732949, 0,
    -0.607983, -0.79395, 0.705542, -0.06648, -0.705543, 0.636092, -0.436778, -0.636092, 0.514965,
    -0.68529, -0.514965, 0.489651, -0.721446, -0.489651, 0.560555, -0.609554, -0.560555, 0.921879,
    -0.066369, -0.381752, 0.831437, -0.43618, -0.344179, 0.673512, -0.684666, -0.278595, 0.640399,
    -0.720924, -0.264874, 0.732949, -0.608995, -0.303167, 0.997804, -0.06624, 0, 0.900182, -0.435513, 0,
    0.729611, -0.683863, 0, 0.693951, -0.720022, 0, 0.79395, -0.607983, 0, 0.79395, -0.607983, 0,
    0.732949, -0.608995, 0.303167, 0.57623, -0.781801, 0.238217, 0.62386, -0.781536, 0, 0.163628,
    -0.984208, 0.067527, 0.177291, -0.984159, 0, 0.045422, -0.998792, 0.018736, 0.049207, -0.998789, 0,
    0, -1, 0, 0.560555, -0.609554, 0.560555, 0.440416, -0.782348, 0.440416, 0.124903, -0.984276,
    0.124903, 0.034662, -0.998798, 0.034662, 0, -1, 0, 0.303167, -0.608995, 0.732949, 0.238217,
    -0.781801, 0.57623, 0.067527, -0.984208, 0.163628, 0.018736, -0.998792, 0.045422, 0, -1, 0, 0,
    -0.607983, 0.79395, 0, -0.781536, 0.62386, 0, -0.984159, 0.177291, 0, -0.998789, 0.049207, 0, -1, 0,
    0, -0.607983, 0.79395, -0.303167, -0.608995, 0.732949, -0.238217, -0.781801, 0.57623, 0, -0.781536,
    0.62386, -0.067527, -0.984208, 0.163628, 0, -0.984159, 0.177291, -0.018736, -0.998792, 0.045422, 0,
    -0.998789, 0.049207, 0, -1, 0, -0.560555, -0.609554, 0.560555, -0.440416, -0.782348, 0.440416,
    -0.124903, -0.984276, 0.124903, -0.034662, -0.998798, 0.034662, 0, -1, 0, -0.732949, -0.608995,
    0.303167, -0.57623, -0.781801, 0.238217, -0.163628, -0.984208, 0.067527, -0.045422, -0.998792,
    0.018736, 0, -1, 0, -0.79395, -0.607983, 0, -0.62386, -0.781536, 0, -0.177291, -0.984159, 0,
    -0.049207, -0.998789, 0, 0, -1, 0, -0.79395, -0.607983, 0, -0.732949, -0.608995, -0.303167, -0.57623,
    -0.781801, -0.238217, -0.62386, -0.781536, 0, -0.163628, -0.984208, -0.067527, -0.177291, -0.984159,
    0, -0.045422, -0.998792, -0.018736, -0.049207, -0.998789, 0, 0, -1, 0, -0.560555, -0.609554,
    -0.560555, -0.440416, -0.782348, -0.440416, -0.124903, -0.984276, -0.124903, -0.034662, -0.998798,
    -0.034662, 0, -1, 0, -0.303167, -0.608995, -0.732949, -0.238217, -0.781801, -0.57623, -0.067527,
    -0.984208, -0.163628, -0.018736, -0.998792, -0.045422, 0, -1, 0, 0, -0.607983, -0.79395, 0,
    -0.781536, -0.62386, 0, -0.984159, -0.177291, 0, -0.998789, -0.049207, 0, -1, 0, 0, -0.607983,
    -0.79395, 0.303167, -0.608995, -0.732949, 0.238217, -0.781801, -0.57623, 0, -0.781536, -0.62386,
    0.067527, -0.984208, -0.163628, 0, -0.984159, -0.177291, 0.018736, -0.998792, -0.045422, 0,
    -0.998789, -0.049207, 0, -1, 0, 0.560555, -0.609554, -0.560555, 0.440416, -0.782348, -0.440416,
    0.124903, -0.984276, -0.124903, 0.034662, -0.998798, -0.034662, 0, -1, 0, 0.732949, -0.608995,
    -0.303167, 0.57623, -0.781801, -0.238217, 0.163628, -0.984208, -0.067527, 0.045422, -0.998792,
    -0.018736, 0, -1, 0, 0.79395, -0.607983, 0, 0.62386, -0.781536, 0, 0.177291, -0.984159, 0, 0.049207,
    -0.998789, 0, 0, -1, 0, 0.007786, -0.99997, -0.000216, 0.007039, -0.812495, 0.582926, 0.036127,
    -0.837257, 0.545614, 0.039138, -0.999233, -0.000989, 0.161846, -0.810421, 0.563048, 0.179512,
    -0.983746, -0.004369, 0.482365, -0.595148, 0.642746, 0.612299, -0.790557, -0.01046, 0.73872,
    -0.114594, 0.664199, 0.986152, -0.165708, -0.00667, -0.001909, 0.162121, 0.986769, 0.002762,
    0.017107, 0.99985, 0.010533, 0.073398, 0.997247, -0.066041, 0.13007, 0.989303, -0.094427, 0.016594,
    0.995393, -0.009203, 0.871509, 0.490293, -0.048606, 0.840609, 0.539457, -0.223298, 0.80288, 0.552739,
    -0.596365, 0.559971, 0.575135, -0.803337, 0.068236, 0.591603, -0.010561, 0.999944, 0.000103,
    -0.058798, 0.99827, 0.00071, -0.28071, 0.959787, 0.003269, -0.749723, 0.661738, 0.004268, -0.997351,
    0.072714, 0.002059, -0.010561, 0.999944, 0.000103, -0.008792, 0.871493, -0.49033, -0.046494,
    0.841178, -0.538756, -0.058798, 0.99827, 0.00071, -0.217909, 0.806807, -0.549161, -0.28071, 0.959787,
    0.003269, -0.597291, 0.560026, -0.574121, -0.749723, 0.661738, 0.004268, -0.804, 0.062913, -0.591292,
    -0.997351, 0.072714, 0.002059, -0.001806, 0.161691, -0.98684, 0.002031, 0.014555, -0.999892,
    0.009215, 0.060069, -0.998152, -0.059334, 0.113865, -0.991723, -0.086899, 0.01229, -0.996141,
    0.006418, -0.812379, -0.583095, 0.033783, -0.837512, -0.545373, 0.157113, -0.811947, -0.56219,
    0.484406, -0.589366, -0.646528, 0.73887, -0.10132, -0.666187, 0.007786, -0.99997, -0.000216,
    0.039138, -0.999233, -0.000989, 0.179512, -0.983746, -0.004369, 0.612299, -0.790557, -0.01046,
    0.986152, -0.165708, -0.00667, 0.986152, -0.165708, -0.00667, 0.73872, -0.114594, 0.664199, 0.725608,
    0.259351, 0.637361, 0.946512, 0.32265, -0.003357, 0.645945, 0.461988, 0.607719, 0.82583, 0.56387,
    -0.007452, 0.531615, 0.63666, 0.558614, 0.650011, 0.759893, -0.006937, 0.424964, 0.681717, 0.59554,
    0.532429, 0.846459, -0.005245, -0.094427, 0.016594, 0.995393, -0.049562, -0.019755, 0.998576,
    -0.037816, -0.035624, 0.99865, -0.037914, -0.036512, 0.998614, -0.168854, -0.297945, 0.93953,
    -0.803337, 0.068236, 0.591603, -0.742342, -0.299166, 0.599523, -0.619602, -0.529406, 0.579502,
    -0.483708, -0.68576, 0.543837, -0.445293, -0.794355, 0.413177, -0.997351, 0.072714, 0.002059,
    -0.926513, -0.376258, 0.001996, -0.75392, -0.656952, 0.004317, -0.566224, -0.824244, 0.003461,
    -0.481804, -0.876277, 0.00185, -0.997351, 0.072714, 0.002059, -0.804, 0.062913, -0.591292, -0.744675,
    -0.294425, -0.598977, -0.926513, -0.376258, 0.001996, -0.621949, -0.528114, -0.578165, -0.75392,
    -0.656952, 0.004317, -0.481171, -0.68834, -0.542828, -0.566224, -0.824244, 0.003461, -0.438055,
    -0.797035, -0.415744, -0.481804, -0.876277, 0.00185, -0.086899, 0.01229, -0.996141, -0.044337,
    -0.017056, -0.998871, -0.026176, -0.028166, -0.99926, -0.025294, -0.028332, -0.999278, -0.157482,
    -0.289392, -0.944167, 0.73887, -0.10132, -0.666187, 0.728244, 0.25241, -0.637142, 0.647055, 0.459725,
    -0.608254, 0.522994, 0.640657, -0.56217, 0.409978, 0.682857, -0.604669, 0.986152, -0.165708,
    -0.00667, 0.946512, 0.32265, -0.003357, 0.82583, 0.56387, -0.007452, 0.650011, 0.759893, -0.006937,
    0.532429, 0.846459, -0.005245, -0.230787, 0.972982, -0.006523, -0.152877, 0.687211, 0.71019,
    -0.316721, 0.63775, 0.702113, -0.548936, 0.835863, -0.001511, -0.601067, 0.471452, 0.64533,
    -0.875671, 0.482806, 0.009893, -0.635889, 0.44609, 0.629801, -0.877554, 0.479097, 0.019092,
    -0.435746, 0.601008, 0.670011, -0.69619, 0.717439, 0.024497, 0.111113, -0.08507, 0.99016, 0.22331,
    0.00654, 0.974726, 0.190097, 0.154964, 0.969458, 0.005271, 0.189482, 0.98187, -0.011752, 0.246688,
    0.969024, 0.343906, -0.722796, 0.599412, 0.572489, -0.567656, 0.591627, 0.787436, -0.256459,
    0.560512, 0.647097, -0.306374, 0.698141, 0.427528, -0.499343, 0.753576, 0.410926, -0.911668,
    0.001284, 0.67152, -0.740986, -0.000899, 0.922026, -0.38706, -0.007253, 0.84691, -0.531556,
    -0.013854, 0.535924, -0.844201, -0.010505, 0.410926, -0.911668, 0.001284, 0.341188, -0.722823,
    -0.600931, 0.578664, -0.561139, -0.591838, 0.67152, -0.740986, -0.000899, 0.784869, -0.25102,
    -0.566542, 0.922026, -0.38706, -0.007253, 0.642681, -0.302257, -0.70399, 0.84691, -0.531556,
    -0.013854, 0.418589, -0.500042, -0.758117, 0.535924, -0.844201, -0.010505, 0.115806, -0.079139,
    -0.990114, 0.232811, 0.012565, -0.972441, 0.206662, 0.153601, -0.96628, 0.0245, 0.161443, -0.986578,
    0.003382, 0.211115, -0.977455, -0.134912, 0.687491, -0.713551, -0.31954, 0.633073, -0.705063,
    -0.603902, 0.461442, -0.649903, -0.631815, 0.437169, -0.640072, -0.424306, 0.612706, -0.66675,
    -0.230787, 0.972982, -0.006523, -0.548936, 0.835863, -0.001511, -0.875671, 0.482806, 0.009893,
    -0.877554, 0.479097, 0.019092, -0.69619, 0.717439, 0.024497, -0.69619, 0.717439, 0.024497, -0.435746,
    0.601008, 0.670011, -0.259858, 0.791937, 0.552548, -0.425801, 0.904753, 0.010805, 0.009539, 0.99972,
    -0.021674, 0.022046, 0.999756, 0.001623, 0.410157, 0.332912, -0.849082, 0.999598, 0.025875, 0.011556,
    0.541523, -0.548619, -0.637001, 0.709587, -0.704552, 0.009672, -0.011752, 0.246688, 0.969024,
    0.046311, 0.455223, 0.889172, -0.010688, 0.988794, 0.1489, -0.044376, 0.682946, -0.72912, 0.122824,
    0.009233, -0.992385, 0.427528, -0.499343, 0.753576, 0.481839, -0.18044, 0.85748, 0.455272, 0.736752,
    0.499925, -0.220542, 0.907193, -0.358277, -0.235919, 0.65725, -0.715797, 0.535924, -0.844201,
    -0.010505, 0.728094, -0.6853, -0.015585, 0.888738, 0.458112, -0.016679, -0.260098, 0.965582, 0.0008,
    -0.371611, 0.928378, -0.004418, 0.535924, -0.844201, -0.010505, 0.418589, -0.500042, -0.758117,
    0.480165, -0.178362, -0.858853, 0.728094, -0.6853, -0.015585, 0.488102, 0.716802, -0.497947,
    0.888738, 0.458112, -0.016679, -0.222004, 0.905399, 0.361892, -0.260098, 0.965582, 0.0008, -0.235405,
    0.66318, 0.710477, -0.371611, 0.928378, -0.004418, 0.003382, 0.211115, -0.977455, 0.05872, 0.437702,
    -0.8972, 0.001326, 0.986459, -0.164002, -0.04419, 0.681675, 0.730319, 0.138801, -0.034188, 0.98973,
    -0.424306, 0.612706, -0.66675, -0.25889, 0.797206, -0.54538, 0.01227, 0.999739, 0.019287, 0.398632,
    0.35489, 0.845663, 0.537564, -0.581398, 0.610738, -0.69619, 0.717439, 0.024497, -0.425801, 0.904753,
    0.010805, 0.022046, 0.999756, 0.001623, 0.999598, 0.025875, 0.011556, 0.709587, -0.704552, 0.009672,
    0.76264, 0.565035, 0.314825, 0.82454, 0.565804, 0.000017, 0, 1, 0, 0.847982, -0.397998, 0.350034,
    0.917701, -0.397272, 0.000034, 0.864141, -0.355261, 0.356441, 0.935269, -0.353939, 0.000113,
    0.720992, 0.625625, 0.297933, 0.780712, 0.62489, 0.000075, 0.583357, 0.565165, 0.583338, 0, 1, 0,
    0.648485, -0.398726, 0.648448, 0.660872, -0.355894, 0.660748, 0.551862, 0.62529, 0.55178, 0.314824,
    0.565051, 0.762629, 0, 1, 0, 0.350045, -0.397976, 0.847988, 0.356474, -0.355199, 0.864153, 0.297983,
    0.625515, 0.721067, -0.000017, 0.565804, 0.82454, 0, 1, 0, -0.000034, -0.397272, 0.917701, -0.000113,
    -0.353939, 0.935269, -0.000075, 0.62489, 0.780712, -0.314825, 0.565035, 0.76264, -0.000017, 0.565804,
    0.82454, 0, 1, 0, -0.350034, -0.397998, 0.847982, -0.000034, -0.397272, 0.917701, -0.356441,
    -0.355261, 0.864141, -0.000113, -0.353939, 0.935269, -0.297933, 0.625625, 0.720992, -0.000075,
    0.62489, 0.780712, -0.583338, 0.565165, 0.583357, 0, 1, 0, -0.648448, -0.398726, 0.648485, -0.660748,
    -0.355894, 0.660872, -0.55178, 0.62529, 0.551862, -0.762629, 0.565051, 0.314824, 0, 1, 0, -0.847988,
    -0.397976, 0.350045, -0.864153, -0.355199, 0.356474, -0.721067, 0.625515, 0.297983, -0.82454,
    0.565804, -0.000017, 0, 1, 0, -0.917701, -0.397272, -0.000034, -0.935269, -0.353939, -0.000113,
    -0.780712, 0.62489, -0.000075, -0.76264, 0.565035, -0.314825, -0.82454, 0.565804, -0.000017, 0, 1, 0,
    -0.847982, -0.397998, -0.350034, -0.917701, -0.397272, -0.000034, -0.864141, -0.355261, -0.356441,
    -0.935269, -0.353939, -0.000113, -0.720992, 0.625625, -0.297933, -0.780712, 0.62489, -0.000075,
    -0.583357, 0.565165, -0.583338, 0, 1, 0, -0.648485, -0.398726, -0.648448, -0.660872, -0.355894,
    -0.660748, -0.551862, 0.62529, -0.55178, -0.314824, 0.565051, -0.762629, 0, 1, 0, -0.350045,
    -0.397976, -0.847988, -0.356474, -0.355199, -0.864153, -0.297983, 0.625515, -0.721067, 0.000017,
    0.565804, -0.82454, 0, 1, 0, 0.000034, -0.397272, -0.917701, 0.000113, -0.353939, -0.935269,
    0.000075, 0.62489, -0.780712, 0.314825, 0.565035, -0.76264, 0.000017, 0.565804, -0.82454, 0, 1, 0,
    0.350034, -0.397998, -0.847982, 0.000034, -0.397272, -0.917701, 0.356441, -0.355261, -0.864141,
    0.000113, -0.353939, -0.935269, 0.297933, 0.625625, -0.720992, 0.000075, 0.62489, -0.780712,
    0.583338, 0.565165, -0.583357, 0, 1, 0, 0.648448, -0.398726, -0.648485, 0.660748, -0.355894,
    -0.660872, 0.55178, 0.62529, -0.551862, 0.762629, 0.565051, -0.314824, 0, 1, 0, 0.847988, -0.397976,
    -0.350045, 0.864153, -0.355199, -0.356474, 0.721067, 0.625515, -0.297983, 0.82454, 0.565804,
    0.000017, 0, 1, 0, 0.917701, -0.397272, 0.000034, 0.935269, -0.353939, 0.000113, 0.780712, 0.62489,
    0.000075, 0.780712, 0.62489, 0.000075, 0.720992, 0.625625, 0.297933, 0.217978, 0.971775, 0.090216,
    0.236583, 0.971611, 0, 0.159589, 0.984977, 0.065961, 0.173084, 0.984907, 0, 0.350498, 0.925311,
    0.14474, 0.379703, 0.925108, 0, 0.48559, 0.850653, 0.201474, 0.526673, 0.850068, 0, 0.551862,
    0.62529, 0.55178, 0.166631, 0.971838, 0.166631, 0.121908, 0.985026, 0.121908, 0.267668, 0.925585,
    0.267668, 0.371315, 0.851029, 0.371315, 0.297983, 0.625515, 0.721067, 0.090216, 0.971775, 0.217978,
    0.065961, 0.984977, 0.159589, 0.14474, 0.925311, 0.350498, 0.201475, 0.850653, 0.48559, -0.000075,
    0.62489, 0.780712, 0, 0.971611, 0.236583, 0, 0.984907, 0.173084, 0, 0.925108, 0.379703, 0, 0.850068,
    0.526673, -0.000075, 0.62489, 0.780712, -0.297933, 0.625625, 0.720992, -0.090216, 0.971775, 0.217978,
    0, 0.971611, 0.236583, -0.065961, 0.984977, 0.159589, 0, 0.984907, 0.173084, -0.14474, 0.925311,
    0.350498, 0, 0.925108, 0.379703, -0.201474, 0.850653, 0.48559, 0, 0.850068, 0.526673, -0.55178,
    0.62529, 0.551862, -0.166631, 0.971838, 0.166631, -0.121908, 0.985026, 0.121908, -0.267668, 0.925585,
    0.267668, -0.371315, 0.851029, 0.371315, -0.721067, 0.625515, 0.297983, -0.217978, 0.971775,
    0.090216, -0.159589, 0.984977, 0.065961, -0.350498, 0.925311, 0.14474, -0.48559, 0.850653, 0.201475,
    -0.780712, 0.62489, -0.000075, -0.236583, 0.971611, 0, -0.173084, 0.984907, 0, -0.379703, 0.925108,
    0, -0.526673, 0.850068, 0, -0.780712, 0.62489, -0.000075, -0.720992, 0.625625, -0.297933, -0.217978,
    0.971775, -0.090216, -0.236583, 0.971611, 0, -0.159589, 0.984977, -0.065961, -0.173084, 0.984907, 0,
    -0.350498, 0.925311, -0.14474, -0.379703, 0.925108, 0, -0.48559, 0.850653, -0.201474, -0.526673,
    0.850068, 0, -0.551862, 0.62529, -0.55178, -0.166631, 0.971838, -0.166631, -0.121908, 0.985026,
    -0.121908, -0.267668, 0.925585, -0.267668, -0.371315, 0.851029, -0.371315, -0.297983, 0.625515,
    -0.721067, -0.090216, 0.971775, -0.217978, -0.065961, 0.984977, -0.159589, -0.14474, 0.925311,
    -0.350498, -0.201475, 0.850653, -0.48559, 0.000075, 0.62489, -0.780712, 0, 0.971611, -0.236583, 0,
    0.984907, -0.173084, 0, 0.925108, -0.379703, 0, 0.850068, -0.526673, 0.000075, 0.62489, -0.780712,
    0.297933, 0.625625, -0.720992, 0.090216, 0.971775, -0.217978, 0, 0.971611, -0.236583, 0.065961,
    0.984977, -0.159589, 0, 0.984907, -0.173084, 0.14474, 0.925311, -0.350498, 0, 0.925108, -0.379703,
    0.201474, 0.850653, -0.48559, 0, 0.850068, -0.526673, 0.55178, 0.62529, -0.551862, 0.166631,
    0.971838, -0.166631, 0.121908, 0.985026, -0.121908, 0.267668, 0.925585, -0.267668, 0.371315,
    0.851029, -0.371315, 0.721067, 0.625515, -0.297983, 0.217978, 0.971775, -0.090216, 0.159589,
    0.984977, -0.065961, 0.350498, 0.925311, -0.14474, 0.48559, 0.850653, -0.201475, 0.780712, 0.62489,
    0.000075, 0.236583, 0.971611, 0, 0.173084, 0.984907, 0, 0.379703, 0.925108, 0, 0.526673, 0.850068,
    0] ), 

"vertexTextureCoords" : new Float32Array( [2, 2, 1.75, 2, 1.75, 1.975, 2, 1.975, 1.75, 1.95, 2, 1.95, 1.75, 1.925,
    2, 1.925, 1.75, 1.9, 2, 1.9, 1.5, 2, 1.5, 1.975, 1.5, 1.95, 1.5, 1.925, 1.5, 1.9, 1.25, 2, 1.25,
    1.975, 1.25, 1.95, 1.25, 1.925, 1.25, 1.9, 1, 2, 1, 1.975, 1, 1.95, 1, 1.925, 1, 1.9, 1, 2, 0.75,
    2, 0.75, 1.975, 1, 1.975, 0.75, 1.95, 1, 1.95, 0.75, 1.925, 1, 1.925, 0.75, 1.9, 1, 1.9, 0.5, 2,
    0.5, 1.975, 0.5, 1.95, 0.5, 1.925, 0.5, 1.9, 0.25, 2, 0.25, 1.975, 0.25, 1.95, 0.25, 1.925, 0.25,
    1.9, 0, 2, 0, 1.975, 0, 1.95, 0, 1.925, 0, 1.9, 2, 2, 1.75, 2, 1.75, 1.975, 2, 1.975, 1.75, 1.95,
    2, 1.95, 1.75, 1.925, 2, 1.925, 1.75, 1.9, 2, 1.9, 1.5, 2, 1.5, 1.975, 1.5, 1.95, 1.5, 1.925,
    1.5, 1.9, 1.25, 2, 1.25, 1.975, 1.25, 1.95, 1.25, 1.925, 1.25, 1.9, 1, 2, 1, 1.975, 1, 1.95, 1,
    1.925, 1, 1.9, 1, 2, 0.75, 2, 0.75, 1.975, 1, 1.975, 0.75, 1.95, 1, 1.95, 0.75, 1.925, 1, 1.925,
    0.75, 1.9, 1, 1.9, 0.5, 2, 0.5, 1.975, 0.5, 1.95, 0.5, 1.925, 0.5, 1.9, 0.25, 2, 0.25, 1.975,
    0.25, 1.95, 0.25, 1.925, 0.25, 1.9, 0, 2, 0, 1.975, 0, 1.95, 0, 1.925, 0, 1.9, 2, 1.9, 1.75, 1.9,
    1.75, 1.675, 2, 1.675, 1.75, 1.45, 2, 1.45, 1.75, 1.225, 2, 1.225, 1.75, 1, 2, 1, 1.5, 1.9, 1.5,
    1.675, 1.5, 1.45, 1.5, 1.225, 1.5, 1, 1.25, 1.9, 1.25, 1.675, 1.25, 1.45, 1.25, 1.225, 1.25, 1,
    1, 1.9, 1, 1.675, 1, 1.45, 1, 1.225, 1, 1, 1, 1.9, 0.75, 1.9, 0.75, 1.675, 1, 1.675, 0.75, 1.45,
    1, 1.45, 0.75, 1.225, 1, 1.225, 0.75, 1, 1, 1, 0.5, 1.9, 0.5, 1.675, 0.5, 1.45, 0.5, 1.225, 0.5,
    1, 0.25, 1.9, 0.25, 1.675, 0.25, 1.45, 0.25, 1.225, 0.25, 1, 0, 1.9, 0, 1.675, 0, 1.45, 0, 1.225,
    0, 1, 2, 1.9, 1.75, 1.9, 1.75, 1.675, 2, 1.675, 1.75, 1.45, 2, 1.45, 1.75, 1.225, 2, 1.225, 1.75,
    1, 2, 1, 1.5, 1.9, 1.5, 1.675, 1.5, 1.45, 1.5, 1.225, 1.5, 1, 1.25, 1.9, 1.25, 1.675, 1.25, 1.45,
    1.25, 1.225, 1.25, 1, 1, 1.9, 1, 1.675, 1, 1.45, 1, 1.225, 1, 1, 1, 1.9, 0.75, 1.9, 0.75, 1.675,
    1, 1.675, 0.75, 1.45, 1, 1.45, 0.75, 1.225, 1, 1.225, 0.75, 1, 1, 1, 0.5, 1.9, 0.5, 1.675, 0.5,
    1.45, 0.5, 1.225, 0.5, 1, 0.25, 1.9, 0.25, 1.675, 0.25, 1.45, 0.25, 1.225, 0.25, 1, 0, 1.9, 0,
    1.675, 0, 1.45, 0, 1.225, 0, 1, 2, 1, 1.75, 1, 1.75, 0.85, 2, 0.85, 1.75, 0.7, 2, 0.7, 1.75,
    0.55, 2, 0.55, 1.75, 0.4, 2, 0.4, 1.5, 1, 1.5, 0.85, 1.5, 0.7, 1.5, 0.55, 1.5, 0.4, 1.25, 1,
    1.25, 0.85, 1.25, 0.7, 1.25, 0.55, 1.25, 0.4, 1, 1, 1, 0.85, 1, 0.7, 1, 0.55, 1, 0.4, 1, 1, 0.75,
    1, 0.75, 0.85, 1, 0.85, 0.75, 0.7, 1, 0.7, 0.75, 0.55, 1, 0.55, 0.75, 0.4, 1, 0.4, 0.5, 1, 0.5,
    0.85, 0.5, 0.7, 0.5, 0.55, 0.5, 0.4, 0.25, 1, 0.25, 0.85, 0.25, 0.7, 0.25, 0.55, 0.25, 0.4, 0, 1,
    0, 0.85, 0, 0.7, 0, 0.55, 0, 0.4, 2, 1, 1.75, 1, 1.75, 0.85, 2, 0.85, 1.75, 0.7, 2, 0.7, 1.75,
    0.55, 2, 0.55, 1.75, 0.4, 2, 0.4, 1.5, 1, 1.5, 0.85, 1.5, 0.7, 1.5, 0.55, 1.5, 0.4, 1.25, 1,
    1.25, 0.85, 1.25, 0.7, 1.25, 0.55, 1.25, 0.4, 1, 1, 1, 0.85, 1, 0.7, 1, 0.55, 1, 0.4, 1, 1, 0.75,
    1, 0.75, 0.85, 1, 0.85, 0.75, 0.7, 1, 0.7, 0.75, 0.55, 1, 0.55, 0.75, 0.4, 1, 0.4, 0.5, 1, 0.5,
    0.85, 0.5, 0.7, 0.5, 0.55, 0.5, 0.4, 0.25, 1, 0.25, 0.85, 0.25, 0.7, 0.25, 0.55, 0.25, 0.4, 0, 1,
    0, 0.85, 0, 0.7, 0, 0.55, 0, 0.4, 2, 0.4, 1.75, 0.4, 1.75, 0.3, 2, 0.3, 1.75, 0.2, 2, 0.2, 1.75,
    0.1, 2, 0.1, 1.75, 0, 1.5, 0.4, 1.5, 0.3, 1.5, 0.2, 1.5, 0.1, 1.5, 0, 1.25, 0.4, 1.25, 0.3, 1.25,
    0.2, 1.25, 0.1, 1.25, 0, 1, 0.4, 1, 0.3, 1, 0.2, 1, 0.1, 1, 0, 1, 0.4, 0.75, 0.4, 0.75, 0.3, 1,
    0.3, 0.75, 0.2, 1, 0.2, 0.75, 0.1, 1, 0.1, 0.75, 0, 0.5, 0.4, 0.5, 0.3, 0.5, 0.2, 0.5, 0.1, 0.5,
    0, 0.25, 0.4, 0.25, 0.3, 0.25, 0.2, 0.25, 0.1, 0.25, 0, 0, 0.4, 0, 0.3, 0, 0.2, 0, 0.1, 0, 0, 2,
    0.4, 1.75, 0.4, 1.75, 0.3, 2, 0.3, 1.75, 0.2, 2, 0.2, 1.75, 0.1, 2, 0.1, 1.75, 0, 1.5, 0.4, 1.5,
    0.3, 1.5, 0.2, 1.5, 0.1, 1.5, 0, 1.25, 0.4, 1.25, 0.3, 1.25, 0.2, 1.25, 0.1, 1.25, 0, 1, 0.4, 1,
    0.3, 1, 0.2, 1, 0.1, 1, 0, 1, 0.4, 0.75, 0.4, 0.75, 0.3, 1, 0.3, 0.75, 0.2, 1, 0.2, 0.75, 0.1, 1,
    0.1, 0.75, 0, 0.5, 0.4, 0.5, 0.3, 0.5, 0.2, 0.5, 0.1, 0.5, 0, 0.25, 0.4, 0.25, 0.3, 0.25, 0.2,
    0.25, 0.1, 0.25, 0, 0, 0.4, 0, 0.3, 0, 0.2, 0, 0.1, 0, 0, 1, 1, 0.875, 1, 0.875, 0.875, 1, 0.875,
    0.875, 0.75, 1, 0.75, 0.875, 0.625, 1, 0.625, 0.875, 0.5, 1, 0.5, 0.75, 1, 0.75, 0.875, 0.75,
    0.75, 0.75, 0.625, 0.75, 0.5, 0.625, 1, 0.625, 0.875, 0.625, 0.75, 0.625, 0.625, 0.625, 0.5, 0.5,
    1, 0.5, 0.875, 0.5, 0.75, 0.5, 0.625, 0.5, 0.5, 0.5, 1, 0.375, 1, 0.375, 0.875, 0.5, 0.875,
    0.375, 0.75, 0.5, 0.75, 0.375, 0.625, 0.5, 0.625, 0.375, 0.5, 0.5, 0.5, 0.25, 1, 0.25, 0.875,
    0.25, 0.75, 0.25, 0.625, 0.25, 0.5, 0.125, 1, 0.125, 0.875, 0.125, 0.75, 0.125, 0.625, 0.125,
    0.5, 0, 1, 0, 0.875, 0, 0.75, 0, 0.625, 0, 0.5, 1, 0.5, 0.875, 0.5, 0.875, 0.375, 1, 0.375,
    0.875, 0.25, 1, 0.25, 0.875, 0.125, 1, 0.125, 0.875, 0, 1, 0, 0.75, 0.5, 0.75, 0.375, 0.75, 0.25,
    0.75, 0.125, 0.75, 0, 0.625, 0.5, 0.625, 0.375, 0.625, 0.25, 0.625, 0.125, 0.625, 0, 0.5, 0.5,
    0.5, 0.375, 0.5, 0.25, 0.5, 0.125, 0.5, 0, 0.5, 0.5, 0.375, 0.5, 0.375, 0.375, 0.5, 0.375, 0.375,
    0.25, 0.5, 0.25, 0.375, 0.125, 0.5, 0.125, 0.375, 0, 0.5, 0, 0.25, 0.5, 0.25, 0.375, 0.25, 0.25,
    0.25, 0.125, 0.25, 0, 0.125, 0.5, 0.125, 0.375, 0.125, 0.25, 0.125, 0.125, 0.125, 0, 0, 0.5, 0,
    0.375, 0, 0.25, 0, 0.125, 0, 0, 0.5, 0, 0.625, 0, 0.625, 0.225, 0.5, 0.225, 0.625, 0.45, 0.5,
    0.45, 0.625, 0.675, 0.5, 0.675, 0.625, 0.9, 0.5, 0.9, 0.75, 0, 0.75, 0.225, 0.75, 0.45, 0.75,
    0.675, 0.75, 0.9, 0.875, 0, 0.875, 0.225, 0.875, 0.45, 0.875, 0.675, 0.875, 0.9, 1, 0, 1, 0.225,
    1, 0.45, 1, 0.675, 1, 0.9, 0, 0, 0.125, 0, 0.125, 0.225, 0, 0.225, 0.125, 0.45, 0, 0.45, 0.125,
    0.675, 0, 0.675, 0.125, 0.9, 0, 0.9, 0.25, 0, 0.25, 0.225, 0.25, 0.45, 0.25, 0.675, 0.25, 0.9,
    0.375, 0, 0.375, 0.225, 0.375, 0.45, 0.375, 0.675, 0.375, 0.9, 0.5, 0, 0.5, 0.225, 0.5, 0.45,
    0.5, 0.675, 0.5, 0.9, 0.5, 0.9, 0.625, 0.9, 0.625, 0.925, 0.5, 0.925, 0.625, 0.95, 0.5, 0.95,
    0.625, 0.975, 0.5, 0.975, 0.625, 1, 0.5, 1, 0.75, 0.9, 0.75, 0.925, 0.75, 0.95, 0.75, 0.975,
    0.75, 1, 0.875, 0.9, 0.875, 0.925, 0.875, 0.95, 0.875, 0.975, 0.875, 1, 1, 0.9, 1, 0.925, 1,
    0.95, 1, 0.975, 1, 1, 0, 0.9, 0.125, 0.9, 0.125, 0.925, 0, 0.925, 0.125, 0.95, 0, 0.95, 0.125,
    0.975, 0, 0.975, 0.125, 1, 0, 1, 0.25, 0.9, 0.25, 0.925, 0.25, 0.95, 0.25, 0.975, 0.25, 1, 0.375,
    0.9, 0.375, 0.925, 0.375, 0.95, 0.375, 0.975, 0.375, 1, 0.5, 0.9, 0.5, 0.925, 0.5, 0.95, 0.5,
    0.975, 0.5, 1, 0.875, 0.75, 1, 0.75, 1, 1, 0.875, 0.5, 1, 0.5, 0.875, 0.25, 1, 0.25, 0.875, 0, 1,
    0, 0.75, 0.75, 0.875, 1, 0.75, 0.5, 0.75, 0.25, 0.75, 0, 0.625, 0.75, 0.75, 1, 0.625, 0.5, 0.625,
    0.25, 0.625, 0, 0.5, 0.75, 0.625, 1, 0.5, 0.5, 0.5, 0.25, 0.5, 0, 0.375, 0.75, 0.5, 0.75, 0.5, 1,
    0.375, 0.5, 0.5, 0.5, 0.375, 0.25, 0.5, 0.25, 0.375, 0, 0.5, 0, 0.25, 0.75, 0.375, 1, 0.25, 0.5,
    0.25, 0.25, 0.25, 0, 0.125, 0.75, 0.25, 1, 0.125, 0.5, 0.125, 0.25, 0.125, 0, 0, 0.75, 0.125, 1,
    0, 0.5, 0, 0.25, 0, 0, 0.875, 0.75, 1, 0.75, 1, 1, 0.875, 0.5, 1, 0.5, 0.875, 0.25, 1, 0.25,
    0.875, 0, 1, 0, 0.75, 0.75, 0.875, 1, 0.75, 0.5, 0.75, 0.25, 0.75, 0, 0.625, 0.75, 0.75, 1,
    0.625, 0.5, 0.625, 0.25, 0.625, 0, 0.5, 0.75, 0.625, 1, 0.5, 0.5, 0.5, 0.25, 0.5, 0, 0.375, 0.75,
    0.5, 0.75, 0.5, 1, 0.375, 0.5, 0.5, 0.5, 0.375, 0.25, 0.5, 0.25, 0.375, 0, 0.5, 0, 0.25, 0.75,
    0.375, 1, 0.25, 0.5, 0.25, 0.25, 0.25, 0, 0.125, 0.75, 0.25, 1, 0.125, 0.5, 0.125, 0.25, 0.125,
    0, 0, 0.75, 0.125, 1, 0, 0.5, 0, 0.25, 0, 0, 1, 1, 0.875, 1, 0.875, 0.75, 1, 0.75, 0.875, 0.5, 1,
    0.5, 0.875, 0.25, 1, 0.25, 0.875, 0, 1, 0, 0.75, 1, 0.75, 0.75, 0.75, 0.5, 0.75, 0.25, 0.75, 0,
    0.625, 1, 0.625, 0.75, 0.625, 0.5, 0.625, 0.25, 0.625, 0, 0.5, 1, 0.5, 0.75, 0.5, 0.5, 0.5, 0.25,
    0.5, 0, 0.5, 1, 0.375, 1, 0.375, 0.75, 0.5, 0.75, 0.375, 0.5, 0.5, 0.5, 0.375, 0.25, 0.5, 0.25,
    0.375, 0, 0.5, 0, 0.25, 1, 0.25, 0.75, 0.25, 0.5, 0.25, 0.25, 0.25, 0, 0.125, 1, 0.125, 0.75,
    0.125, 0.5, 0.125, 0.25, 0.125, 0, 0, 1, 0, 0.75, 0, 0.5, 0, 0.25, 0, 0, 1, 1, 0.875, 1, 0.875,
    0.75, 1, 0.75, 0.875, 0.5, 1, 0.5, 0.875, 0.25, 1, 0.25, 0.875, 0, 1, 0, 0.75, 1, 0.75, 0.75,
    0.75, 0.5, 0.75, 0.25, 0.75, 0, 0.625, 1, 0.625, 0.75, 0.625, 0.5, 0.625, 0.25, 0.625, 0, 0.5, 1,
    0.5, 0.75, 0.5, 0.5, 0.5, 0.25, 0.5, 0, 0.5, 1, 0.375, 1, 0.375, 0.75, 0.5, 0.75, 0.375, 0.5,
    0.5, 0.5, 0.375, 0.25, 0.5, 0.25, 0.375, 0, 0.5, 0, 0.25, 1, 0.25, 0.75, 0.25, 0.5, 0.25, 0.25,
    0.25, 0, 0.125, 1, 0.125, 0.75, 0.125, 0.5, 0.125, 0.25, 0.125, 0, 0, 1, 0, 0.75, 0, 0.5, 0,
    0.25, 0, 0] ),  
    
    "indices" : new Uint16Array( [0, 1, 2, 2, 3, 0, 3, 2, 4, 4, 5, 3, 5, 4, 6, 6, 7, 5, 7, 6, 8, 8, 9,
    7, 1, 10, 11, 11, 2, 1, 2, 11, 12, 12, 4, 2, 4, 12, 13, 13, 6, 4, 6, 13, 14, 14, 8, 6, 10, 15,
    16, 16, 11, 10, 11, 16, 17, 17, 12, 11, 12, 17, 18, 18, 13, 12, 13, 18, 19, 19, 14, 13, 15, 20,
    21, 21, 16, 15, 16, 21, 22, 22, 17, 16, 17, 22, 23, 23, 18, 17, 18, 23, 24, 24, 19, 18, 25, 26,
    27, 27, 28, 25, 28, 27, 29, 29, 30, 28, 30, 29, 31, 31, 32, 30, 32, 31, 33, 33, 34, 32, 26, 35,
    36, 36, 27, 26, 27, 36, 37, 37, 29, 27, 29, 37, 38, 38, 31, 29, 31, 38, 39, 39, 33, 31, 35, 40,
    41, 41, 36, 35, 36, 41, 42, 42, 37, 36, 37, 42, 43, 43, 38, 37, 38, 43, 44, 44, 39, 38, 40, 45,
    46, 46, 41, 40, 41, 46, 47, 47, 42, 41, 42, 47, 48, 48, 43, 42, 43, 48, 49, 49, 44, 43, 50, 51,
    52, 52, 53, 50, 53, 52, 54, 54, 55, 53, 55, 54, 56, 56, 57, 55, 57, 56, 58, 58, 59, 57, 51, 60,
    61, 61, 52, 51, 52, 61, 62, 62, 54, 52, 54, 62, 63, 63, 56, 54, 56, 63, 64, 64, 58, 56, 60, 65,
    66, 66, 61, 60, 61, 66, 67, 67, 62, 61, 62, 67, 68, 68, 63, 62, 63, 68, 69, 69, 64, 63, 65, 70,
    71, 71, 66, 65, 66, 71, 72, 72, 67, 66, 67, 72, 73, 73, 68, 67, 68, 73, 74, 74, 69, 68, 75, 76,
    77, 77, 78, 75, 78, 77, 79, 79, 80, 78, 80, 79, 81, 81, 82, 80, 82, 81, 83, 83, 84, 82, 76, 85,
    86, 86, 77, 76, 77, 86, 87, 87, 79, 77, 79, 87, 88, 88, 81, 79, 81, 88, 89, 89, 83, 81, 85, 90,
    91, 91, 86, 85, 86, 91, 92, 92, 87, 86, 87, 92, 93, 93, 88, 87, 88, 93, 94, 94, 89, 88, 90, 95,
    96, 96, 91, 90, 91, 96, 97, 97, 92, 91, 92, 97, 98, 98, 93, 92, 93, 98, 99, 99, 94, 93, 100, 101,
    102, 102, 103, 100, 103, 102, 104, 104, 105, 103, 105, 104, 106, 106, 107, 105, 107, 106, 108,
    108, 109, 107, 101, 110, 111, 111, 102, 101, 102, 111, 112, 112, 104, 102, 104, 112, 113, 113,
    106, 104, 106, 113, 114, 114, 108, 106, 110, 115, 116, 116, 111, 110, 111, 116, 117, 117, 112,
    111, 112, 117, 118, 118, 113, 112, 113, 118, 119, 119, 114, 113, 115, 120, 121, 121, 116, 115,
    116, 121, 122, 122, 117, 116, 117, 122, 123, 123, 118, 117, 118, 123, 124, 124, 119, 118, 125,
    126, 127, 127, 128, 125, 128, 127, 129, 129, 130, 128, 130, 129, 131, 131, 132, 130, 132, 131,
    133, 133, 134, 132, 126, 135, 136, 136, 127, 126, 127, 136, 137, 137, 129, 127, 129, 137, 138,
    138, 131, 129, 131, 138, 139, 139, 133, 131, 135, 140, 141, 141, 136, 135, 136, 141, 142, 142,
    137, 136, 137, 142, 143, 143, 138, 137, 138, 143, 144, 144, 139, 138, 140, 145, 146, 146, 141,
    140, 141, 146, 147, 147, 142, 141, 142, 147, 148, 148, 143, 142, 143, 148, 149, 149, 144, 143,
    150, 151, 152, 152, 153, 150, 153, 152, 154, 154, 155, 153, 155, 154, 156, 156, 157, 155, 157,
    156, 158, 158, 159, 157, 151, 160, 161, 161, 152, 151, 152, 161, 162, 162, 154, 152, 154, 162,
    163, 163, 156, 154, 156, 163, 164, 164, 158, 156, 160, 165, 166, 166, 161, 160, 161, 166, 167,
    167, 162, 161, 162, 167, 168, 168, 163, 162, 163, 168, 169, 169, 164, 163, 165, 170, 171, 171,
    166, 165, 166, 171, 172, 172, 167, 166, 167, 172, 173, 173, 168, 167, 168, 173, 174, 174, 169,
    168, 175, 176, 177, 177, 178, 175, 178, 177, 179, 179, 180, 178, 180, 179, 181, 181, 182, 180,
    182, 181, 183, 183, 184, 182, 176, 185, 186, 186, 177, 176, 177, 186, 187, 187, 179, 177, 179,
    187, 188, 188, 181, 179, 181, 188, 189, 189, 183, 181, 185, 190, 191, 191, 186, 185, 186, 191,
    192, 192, 187, 186, 187, 192, 193, 193, 188, 187, 188, 193, 194, 194, 189, 188, 190, 195, 196,
    196, 191, 190, 191, 196, 197, 197, 192, 191, 192, 197, 198, 198, 193, 192, 193, 198, 199, 199,
    194, 193, 200, 201, 202, 202, 203, 200, 203, 202, 204, 204, 205, 203, 205, 204, 206, 206, 207,
    205, 207, 206, 208, 208, 209, 207, 201, 210, 211, 211, 202, 201, 202, 211, 212, 212, 204, 202,
    204, 212, 213, 213, 206, 204, 206, 213, 214, 214, 208, 206, 210, 215, 216, 216, 211, 210, 211,
    216, 217, 217, 212, 211, 212, 217, 218, 218, 213, 212, 213, 218, 219, 219, 214, 213, 215, 220,
    221, 221, 216, 215, 216, 221, 222, 222, 217, 216, 217, 222, 223, 223, 218, 217, 218, 223, 224,
    224, 219, 218, 225, 226, 227, 227, 228, 225, 228, 227, 229, 229, 230, 228, 230, 229, 231, 231,
    232, 230, 232, 231, 233, 233, 234, 232, 226, 235, 236, 236, 227, 226, 227, 236, 237, 237, 229,
    227, 229, 237, 238, 238, 231, 229, 231, 238, 239, 239, 233, 231, 235, 240, 241, 241, 236, 235,
    236, 241, 242, 242, 237, 236, 237, 242, 243, 243, 238, 237, 238, 243, 244, 244, 239, 238, 240,
    245, 246, 246, 241, 240, 241, 246, 247, 247, 242, 241, 242, 247, 248, 248, 243, 242, 243, 248,
    249, 249, 244, 243, 250, 251, 252, 252, 253, 250, 253, 252, 254, 254, 255, 253, 255, 254, 256,
    256, 257, 255, 257, 256, 258, 258, 259, 257, 251, 260, 261, 261, 252, 251, 252, 261, 262, 262,
    254, 252, 254, 262, 263, 263, 256, 254, 256, 263, 264, 264, 258, 256, 260, 265, 266, 266, 261,
    260, 261, 266, 267, 267, 262, 261, 262, 267, 268, 268, 263, 262, 263, 268, 269, 269, 264, 263,
    265, 270, 271, 271, 266, 265, 266, 271, 272, 272, 267, 266, 267, 272, 273, 273, 268, 267, 268,
    273, 274, 274, 269, 268, 275, 276, 277, 277, 278, 275, 278, 277, 279, 279, 280, 278, 280, 279,
    281, 281, 282, 280, 282, 281, 283, 283, 284, 282, 276, 285, 286, 286, 277, 276, 277, 286, 287,
    287, 279, 277, 279, 287, 288, 288, 281, 279, 281, 288, 289, 289, 283, 281, 285, 290, 291, 291,
    286, 285, 286, 291, 292, 292, 287, 286, 287, 292, 293, 293, 288, 287, 288, 293, 294, 294, 289,
    288, 290, 295, 296, 296, 291, 290, 291, 296, 297, 297, 292, 291, 292, 297, 298, 298, 293, 292,
    293, 298, 299, 299, 294, 293, 300, 301, 302, 302, 303, 300, 303, 302, 304, 304, 305, 303, 305,
    304, 306, 306, 307, 305, 307, 306, 308, 301, 309, 310, 310, 302, 301, 302, 310, 311, 311, 304,
    302, 304, 311, 312, 312, 306, 304, 306, 312, 313, 309, 314, 315, 315, 310, 309, 310, 315, 316,
    316, 311, 310, 311, 316, 317, 317, 312, 311, 312, 317, 318, 314, 319, 320, 320, 315, 314, 315,
    320, 321, 321, 316, 315, 316, 321, 322, 322, 317, 316, 317, 322, 323, 324, 325, 326, 326, 327,
    324, 327, 326, 328, 328, 329, 327, 329, 328, 330, 330, 331, 329, 331, 330, 332, 325, 333, 334,
    334, 326, 325, 326, 334, 335, 335, 328, 326, 328, 335, 336, 336, 330, 328, 330, 336, 337, 333,
    338, 339, 339, 334, 333, 334, 339, 340, 340, 335, 334, 335, 340, 341, 341, 336, 335, 336, 341,
    342, 338, 343, 344, 344, 339, 338, 339, 344, 345, 345, 340, 339, 340, 345, 346, 346, 341, 340,
    341, 346, 347, 348, 349, 350, 350, 351, 348, 351, 350, 352, 352, 353, 351, 353, 352, 354, 354,
    355, 353, 355, 354, 356, 349, 357, 358, 358, 350, 349, 350, 358, 359, 359, 352, 350, 352, 359,
    360, 360, 354, 352, 354, 360, 361, 357, 362, 363, 363, 358, 357, 358, 363, 364, 364, 359, 358,
    359, 364, 365, 365, 360, 359, 360, 365, 366, 362, 367, 368, 368, 363, 362, 363, 368, 369, 369,
    364, 363, 364, 369, 370, 370, 365, 364, 365, 370, 371, 372, 373, 374, 374, 375, 372, 375, 374,
    376, 376, 377, 375, 377, 376, 378, 378, 379, 377, 379, 378, 380, 373, 381, 382, 382, 374, 373,
    374, 382, 383, 383, 376, 374, 376, 383, 384, 384, 378, 376, 378, 384, 385, 381, 386, 387, 387,
    382, 381, 382, 387, 388, 388, 383, 382, 383, 388, 389, 389, 384, 383, 384, 389, 390, 386, 391,
    392, 392, 387, 386, 387, 392, 393, 393, 388, 387, 388, 393, 394, 394, 389, 388, 389, 394, 395,
    396, 397, 398, 398, 399, 396, 399, 398, 400, 400, 401, 399, 401, 400, 402, 402, 403, 401, 403,
    402, 404, 404, 405, 403, 397, 406, 407, 407, 398, 397, 398, 407, 408, 408, 400, 398, 400, 408,
    409, 409, 402, 400, 402, 409, 410, 410, 404, 402, 406, 411, 412, 412, 407, 406, 407, 412, 413,
    413, 408, 407, 408, 413, 414, 414, 409, 408, 409, 414, 415, 415, 410, 409, 411, 416, 417, 417,
    412, 411, 412, 417, 418, 418, 413, 412, 413, 418, 419, 419, 414, 413, 414, 419, 420, 420, 415,
    414, 421, 422, 423, 423, 424, 421, 424, 423, 425, 425, 426, 424, 426, 425, 427, 427, 428, 426,
    428, 427, 429, 429, 430, 428, 422, 431, 432, 432, 423, 422, 423, 432, 433, 433, 425, 423, 425,
    433, 434, 434, 427, 425, 427, 434, 435, 435, 429, 427, 431, 436, 437, 437, 432, 431, 432, 437,
    438, 438, 433, 432, 433, 438, 439, 439, 434, 433, 434, 439, 440, 440, 435, 434, 436, 441, 442,
    442, 437, 436, 437, 442, 443, 443, 438, 437, 438, 443, 444, 444, 439, 438, 439, 444, 445, 445,
    440, 439, 446, 447, 448, 448, 449, 446, 449, 448, 450, 450, 451, 449, 451, 450, 452, 452, 453,
    451, 453, 452, 454, 454, 455, 453, 447, 456, 457, 457, 448, 447, 448, 457, 458, 458, 450, 448,
    450, 458, 459, 459, 452, 450, 452, 459, 460, 460, 454, 452, 456, 461, 462, 462, 457, 456, 457,
    462, 463, 463, 458, 457, 458, 463, 464, 464, 459, 458, 459, 464, 465, 465, 460, 459, 461, 466,
    467, 467, 462, 461, 462, 467, 468, 468, 463, 462, 463, 468, 469, 469, 464, 463, 464, 469, 470,
    470, 465, 464, 471, 472, 473, 473, 474, 471, 474, 473, 475, 475, 476, 474, 476, 475, 477, 477,
    478, 476, 478, 477, 479, 479, 480, 478, 472, 481, 482, 482, 473, 472, 473, 482, 483, 483, 475,
    473, 475, 483, 484, 484, 477, 475, 477, 484, 485, 485, 479, 477, 481, 486, 487, 487, 482, 481,
    482, 487, 488, 488, 483, 482, 483, 488, 489, 489, 484, 483, 484, 489, 490, 490, 485, 484, 486,
    491, 492, 492, 487, 486, 487, 492, 493, 493, 488, 487, 488, 493, 494, 494, 489, 488, 489, 494,
    495, 495, 490, 489, 496, 497, 498, 498, 499, 496, 499, 498, 500, 500, 501, 499, 501, 500, 502,
    502, 503, 501, 503, 502, 504, 504, 505, 503, 497, 506, 507, 507, 498, 497, 498, 507, 508, 508,
    500, 498, 500, 508, 509, 509, 502, 500, 502, 509, 510, 510, 504, 502, 506, 511, 512, 512, 507,
    506, 507, 512, 513, 513, 508, 507, 508, 513, 514, 514, 509, 508, 509, 514, 515, 515, 510, 509,
    511, 516, 517, 517, 512, 511, 512, 517, 518, 518, 513, 512, 513, 518, 519, 519, 514, 513, 514,
    519, 520, 520, 515, 514, 521, 522, 523, 523, 524, 521, 524, 523, 525, 525, 526, 524, 526, 525,
    527, 527, 528, 526, 528, 527, 529, 529, 530, 528, 522, 531, 532, 532, 523, 522, 523, 532, 533,
    533, 525, 523, 525, 533, 534, 534, 527, 525, 527, 534, 535, 535, 529, 527, 531, 536, 537, 537,
    532, 531, 532, 537, 538, 538, 533, 532, 533, 538, 539, 539, 534, 533, 534, 539, 540, 540, 535,
    534, 536, 541, 542, 542, 537, 536, 537, 542, 543, 543, 538, 537, 538, 543, 544, 544, 539, 538,
    539, 544, 545, 545, 540, 539, 546, 547, 548, 548, 549, 546, 549, 548, 550, 550, 551, 549, 551,
    550, 552, 552, 553, 551, 553, 552, 554, 554, 555, 553, 547, 556, 557, 557, 548, 547, 548, 557,
    558, 558, 550, 548, 550, 558, 559, 559, 552, 550, 552, 559, 560, 560, 554, 552, 556, 561, 562,
    562, 557, 556, 557, 562, 563, 563, 558, 557, 558, 563, 564, 564, 559, 558, 559, 564, 565, 565,
    560, 559, 561, 566, 567, 567, 562, 561, 562, 567, 568, 568, 563, 562, 563, 568, 569, 569, 564,
    563, 564, 569, 570, 570, 565, 564, 571, 572, 573, 573, 574, 571, 574, 573, 575, 575, 576, 574,
    576, 575, 577, 577, 578, 576, 578, 577, 579, 579, 580, 578, 572, 581, 582, 582, 573, 572, 573,
    582, 583, 583, 575, 573, 575, 583, 584, 584, 577, 575, 577, 584, 585, 585, 579, 577, 581, 586,
    587, 587, 582, 581, 582, 587, 588, 588, 583, 582, 583, 588, 589, 589, 584, 583, 584, 589, 590,
    590, 585, 584, 586, 591, 592, 592, 587, 586, 587, 592, 593, 593, 588, 587, 588, 593, 594, 594,
    589, 588, 589, 594, 595, 595, 590, 589, 596, 597, 598, 597, 596, 599, 599, 600, 597, 600, 599,
    601, 601, 602, 600, 602, 601, 603, 603, 604, 602, 605, 596, 606, 596, 605, 607, 607, 599, 596,
    599, 607, 608, 608, 601, 599, 601, 608, 609, 609, 603, 601, 610, 605, 611, 605, 610, 612, 612,
    607, 605, 607, 612, 613, 613, 608, 607, 608, 613, 614, 614, 609, 608, 615, 610, 616, 610, 615,
    617, 617, 612, 610, 612, 617, 618, 618, 613, 612, 613, 618, 619, 619, 614, 613, 620, 621, 622,
    621, 620, 623, 623, 624, 621, 624, 623, 625, 625, 626, 624, 626, 625, 627, 627, 628, 626, 629,
    620, 630, 620, 629, 631, 631, 623, 620, 623, 631, 632, 632, 625, 623, 625, 632, 633, 633, 627,
    625, 634, 629, 635, 629, 634, 636, 636, 631, 629, 631, 636, 637, 637, 632, 631, 632, 637, 638,
    638, 633, 632, 639, 634, 640, 634, 639, 641, 641, 636, 634, 636, 641, 642, 642, 637, 636, 637,
    642, 643, 643, 638, 637, 644, 645, 646, 645, 644, 647, 647, 648, 645, 648, 647, 649, 649, 650,
    648, 650, 649, 651, 651, 652, 650, 653, 644, 654, 644, 653, 655, 655, 647, 644, 647, 655, 656,
    656, 649, 647, 649, 656, 657, 657, 651, 649, 658, 653, 659, 653, 658, 660, 660, 655, 653, 655,
    660, 661, 661, 656, 655, 656, 661, 662, 662, 657, 656, 663, 658, 664, 658, 663, 665, 665, 660,
    658, 660, 665, 666, 666, 661, 660, 661, 666, 667, 667, 662, 661, 668, 669, 670, 669, 668, 671,
    671, 672, 669, 672, 671, 673, 673, 674, 672, 674, 673, 675, 675, 676, 674, 677, 668, 678, 668,
    677, 679, 679, 671, 668, 671, 679, 680, 680, 673, 671, 673, 680, 681, 681, 675, 673, 682, 677,
    683, 677, 682, 684, 684, 679, 677, 679, 684, 685, 685, 680, 679, 680, 685, 686, 686, 681, 680,
    687, 682, 688, 682, 687, 689, 689, 684, 682, 684, 689, 690, 690, 685, 684, 685, 690, 691, 691,
    686, 685, 692, 693, 694, 694, 695, 692, 695, 694, 696, 696, 697, 695, 697, 696, 698, 698, 699,
    697, 699, 698, 700, 700, 701, 699, 693, 702, 703, 703, 694, 693, 694, 703, 704, 704, 696, 694,
    696, 704, 705, 705, 698, 696, 698, 705, 706, 706, 700, 698, 702, 707, 708, 708, 703, 702, 703,
    708, 709, 709, 704, 703, 704, 709, 710, 710, 705, 704, 705, 710, 711, 711, 706, 705, 707, 712,
    713, 713, 708, 707, 708, 713, 714, 714, 709, 708, 709, 714, 715, 715, 710, 709, 710, 715, 716,
    716, 711, 710, 717, 718, 719, 719, 720, 717, 720, 719, 721, 721, 722, 720, 722, 721, 723, 723,
    724, 722, 724, 723, 725, 725, 726, 724, 718, 727, 728, 728, 719, 718, 719, 728, 729, 729, 721,
    719, 721, 729, 730, 730, 723, 721, 723, 730, 731, 731, 725, 723, 727, 732, 733, 733, 728, 727,
    728, 733, 734, 734, 729, 728, 729, 734, 735, 735, 730, 729, 730, 735, 736, 736, 731, 730, 732,
    737, 738, 738, 733, 732, 733, 738, 739, 739, 734, 733, 734, 739, 740, 740, 735, 734, 735, 740,
    741, 741, 736, 735, 742, 743, 744, 744, 745, 742, 745, 744, 746, 746, 747, 745, 747, 746, 748,
    748, 749, 747, 749, 748, 750, 750, 751, 749, 743, 752, 753, 753, 744, 743, 744, 753, 754, 754,
    746, 744, 746, 754, 755, 755, 748, 746, 748, 755, 756, 756, 750, 748, 752, 757, 758, 758, 753,
    752, 753, 758, 759, 759, 754, 753, 754, 759, 760, 760, 755, 754, 755, 760, 761, 761, 756, 755,
    757, 762, 763, 763, 758, 757, 758, 763, 764, 764, 759, 758, 759, 764, 765, 765, 760, 759, 760,
    765, 766, 766, 761, 760, 767, 768, 769, 769, 770, 767, 770, 769, 771, 771, 772, 770, 772, 771,
    773, 773, 774, 772, 774, 773, 775, 775, 776, 774, 768, 777, 778, 778, 769, 768, 769, 778, 779,
    779, 771, 769, 771, 779, 780, 780, 773, 771, 773, 780, 781, 781, 775, 773, 777, 782, 783, 783,
    778, 777, 778, 783, 784, 784, 779, 778, 779, 784, 785, 785, 780, 779, 780, 785, 786, 786, 781,
    780, 782, 787, 788, 788, 783, 782, 783, 788, 789, 789, 784, 783, 784, 789, 790, 790, 785, 784,
    785, 790, 791, 791, 786, 785] )

};

