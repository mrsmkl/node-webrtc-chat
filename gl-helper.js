
function initGL(canvas) {
    var gl;
	try {
		gl = canvas.getContext("experimental-webgl", {antialias:false});
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
    catch(e) {}
	if (!gl) console.log("WebGL not supported");
	return gl;
}

exports.initGL = initGL;

function makeShader(gl, type, str) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function makeProgram(gl, vs_str, ps_str) {
	var ps = makeShader(gl, gl.FRAGMENT_SHADER, ps_str);
	var vs = makeShader(gl, gl.VERTEX_SHADER, vs_str);
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vs);
	gl.attachShader(shaderProgram, ps);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders " + gl.getProgramInfoLog(shaderProgram));
	}
	return shaderProgram;
}

function FBO(gl, w, h, dta) {
	this.renderBuf = gl.createRenderbuffer();
	this.frameBuf = gl.createFramebuffer();
	this.texture = gl.createTexture();
	this.width = w;
	this.height = h;

	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.WRAP);
	
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.WRAP);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.UNSIGNED_BYTE, dta);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuf);
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuf);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D, this.texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER,
		this.renderBuf);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function FBOalpha(gl, w, h, dta) {
	this.renderBuf = gl.createRenderbuffer();
	this.frameBuf = gl.createFramebuffer();
	this.texture = gl.createTexture();
	this.width = w;
	this.height = h;

	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, dta);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuf);
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuf);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D, this.texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER,
		this.renderBuf);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function FBOFloat(gl, w, h, dta) {
	this.renderBuf = gl.createRenderbuffer();
	this.frameBuf = gl.createFramebuffer();
	this.texture = gl.createTexture();
	this.width = w;
	this.height = h;

	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, dta);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuf);
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuf);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D, this.texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER,
		this.renderBuf);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function handleLoadedTexture(gl, texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}


function Context(gl) {
	this.gl = gl;
	this.textures = [];
	this.eTexture = [];
	this.fbos = [];
	this.programs = [];
	this.physics = [];
}

exports.Context = Context;

Context.prototype.newTexture = function (name, file) {
	var texture = this.gl.createTexture();
    var gl = this.gl;
	texture.image = new Image();
	texture.image.onload = function () { handleLoadedTexture(gl, texture); };
	texture.image.src = file;
	this.textures[name] = texture;
//	alert(name + ", " + file);
};

Context.prototype.floatTexture = function (name, w, h, data) {
	var gl = this.gl;
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, data);
	this.textures[name] = texture;
};

Context.prototype.emptyTexture = function (name) {
	var texture = this.gl.createTexture();
	this.textures[name] = texture;
	return texture;
};

Context.prototype.newFBO = function (name, w, h, dta) {
	this.fbos[name] = new FBO(this.gl, w, h, dta);
//	alert(name + ", " + w + ", " + h);
};

Context.prototype.newFBOFloat = function (name, w, h, dta) {
	this.fbos[name] = new FBOFloat(this.gl, w, h, dta);
};

Context.prototype.newFBOAlpha = function (name, w, h, dta) {
	this.fbos[name] = new FBOalpha(this.gl, w, h, dta);
	// alert(name + ", " + w + ", " + h);
};

// Programs have parameters
// Attributes and uniforms
Context.prototype.newProgram =
function (name, vs_attr, vs_uniform, vs_str, share_attr, ps_uniform, ps_str) {
  this.newProgramF(name, vs_attr, vs_uniform, vs_str, share_attr, ps_uniform, ps_str);
};

