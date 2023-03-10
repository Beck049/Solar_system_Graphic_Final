class obj_buffer_tex
{
    constructor(program) {
        this.VertexPosition_Buffer = null;
        this.VertexNormal_Buffer = null;
        this.VertexTextureCoordinate_Buffer = null;
        this.len = 0;
        this.theta = [ 0, 0, 0 ];
        this.Axis = 1;
        this.speed = 0.2;
        this.self_theta = [ 0, 0, 0 ];
        this.self_Axis = 1;
        this.self_speed = -2.0;
        this.location = [0,0,0];
        this.Texture_Buffer = null;
        this.material_shininess = -1;
        this.material_Ambient = vec4( 0,0,0,0 );
        this.material_Diffuse = vec4( 0,0,0,0 );
        this.material_Specular = vec4( 0,0,0,0 );
        this.vPosition = gl.getAttribLocation( program, "vPosition" );
        this.vColor = gl.getAttribLocation( program, "vColor" );
        this.vNormal = gl.getAttribLocation( program, "vNormal" );
        this.vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
        this.modelingmatrix = null;
        this.enable_light = 0.0;//0->normal 1->not normal
        this.enable_shadow = 0.0;//0->have shadow 1->dont have shadow
        this.enable_self_go_around = 0.0;
    }
    the_buffer_stuff(obj,program) {
        this.VertexPosition_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPosition_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.pointsArray), gl.STATIC_DRAW);
        this.len = obj.numVertices;
        this.loction[0] = obj.pos_loc[0];
        this.loction[1] = obj.pos_loc[1];
        this.loction[2] = obj.pos_loc[2];

        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        // color array atrribute buffer

        this.VertexColor_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexColor_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.colorsArray), gl.STATIC_DRAW);

        var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

        // normal array atrribute buffer

        this.VertexNormal_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormal_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.normalsArray), gl.STATIC_DRAW);

        var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vNormal );

        this.VertexTextureCoordinate_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexTextureCoordinate_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.texcoords), gl.STATIC_DRAW);


        this.Texture_Buffer = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.Texture_Buffer);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);


        var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
        gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vTexCoord );
    }
    the_buffer(obj) {
        this.VertexPosition_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPosition_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.pointsArray), gl.STATIC_DRAW);
        // color array atrribute buffer
        this.len = obj.numVertices;
        this.location[0] = obj.pos_loc[0];
        this.location[1] = obj.pos_loc[1];
        this.location[2] = obj.pos_loc[2];

        this.VertexColor_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexColor_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.colorsArray), gl.STATIC_DRAW);
        // normal array atrribute buffer

        this.VertexNormal_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormal_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.normalsArray), gl.STATIC_DRAW);

        this.VertexTextureCoordinate_Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexTextureCoordinate_Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(obj.texcoords), gl.STATIC_DRAW);
    }
    the_attribute() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPosition_Buffer);
        //this.vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( this.vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vPosition );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexColor_Buffer);
        //this.vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( this.vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vColor );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormal_Buffer);
        //this.vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( this.vNormal, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vNormal );

        gl.bindTexture(gl.TEXTURE_2D, this.Texture_Buffer);
        //gl.uniform1i(this.tex_loc, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexTextureCoordinate_Buffer);
        //this.vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
        gl.vertexAttribPointer( this.vTexCoord, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vTexCoord );
    }

    TEXture(image) {
        this.Texture_Buffer = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.Texture_Buffer);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //gl.uniform1i(this.tex_loc, 0);
    }
}

