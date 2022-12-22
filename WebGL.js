// Read shader .glsl using AJAX
function loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};

function compileShader(gl, vShaderName, fShaderName) {
    function getShader(gl, shaderName, type) {
        var shader = gl.createShader(type),
            shaderScript = loadFileAJAX(shaderName);
        if (!shaderScript) {
            alert("Could not find shader source: "+shaderName);
        }
        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
        fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),
        program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
        return null;
    }

    
    return program;
};

{ // Attr & Buffer inits
/////BEGIN:///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log("Failed to create the buffer object");
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Store the necessary information to assign the object to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initVertexBufferForLaterUse(gl, vertices, normals, texCoords) {
    var nVertices = vertices.length / 3;

    var o = new Object();
    o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
    if (normals != null) o.normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);
    if (texCoords != null) o.texCoordBuffer = initArrayBufferForLaterUse(gl, new Float32Array(texCoords), 2, gl.FLOAT);
    //you can have error check here
    o.numVertices = nVertices;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}
/////END://///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
}

var gl;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;
var theta = [ 0, 0, 0 ];
var paused = 0;
var depthTest = 1;

var obj_count = 15;

var all_obj = [];
var obj_tex = [];

var enable_light = 0;
var enable_shadow = 0;

var width,height;

let keyboardState = {};

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