Context.prototype.newProgramF =
function (name, vs_attr, vs_uniform, vs_str, share_attr, ps_uniform, ps_str, ps_funcs, vs_funcs) {
	var vs_attr_str = "";
	for (var i in vs_attr) {
		vs_attr_str += "attribute " + vs_attr[i][0] + " " + vs_attr[i][1] + ";\n";
	}
	var vs_uniform_str = "";
	for (var i in vs_uniform) {
		var t = vs_uniform[i][0];
		if (t == "float2D") vs_uniform_str += makeTexture(vs_uniform[i][1]);
		else vs_uniform_str += "uniform " + t + " " + vs_uniform[i][1] + ";\n";
	}
	var ps_uniform_str = "";
	for (var i in ps_uniform) {
		var t = ps_uniform[i][0];
		if (t == "float2D") ps_uniform_str += makeTexture(ps_uniform[i][1]);
		else ps_uniform_str += "uniform " + ps_uniform[i][0] + " " + ps_uniform[i][1] + ";\n";
	}
	var ps_func_str = "";
	for (var i in ps_funcs) {
		ps_func_str += ps_funcs[i] + "\n";
	}
	var vs_func_str = "";
	for (var i in vs_funcs) {
		vs_func_str += vs_funcs[i] + "\n";
	}
	var share_attr_str = "";
	for (var i in share_attr) {
		share_attr_str += "varying " + share_attr[i][0] + " " + share_attr[i][1] + ";\n";
	}
	var vs =
	  vs_attr_str + "\n" + vs_uniform_str + "\n" + share_attr_str + "\n" +
	  vs_func_str + "\n" +
	  "void main(void) {\n" +
	  vs_str + "\n" +
	  "}\n";
	var ps =
    "precision highp float;" +
    ps_uniform_str + "\n" + share_attr_str + "\n" +
	  ps_func_str + "\n" +
	  "void main(void) {\n" +
	  ps_str + "\n" +
	  "}\n";
	var program = makeProgram(this.gl, vs, ps);
  // alert(vs); alert(ps);
  program.attributes = [];
	program.vs_attr = [];
	for (var i in vs_attr) {
		program.vs_attr[vs_attr[i][1]] = vs_attr[i][0];
	}
	program.uniform = [];
	for (var i in vs_uniform) {
		program.uniform[vs_uniform[i][1]] = vs_uniform[i][0];
	}
//	program.ps_uniform = [];
	for (var i in ps_uniform) {
		program.uniform[ps_uniform[i][1]] = ps_uniform[i][0];
	}
	program.uniformLoc = [];
	for (var i in program.uniform) {
		program.uniformLoc[i] = this.gl.getUniformLocation(program, i);
	}
	this.programs[name] = program;
}

var	tnum = 0;