{//event trigger
function eventListenerRegister() {
    document.getElementById('fullscreen-button').addEventListener('click', handleFullscreen);
    gl.canvas.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    window.addEventListener('resize', handleWindowResize);
}

{// screen related
function handleFullscreen() {
    if (document.fullscreenElement) {
        document.webkitCancelFullScreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

function handleFullScreenChange() {
    if (document.fullscreenElement) {
        gl.canvas.classList.add('fullscreen');
        handleWindowResize();
        gl.canvas.requestPointerLock();
    } else {
        gl.canvas.classList.remove('fullscreen');
        gl.canvas.width = '1280';
        gl.canvas.height = '720';
        handleWindowResize();
        document.exitPointerLock();
    }
}

function handleWindowResize() {
    handleCanvasResize();
}

function handleCanvasResize() {
	var width = width || gl.canvas.clientWidth;
    var height = height || gl.canvas.clientHeight;

    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniformMatrix4fv(projectionLoc, 0,
        flatten(perspective(70, width / height, 0.1, 1000)));
		
		
  console.log('resize canvas to: ' + gl.canvas.width + ' x ' + gl.canvas.height +
        ' (' + Math.floor(gl.canvas.width * window.devicePixelRatio) + ' x ' +
        Math.floor(gl.canvas.height * window.devicePixelRatio) + ') @' + window.devicePixelRatio);
}

}


{// Key events
function handleKeyDown(event) {
    keyboardState[event.code] = true;
    switch (event.key) {
        case 'f':
        handleFullscreen();
        break;
        case 'p':
        paused=!paused;
        break;
    }
}

function handleKeyUp(event) {
    delete keyboardState[event.code];
}

}


{// mouse events
var mouseSensitiveXEle;
var mouseSensitiveYEle;
var FOVcfg;
var transp;

var mouseMove = [0, 0];

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleCanvasMouseMove(event) {
  if(mouseDown == true){
    mouseMove[0] += event.movementX/(10-mouseSensitiveXEle.value);
    mouseMove[1] += event.movementY/(10-mouseSensitiveYEle.value);
  }
}

// event handlers for button clicks
function rotateX() {
	paused = 0;
    axis = xAxis;
};
function rotateY() {
	paused = 0;
	axis = yAxis;
};
function rotateZ() {
	paused = 0;
	axis = zAxis;
};
}

}

var texture;
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
// ModelView and Projection matrices
var des_light_loc, des_shadow_loc;
var modelingLoc, viewingLoc, projectionLoc,shininessLoc;
var modeling, viewing, projection;

var eyePosition   = vec4( 0.0, 1.0, 2.0, 1.0 );
var lookPos=[0,0,0];
var upPos=[0,1,0];
var lightPosition = vec4( 0.0, 2.0, 0.0, 1.0 );

var materialAmbient = vec4( 0.05, 0.05, 0.05, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4( 0.8, 0.8,0.8, 0.8 );
var materialShininess = 50.0;


function configureTexture( image , program) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}


var AU = 2;
var draw_time = 10.0;

{ // objects of all planets // read all images
var sun = new obj_sphere(4.0/10,0*AU,0,0,0.5,5);
var sun_in = new obj_sphere(3.99/10,0*AU,0,0,0.5,5);
var mec = new obj_sphere(0.383/10,0.39*AU,0,0,1.0,5);
var ven = new obj_sphere(0.95/10,0.72*AU,0,0,1.0,5);
var ear = new obj_sphere(1.0/10,1.0*AU,0,0,1.0,5);
var ear_clo = new obj_sphere(1.02/10,1.0*AU,0,0,0.15,5);
var moo = new obj_sphere(0.273/10,1.0*AU,0,0.2,1.0,5);
var mar = new obj_sphere(0.532/10,1.42*AU,0,0,1.0,5);
var jup = new obj_sphere(1.97/10,2.5*AU,0,0,1.0,5);
var sat = new obj_sphere(1.1/10,3.2*AU,0,0,1.0,5);
var ura = new obj_sphere(0.598/10,4.3*AU,0,0,1.0,5);
var net = new obj_sphere(0.587/10,5.5*AU,0,0,1.0,5);
var bor = new obj_sphere(0.2/10,7*AU,0,0,1.0,5);
var back = new obj_sphere(35,0,0,0,1.0,5);
var test_ring = new obj_ring(0.25,0.15,3.2*AU,0,0,1.0,0.01);
}

function init()
{
	//ResourceConstraints::set_max_old_space_size(12000);
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas,  { alpha: false } );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	//setBackgroundColor(0.0,0.0,0.0,1.0);
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = compileShader( gl, "./shaders/vShader.glsl", "./shaders/fShaders.glsl" );
    gl.useProgram( program );

    function set_image(obj_sphere, src_path){
        var obj_image = new Image();
        obj_image.onload = function() { 
            obj_sphere.TEXture( obj_image );
        }
        obj_image.src = src_path;
    }

    function set_planet_attr(program, object, src_path, speed, rotate, obj_sphere){
        set_image(obj_sphere, src_path)
        obj_sphere.the_buffer(object);
        obj_sphere.speed = speed;
        obj_sphere.self_speed = rotate;
    }

    function set_planet_obj(program, object, src_path, speed, rotate){
        let obj_sphere = new obj_buffer_tex(program);
        set_planet_attr(program, object, src_path, speed, rotate, obj_sphere);
        return obj_sphere; 
    }

    let sun_in_sphere = new obj_buffer_tex(program);
    set_planet_attr(program, sun, "src/8k_sun.jpg", -0.1, 0.1, sun_in_sphere);
    sun_in_sphere.Axis = 2;
    //sun_sphere.enable_light = 1.0; // I don't know why grid displays
    sun_in_sphere.enable_shadow = 1.0;
    all_obj.push(sun_in_sphere);
    
    all_obj.push(set_planet_obj(program, mec, "src/mec.jpg", -1.0, 0.5));

    all_obj.push(set_planet_obj(program, ven, "src/ve.jpg", -0.5, -2.0));

    all_obj.push(set_planet_obj(program, ear, "src/earth.jpg", 0.3, 1.0));

    let moo_sphere = new obj_buffer_tex(program);
    set_planet_attr(program, moo, "src/moon.jpg", 0.3, -1.0, moo_sphere);
    moo_sphere.location[2] = 0.0;
    all_obj.push(moo_sphere);

    all_obj.push(set_planet_obj(program, mar, "src/mars.jpg", -0.3, 1.5));

    all_obj.push(set_planet_obj(program, jup, "src/ju.jpg", 0.7, 0.5));

    all_obj.push(set_planet_obj(program, sat, "src/sa.jpg", -0.8, 0.7));

    all_obj.push(set_planet_obj(program, ura, "src/ura.jpg", 0.1, 0.2));

    all_obj.push(set_planet_obj(program, net, "src/nep.jpg", -0.05, 1.0));

    let bor_sphere = new obj_buffer_tex(program);
    set_image(bor_sphere, "src/bor.jpg");
    bor_sphere.the_buffer(bor);
    bor_sphere.speed = -0.3;
    all_obj.push(bor_sphere);

    let back_sphere = new obj_buffer_tex(program);
    set_image(back_sphere, "src/back.jpg");
    back_sphere.the_buffer(back);
    back_sphere.enable_self_go_around = 1.0;
    back_sphere.speed = 0.03;
    back_sphere.enable_shadow = 1.0;
    all_obj.push(back_sphere);

    let test_ring_tex = new obj_buffer_tex(program);
    set_image(test_ring_tex, "src/ring.jpg");
    test_ring_tex.the_buffer(test_ring);
    test_ring_tex.speed = -0.8;
    test_ring_tex.enable_light = 1.0;
    all_obj.push(test_ring_tex);

    let sun_sphere = new obj_buffer_tex(program);
    set_planet_attr(program, sun, "src/8k_sun.png", 0.3, 0.0, sun_sphere);
    //sun_sphere.enable_light = 1.0; // I don't know why there will be grid on the sun
    sun_sphere.enable_shadow = 1.0;
    all_obj.push(sun_sphere);

    let clo_sphere = new obj_buffer_tex(program);
    set_planet_attr(program, ear_clo, "src/8k_clouds.jpg", 0.3, 0.2, clo_sphere);
    all_obj.push(clo_sphere);

	// uniform variables in shaders
    modelingLoc   = gl.getUniformLocation(program, "modelingMatrix"); 
    viewingLoc    = gl.getUniformLocation(program, "viewingMatrix"); 
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix"); 
    des_light_loc = gl.getUniformLocation(program, "enable_light");
    des_shadow_loc= gl.getUniformLocation(program, "enable_shadow");

    gl.uniform4fv( gl.getUniformLocation(program, "eyePosition"), flatten(eyePosition) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialAmbient"),flatten(materialAmbient));
    gl.uniform4fv( gl.getUniformLocation(program, "materialDiffuse"),flatten(materialDiffuse) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialSpecular"), flatten(materialSpecular) );	       
    gl.uniform1f ( gl.getUniformLocation(program, "shininess"), materialShininess);

    //event listeners for buttons 
    function pause() {paused=!paused;}

    document.getElementById( "pButton" ).addEventListener("click", pause);

	mouseSensitiveXEle=document.getElementById("x_sensitivity");
	mouseSensitiveYEle=document.getElementById("y_sensitivity");
	// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
	canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    //document.onmousemove = handleMouseMove;
	FOVcfg=document.getElementById("FOVcfg");
	//transp=document.getElementById("transp");
	FOVcfg.value=60;
	//transp.value=2;
	
	//prepare for translucent
	gl.enable(gl.DEPTH_TEST);
	
	eventListenerRegister()
    draw(canvas,program);
};

// onload function
(function() { window.addEventListener('load', init) })();

function draw(program) {
	var canvas = gl.canvas;
	
/////////  key & value operations start /////////////////////
	let step = 1;
    var exprm = true;
    switch(exprm) {
        case keyboardState['ArrowUp']:
            mouseMove[1] -= step;
            break;
        case keyboardState['ArrowDown']:
            mouseMove[1] += step;
            break;
        case keyboardState['ArrowLeft']:
            mouseMove[0] -= step;
            break;
        case keyboardState['ArrowRight']:
            mouseMove[0] += step;
            break;
        default:
            break;
    }
	
	var direction = [];
	for(var i=0;i<3;i++)
		direction[i]=lookPos[i]-eyePosition[i];
	direction=normalize(direction);
	
	
	if (-direction[1] * Math.sign(mouseMove[1]) > 0.8)
      mouseMove[1] = 0;
  
			
	var rotateMatrix = mult(rotate(mouseMove[0] / 4, [0, -1, 0]),
                    rotate(mouseMove[1] / 4, [direction[2], 0, -direction[0]]));
		
	
	mouseMove[0] = 0;
    mouseMove[1] = 0;
	
	var newDirection = [0, 0, 0];
	for (let i = 0; i < 3; ++i)
		for (let j = 0; j < 3; ++j)
			newDirection[i] += rotateMatrix[i][j] * direction[j];
	newDirection = normalize(newDirection);
	
	
    var moveDirection = [0, 0, 0];
    var expr = true;
    switch(expr) {
        case keyboardState['KeyW']:
            moveDirection[0] += newDirection[0];
            moveDirection[2] += newDirection[2];
            break;
        case keyboardState['KeyS']:
            moveDirection[0] -= newDirection[0];
            moveDirection[2] -= newDirection[2];
            break;
        case keyboardState['KeyA']:
            moveDirection[0] += newDirection[2];
            moveDirection[2] -= newDirection[0];
            break;
        case keyboardState['KeyD']:
            moveDirection[0] -= newDirection[2];
            moveDirection[2] += newDirection[0];
            break;
        case keyboardState['KeyV']:
            moveDirection[1] += 0.7;
            break;
        case keyboardState['ShiftLeft']:
            moveDirection[1] -= 0.7;
            break;
        default:
            break;
    }
/////////  key & value operations end  /////////////////////
	
	var newPosition = eyePosition.slice();
    var newLookAt = [];
	for (var i = 0; i < 3; ++i) {
      newPosition[i] += 0.05 * moveDirection[i];
      newLookAt[i] = newPosition[i] + newDirection[i];
    }
	
	eyePosition=newPosition.slice();
	lookPos=newLookAt.slice();
	
	viewing = lookAt(vec3(eyePosition), lookPos, upPos);//eyePosition  lookPos upPos

	projection = perspective(FOVcfg.value, canvas.width/canvas.height, 0.1, 1000.0);  /// (FOV, proportion, nearest(smaller is better),farest(larger is better))

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    for(let i = 0;i < obj_count;i++)
    {
        let self_modeling = mult(rotate(all_obj[i].self_theta[xAxis], 1, 0, 0),
                                 mult(   rotate(all_obj[i].self_theta[yAxis], 0, 1, 0 ),
                                         rotate(all_obj[i].self_theta[zAxis], 0, 0, 1 )    )   );

        all_obj[i].self_theta[all_obj[i].self_Axis] += all_obj[i].self_speed;
        
        let self_modeling_final  =  mult(  mult(  translate(all_obj[i].location[0], all_obj[i].location[1], all_obj[i].location[2]),  self_modeling  ),
                                           translate(  -1*all_obj[i].location[0], -1*all_obj[i].location[1], -1*all_obj[i].location[2]  )                );

        modeling  = mult(rotate(all_obj[i].theta[xAxis], 1, 0, 0),
                         mult( rotate(all_obj[i].theta[yAxis], 0, 1, 0 ), 
                               rotate(all_obj[i].theta[zAxis], 0, 0, 1 )  )  );

        if (! paused) {
            all_obj[i].theta[all_obj[i].Axis] += all_obj[i].speed;
        }

        if(all_obj[i].enable_self_go_around > 0.0){
            modeling_final = modeling;
        } else {
            modeling_final = mult(modeling,self_modeling_final);
        }

        enable_light = all_obj[i].enable_light;
        enable_shadow = all_obj[i].enable_shadow;
        gl.uniformMatrix4fv( modelingLoc,   0, flatten(modeling_final) );
        gl.uniformMatrix4fv( viewingLoc,    0, flatten(viewing) );
        gl.uniformMatrix4fv( projectionLoc, 0, flatten(projection) );
        gl.uniform1f( des_light_loc, enable_light);
        gl.uniform1f( des_shadow_loc, enable_shadow);
    
		
		if(i==obj_count-1 || i==obj_count-2)
		{
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.blendEquation(gl.FUNC_ADD);
		} else {
			gl.disable(gl.BLEND);
			gl.enable(gl.DEPTH_TEST);
			gl.depthMask(true);
		}
		
        all_obj[i].the_attribute();

        if(enable_light > 0.0){
            gl.drawArrays( gl.LINE_LOOP, 0, all_obj[i].len );
        } else {
            gl.drawArrays( gl.TRIANGLES, 0, all_obj[i].len );  
        }
    }

    requestAnimFrame( draw );
}