function setArg(ctx, gl, prog, name, val) {
	var t = prog.uniform[name];
	var loc = prog.uniformLoc[name];
	//		var loc = gl.getUniformLocation(prog, name);
	if (t == "int") {
		gl.uniform1i(loc, val);
	}
	else if (t == "float") {
		// if (typeof(val) != "number") alert(loc + ": " + JSON.stringify(val));
		gl.uniform1f(loc, parseFloat(val));
	}
	else if (t == "vec2") {
		gl.uniform2f(loc, val[0], val[1]);
	}
	else if (t == "vec3") {
		gl.uniform3f(loc, val[0], val[1], val[2]);
	}
	else if (t == "vec4") {
		gl.uniform4f(loc, val[0], val[1], val[2], val[3]);
	}
	else if (t == "mat4") {
		// alert("Setting: " + loc + " named " + name + " to " + val.flatten());
		gl.uniformMatrix4fv(loc, false, new Float32Array(val.ensure4x4().flatten()));
	}
	else if (t == "sampler2D") {
		if (tnum == 0) gl.activeTexture(gl.TEXTURE0);
		else if (tnum == 1) gl.activeTexture(gl.TEXTURE1);
		else if (tnum == 2) gl.activeTexture(gl.TEXTURE2);
		else if (tnum == 3) gl.activeTexture(gl.TEXTURE3);
		else if (tnum == 4) gl.activeTexture(gl.TEXTURE4);
		else if (tnum == 5) gl.activeTexture(gl.TEXTURE5);
		// Check if texture or fbo
		if (ctx.textures[val]) {
			gl.bindTexture(gl.TEXTURE_2D, ctx.textures[val]);
		}
		else if (ctx.fbos[val]) {
            // console.log("bind " + tnum + " to " + ctx.fbos[val].texture);
			gl.bindTexture(gl.TEXTURE_2D, ctx.fbos[val].texture);
		}
		else if (ctx.eTexture[val]) {
			gl.bindTexture(gl.TEXTURE_2D, ctx.eTexture[val]);
		}
		gl.uniform1i(loc, tnum);
		tnum++;
	}
	else if (t == "float2D") {
		if (tnum == 0) gl.activeTexture(gl.TEXTURE0);
		else if (tnum == 1) gl.activeTexture(gl.TEXTURE1);
		else if (tnum == 2) gl.activeTexture(gl.TEXTURE2);
		else if (tnum == 3) gl.activeTexture(gl.TEXTURE3);
		else if (tnum == 4) gl.activeTexture(gl.TEXTURE4);
		else if (tnum == 5) gl.activeTexture(gl.TEXTURE5);
		// Can be fbo or physics buffer
		var fbo;
		if (ctx.fbos[val]) fbo = ctx.fbos[val];
		else fbo = ctx.physics[val].current;
		gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
		// alert("float2D " + name);
		var loc_w = gl.getUniformLocation(prog, name + "_width");
		var loc_h = gl.getUniformLocation(prog, name + "_height");
		gl.uniform1i(loc, tnum);
		gl.uniform1f(loc_w, fbo.width + 0.0);
		gl.uniform1f(loc_h, fbo.height + 0.0);
		tnum++;
	}
}
	
function setArgs(ctx, gl, prog, attr_arg, vs_arg, ps_arg) {
	tnum = 0;

	for (var i in attr_arg) {
		var buffer = attr_arg[i][1];
		var name = attr_arg[i][0];
		// alert("Setting buffer " + name + " to " + buffer);
		prog.attributes[name] = buffer;
	}
	for (var i in vs_arg) {
		setArg(ctx, gl, prog, vs_arg[i][0], vs_arg[i][1], tnum);
	}
	for (var i in ps_arg) {
		setArg(ctx, gl, prog, ps_arg[i][0], ps_arg[i][1], tnum);
	}
}

function updateVideoTexture(ctx, name) {
	// Get texture from element
	var image = document.getElementById(name);
	var texture = ctx.eTexture[name];
    var gl = ctx.gl;
	//	var texture;
	if (!texture) {
		texture = gl.createTexture();
		ctx.eTexture[name] = texture;
	}
	// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
//		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	// gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

exports.updateVideoTexture = updateVideoTexture;

function updateTexture(ctx, name) {
	// Get texture from element
	var image = document.getElementById(name);
	var texture = ctx.eTexture[name];
//	var texture;
	if (!texture) texture = gl.createTexture();
	ctx.eTexture[name] = texture;
	// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
//		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.generateMipmap(gl.TEXTURE_2D);
}

// Enable and set attributes
function enableAttribs(gl, prog) {
	for (var i in prog.vs_attr) {
		gl.enableVertexAttribArray(gl.getAttribLocation(prog, i));
		var buffer = prog.attributes[i];
		var loc = gl.getAttribLocation(prog, i);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		// alert("Setting buffer " + buffer + " to " + i);
        gl.vertexAttribPointer(loc, buffer.itemSize, gl.FLOAT, false, 0, 0);
	}
}

function disableAttribs(gl, prog) {
	for (var i in prog.vs_attr) {
		gl.disableVertexAttribArray(gl.getAttribLocation(prog, i));
	}
}

Context.prototype.draw = function (type, name, attr_arg, vs_arg, ps_arg) {
	// Set attributes for the program
//	this.gl.disable(this.gl.DEPTH_TEST);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var program = this.programs[name];
	this.gl.useProgram(program);
	setArgs(this, this.gl, program, attr_arg, vs_arg, ps_arg);
	enableAttribs(this.gl, program);
	this.gl.drawArrays(type, 0,  program.attributes["vertexPosition"].numItems);
	disableAttribs(this.gl, program);
}

Context.prototype.clear = function () {
	var gl = this.gl;
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

Context.prototype.drawElem = function (type, buffer, name, attr_arg, vs_arg, ps_arg) {
	// Set attributes for the program
//	this.gl.disable(this.gl.DEPTH_TEST);
	var gl = this.gl;
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var program = this.programs[name];
	this.gl.useProgram(program);
	setArgs(this, this.gl, program, attr_arg, vs_arg, ps_arg);
	enableAttribs(gl, program);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER_BINDING, buffer);
	// alert(buffer);
	this.gl.drawElements(type, buffer.numItems, gl.UNSIGNED_SHORT, 0);
	disableAttribs(gl, program);
}

Context.prototype.drawSystem = function (type, num, name, attr_arg, vs_arg, ps_arg) {
	// Set attributes for the program
//	this.gl.disable(this.gl.DEPTH_TEST);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var program = this.programs[name];
	this.gl.useProgram(program);
	setArgs(this, this.gl, program, attr_arg, vs_arg, ps_arg);
	enableAttribs(gl, program);
	var loc_num = gl.getUniformLocation(program, "num");
	for (var i = 0; i < num; i++) {
		gl.uniform1i(loc_num, i);
		this.gl.drawArrays(type, 0,  program.attributes["vertexPosition"].numItems);
	}
	disableAttribs(gl, program);
}

Context.prototype.drawMulti = function (type, num, name, attr_arg, vs_arg, ps_arg) {
	// Set attributes for the program
//	this.gl.disable(this.gl.DEPTH_TEST);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var program = this.programs[name];
	this.gl.useProgram(program);
	setArgs(this, this.gl, program, attr_arg, [], []);
	enableAttribs(gl, program);
  //	setArgs(this, this.gl, program, [], vs_arg(0), ps_arg(0));
	for (var i = 0; i < num; i++) {
        setArgs(this, this.gl, program, [], vs_arg(i), ps_arg(i));
		this.gl.drawArrays(type, 0,  program.attributes["vertexPosition"].numItems);
	}
	disableAttribs(gl, program);
};

Context.prototype.drawElemSystem = function (type, num, buffer, name, attr_arg, vs_arg, ps_arg) {
	// Set attributes for the program
//	this.gl.disable(this.gl.DEPTH_TEST);
  var gl = this.gl;
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var program = this.programs[name];
	gl.useProgram(program);
	setArgs(this, gl, program, attr_arg, vs_arg, ps_arg);
	enableAttribs(gl, program);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    var loc_num1 = gl.getUniformLocation(program, "num1");
    var loc_num2 = gl.getUniformLocation(program, "num2");
    for (var i = 0; i < num; i++) {
        gl.uniform1i(loc_num1, i);
        for (var j = 0; j < num; j++) {
            gl.uniform1i(loc_num2, j);
	        gl.drawElements(type, buffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
	}
	disableAttribs(gl, program);
};

Context.prototype.drawFBO = function (fbo_name, type, name, attr_arg, vs_arg, ps_arg) {
	// Set attributes for the program
  // this.gl.disable(this.gl.DEPTH_TEST);
	var fbo = this.fbos[fbo_name];
	// alert("drawing: " + fbo_name);
	// alert("drawing fbo: " + fbo.frameBuf);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo.frameBuf);
	this.gl.viewport(0, 0, fbo.width, fbo.height);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // alert(fbo.width + ", " + fbo.height + fbo.frameBuf);
	var program = this.programs[name];
	this.gl.useProgram(program);
	setArgs(this, this.gl, program, attr_arg, vs_arg, ps_arg);
	enableAttribs(this.gl, program);
	this.gl.drawArrays(type, 0, program.attributes["vertexPosition"].numItems);
	disableAttribs(this.gl, program);
};

Context.prototype.clearFBO = function (fbo_name) {
	var fbo = this.fbos[fbo_name];
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo.frameBuf);
	this.gl.viewport(0, 0, fbo.width, fbo.height);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

function Program() {
	this.attributes = [];
	this.vs_uniform = [];
	this.shared = [];
	this.ps_uniform = [];
	this.ps_functions = [];
	this.vs_functions = [];
}

exports.Program = Program;

Program.prototype.setVS = function (str) { this.vs_str = str; };
Program.prototype.setPS = function (str) { this.ps_str = str; };
Program.prototype.addA = function (t, name) {
  this.attributes[this.attributes.length] = [t, name];
};

Program.prototype.addVSFunction = function (code) {
  this.vs_functions.push(code);
};

Program.prototype.addPSFunction = function (code) {
  this.ps_functions.push(code);
};

Program.prototype.addVSU = function (t, name) {
  this.vs_uniform[this.vs_uniform.length] = [t, name];
};

Program.prototype.addPSU = function (t, name) {
  this.ps_uniform[this.ps_uniform.length] = [t, name];
};

Program.prototype.addShared = function (t, name) {
  this.shared[this.shared.length] = [t, name];
};

Context.prototype.compile = function (name, prog) {
	this.newProgramF(name, prog.attributes, prog.vs_uniform,
		prog.vs_str, prog.shared, prog.ps_uniform, prog.ps_str, prog.ps_functions,
		prog.vs_functions);
}

function makeSquare(gl) {
	var vertices = [
		-1.0, -1.0, -10.0,
		1.0, -1.0, -10.0,
		-1.0, 1.0, -10.0,
		1.0, 1.0, -10.0,
		1.0, -1.0, -10.0,
		-1.0, 1.0, -10.0,
	];
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	buffer.itemSize = 3;
	buffer.numItems = 6;
	return buffer;
};

Context.prototype.setAttrib = function (name, aname, buffer) {
	var prog = this.programs[name];
	prog.attributes[aname] = buffer;
};

// Make more simple program for texture manipulation
Context.prototype.textureProgram = function (name, ps_uniform, ps_str, funcs) {
	var prog = new Program();
	var vs_str =
		"gl_Position = vec4(vertexPosition.x, vertexPosition.y, 1.0, 1.0);" +
		"tCoord = vec2((vertexPosition.x + 1.0) / 2.0, (vertexPosition.y + 1.0) / 2.0);";
//		"tCoord = vec2((vertexPosition.x + 1.0) * 0.5, (vertexPosition.y + 1.0) * 0.5);";
	this.newProgramF(name, [["vec3", "vertexPosition"]], [],
		vs_str, [["vec2", "tCoord"]], ps_uniform, ps_str, funcs?[funcs]:[], []);
	this.setAttrib(name, "vertexPosition", makeSquare(this.gl));
};

Context.prototype.read = function (name, x, y, w, h) {
    var fb = null;
	if (name) {
		if (this.fbos[name]) fb = this.fbos[name].frameBuf;
		else if (this.physics[name]) fb = this.physics[name].current.frameBuf;
	}
  var dta = new Float32Array(w*h*4);
  var gl = this.gl;
  // debug1(""+fb);
	if (fb) gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.readPixels(x, y, w, h, gl.RGBA, gl.FLOAT, dta);
	if (fb) gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	return dta;
};

Context.prototype.readBytes = function (name, x, y, w, h) {
    var fb = null;
	if (name) {
		if (this.fbos[name]) fb = this.fbos[name].frameBuf;
		else if (this.physics[name]) fb = this.physics[name].current.frameBuf;
	}
  var dta = new Uint8Array(w*h*4);
  var gl = this.gl;
	if (fb) gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, dta);
	if (fb) gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	return dta;
};


