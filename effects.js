
var helper = require("./gl-helper");
var matrix = require("./matrix");
var shaders = require("./shaders");
var shapes = require("./shapes");

var Program = helper.Program;
var Matrix = matrix.Matrix;
var $V = matrix.$V;

var effect_names = ["Normal", "Mirror", "Blend", "Detect edges", "Edges and color", "Blur", "Distort", "Ruudut", "Pyöri", "Valotus", "Green", "Red", "Movement", "Glow"];

function effectDiv(name) {
    var str = '<div id ="' + name + '_effect" style="position:absolute; top:20px; left: 40px; opacity:0.5;">';
    effect_names.forEach(function (el, i) {
        var id = name + '_effect_' + i;
        var checked = i == 0 ? "checked" : "";
        str += '<input id="' + id + '" type="radio" name="' + name + '_sel" value="' + el + '" ' + checked + ' /><label for="' + id + '">' + el + '</label>';
    });
    str += '</div>';
    return str;
}

function setupPrograms(ctx) {
    ctx.textureProgram("Edges and color",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float","w"], ["float","h"]],
    	"float px = 1.0 / w;" +
    	"float py = 1.0 / h;" +
    	"vec4 c1 = texture2D(tex1, vec2(tCoord.s, tCoord.t));" +
    	"vec4 c2 = texture2D(tex1, vec2(tCoord.s + px, tCoord.t));" +
    	"vec4 c3 = texture2D(tex1, vec2(tCoord.s, tCoord.t - py));" +
    	"vec4 c4 = texture2D(tex1, vec2(tCoord.s - px, tCoord.t));" +
    	"vec4 c5 = texture2D(tex1, vec2(tCoord.s, tCoord.t + py));" +
    	"vec4 c2b = texture2D(tex1, vec2(tCoord.s + px*2.0, tCoord.t ));" +
    	"vec4 c3b = texture2D(tex1, vec2(tCoord.s, tCoord.t - py*2.0));" +
    	"vec4 c4b = texture2D(tex1, vec2(tCoord.s - px*2.0, tCoord.t));" +
    	"vec4 c5b = texture2D(tex1, vec2(tCoord.s, tCoord.t + py*2.0));" +
      "vec4 c = abs(c2 + c2b  - c4 - c4b) + abs(c3 + c3b - c5 - c5b);" +
      "vec4 avg = 0.2 * (c2 + c4 + c3 + c5 + c);" +
      "float x = c.r + c.g + c.b;" +
      "if (x > 25e-2) gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);" +
      "else gl_FragColor = vec4(avg.r, avg.g, avg.b, 1.0);"); 

    ctx.textureProgram("Distort",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float", "ratio"], ["float","x"]],
        "float t = (1.0 / (abs(tCoord.t - 0.5) + 0.01)) * 2.0;" +
        // "float t = max(0.0, (0.2 - abs(tCoord.t - 0.5)) * 2.0);" +
        "vec4 c1 = texture2D(tex1, vec2(tCoord.s+t*0.001*sin(t)*max(0.0,sin(x*1000.0))*max(0.0,sin(x*30.0)), tCoord.t));" +
        "gl_FragColor = c1;");

    ctx.textureProgram("Ruudut",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float", "ratio"], ["float","x"]],
        "gl_FragColor = texture2D(tex1, mod(sin(x)*10.0*(tCoord-vec2(0.5,0.5))+vec2(0.5, 0.5), 1.0));");

    /* ctx.textureProgram("Glow",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float", "ratio"], ["float","x"]],
        "float xx = sin(x*20.0) + sin(x*30.0);" +
        "float yy = sin(x*10.0) + sin(x*40.0);" +
        "vec2 p1 = vec2(0.5+0.5*xx, 0.5+0.5*yy);" +
        "vec2 p2 = tCoord;" +
        "vec2 v = p1 - p2;" +
          "float p = 1.0 / ((sin(x*100.0)+2.0) * 10.0 * length(v));" +
	    "gl_FragColor = vec4(vec3(1.0,0.5,0.1)*p + texture2D(tex1, tCoord).rgb, 1.0);");
       */

    ctx.textureProgram("Glow",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float", "ratio"], ["float","x"], ["float", "y"]],
        "float xx = sin(x*20.0) + sin(x*30.0);" +
        "float yy = sin(x*10.0) + sin(x*40.0);" +
        "vec2 p1 = vec2(x, y);" +
        "vec2 p2 = tCoord;" +
        "vec2 v = p1 - p2;" +
          "float p = 1.0 / ((sin(x*100.0)+2.0) * 10.0 * length(v));" +
	    "gl_FragColor = vec4(vec3(1.0,0.5,0.1)*p + texture2D(tex1, vec2(1.0-tCoord.s, tCoord.t)).rgb, 1.0);");
        
    ctx.textureProgram("Pyöri",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float", "ratio"], ["float","x"], ["float", "w"], ["float", "h"]],
        "vec2 c = (tCoord-vec2(0.5,0.5))*vec2(w,h);" +
        "float y = 10.0*x;" +
        "mat2 rot = mat2(cos(y), -sin(y), sin(y), cos(y));" +
        "gl_FragColor = texture2D(tex1, mod((rot*c/vec2(w,h))+vec2(0.5,0.5), 1.0));");
//        "gl_FragColor = texture2D(tex1, mod(sin(x)*10.0*tCoord-0.5,1.0));");

    ctx.textureProgram("Detect edges",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float","w"], ["float","h"]],
        "float px = 1.0 / w;" +
    	"float py = 1.0 / h;" +
    	"vec4 c1 = texture2D(tex1, vec2(tCoord.s, tCoord.t));" +
    	"vec4 c2 = texture2D(tex1, vec2(tCoord.s + px, tCoord.t ));" +
    	"vec4 c3 = texture2D(tex1, vec2(tCoord.s, tCoord.t - py));" +
    	"vec4 c4 = texture2D(tex1, vec2(tCoord.s - px, tCoord.t));" +
    	"vec4 c5 = texture2D(tex1, vec2(tCoord.s, tCoord.t + py));" +
    	"vec4 c2b = texture2D(tex1, vec2(tCoord.s + px*2.0, tCoord.t ));" +
    	"vec4 c3b = texture2D(tex1, vec2(tCoord.s, tCoord.t - py*2.0));" +
    	"vec4 c4b = texture2D(tex1, vec2(tCoord.s - px*2.0, tCoord.t));" +
    	"vec4 c5b = texture2D(tex1, vec2(tCoord.s, tCoord.t + py*2.0));" +
      "vec4 c = abs(c2 + c2b  - c4 - c4b) + abs(c3 + c3b - c5 - c5b);" +
      "float x = c.r + c.g + c.b;" +
      "if (x > 2e-1) gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);" +
      "else gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);"); 

    ctx.textureProgram("edges",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float","w"], ["float","h"]],
        "float px = 1.0 / w;" +
    	"float py = 1.0 / h;" +
    	"const int sz = 4;" +
    	"float acc = 0.0;" +
    	"for (int i = 0; i < sz; i++) {" +
    	"  vec4 col = texture2D(tex1, vec2(tCoord.s + px*float(i), tCoord.t));" +
    	"  float intensity = col.r + col.g + col.b; " +
    	"  acc += intensity;" +
    	"}" +
    	"for (int i = 0; i < sz; i++) {" +
    	"  vec4 col = texture2D(tex1, vec2(tCoord.s - px*float(i), tCoord.t));" +
    	"  float intensity = col.r + col.g + col.b; " +
    	"  acc += intensity;" +
    	"}" +
    	"for (int i = 0; i < sz; i++) {" +
    	"  vec4 col = texture2D(tex1, vec2(tCoord.s, tCoord.t + py*float(i)));" +
    	"  float intensity = col.r + col.g + col.b; " +
    	"  acc += intensity;" +
    	"}" +
    	"for (int i = 0; i < sz; i++) {" +
    	"  vec4 col = texture2D(tex1, vec2(tCoord.s, tCoord.t - py*float(i)));" +
    	"  float intensity = col.r + col.g + col.b; " +
    	"  acc += intensity;" +
    	"}" +
    	"vec4 col = texture2D(tex1, vec2(tCoord.s, tCoord.t));" +
        "float intensity = (col.r + col.g + col.b) * float(sz * 4);" +
        "float x = intensity - acc;" +
        "gl_FragColor = vec4(x,x,x,1.0);");

    ctx.textureProgram("Normal",
        [["sampler2D", "tex1"]],
        "vec4 c1 = texture2D(tex1, vec2(tCoord.s, tCoord.t));" +
        "gl_FragColor = vec4(c1.r, c1.g, c1.b, 1.0);"); 

    ctx.textureProgram("Mirror",
        [["sampler2D", "tex1"]],
        "gl_FragColor = texture2D(tex1, vec2(1.0-tCoord.s, tCoord.t));");

    ctx.textureProgram("Green",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["sampler2D", "avg"], ["float", "x"]],
        "vec4 c = texture2D(avg, tCoord);" +
        "vec4 c2 = texture2D(tex2, tCoord);" +
        "vec4 c_new = texture2D(tex1, tCoord);" +
        "float diff = distance(c, c_new);" +
//        "gl_FragColor = diff > 0.1 ? c_new : vec4(0.0,0.0,0.0,1.0);");
//        "gl_FragColor = mix(vec4(0.0,0.0,1.0,1.0), c_new, diff);");
        "gl_FragColor = vec4(c.rgb + vec3(0.0, diff, 0.0), 1.0);"); 

    ctx.textureProgram("Red",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["sampler2D", "avg"], ["float", "x"]],
        "vec4 c = texture2D(tex1, tCoord);" +
        "gl_FragColor = vec4(c.r > 0.75 ? 1.0 : 0.0, c.g < 0.5 ? 1.0 : 0.0, c.b < 0.5 ? 1.0 : 0.0, 1.0);");
//        "gl_FragColor = vec4(pow(c.r,10.0)-(c.b+c.g)*0.6, 0.0, 0.0, 1.0);");

    ctx.textureProgram("Alter",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float", "x"]],
        "vec4 c = texture2D(tex1, tCoord);" +
        "float k = sin(x*200.0);" +
//        "gl_FragColor = (length(c.rgb)*40.0 > 1.0) ? texture2D(tex2, tCoord) : (vec4(k > 0.0 ? 1.0 : 0.0, k < 0.0 ? 1.0 : 0.0, length(c.rgb)*10.0, 1.0));");
// ANGLE BUG???
//        "if (length(c.rgb)*10.0 > 1.0) gl_FragColor = texture2D(tex2, tCoord);" +
//        "else gl_FragColor = vec4(k > 0.0 ? 1.0 : 0.0, k < 0.0 ? 1.0 : 0.0, length(c.rgb)*10.0, 1.0);");
        "gl_FragColor = vec4(k > 0.0 ? 1.0 : 0.0, k < 0.0 ? 1.0 : 0.0, length(c.rgb)*10.0, 1.0);");

    ctx.textureProgram("Blend",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"]],
        "vec4 c1 = texture2D(tex1, tCoord);" +
        "vec4 c2 = texture2D(tex2, tCoord);" +
        "gl_FragColor = 3e-1*c2 + 7e-1*vec4(c1.r, c1.g, c1.b, 1.0);"); 
    
    ctx.textureProgram("Sum",
        [["sampler2D", "tex1"]],
        "float res_x = 0.0;" +
        "float res_y = 0.0;" +
        "for (float x = 0.0; x < 1.0; x += 0.01) { float v = texture2D(tex1, vec2(x, tCoord.t)).r; res_x += v*v; }" +
        "for (float y = 0.0; y < 1.0; y += 0.01) { float v = texture2D(tex1, vec2(1.0-tCoord.s, y)).r; res_y += v*v; }" +
        "gl_FragColor = vec4(res_x/10.0, res_y/10.0, 0.0, 1.0);"
    );

    ctx.textureProgram("Blur",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float", "v"]],
    	"vec4 c1 = texture2D(tex1, vec2(tCoord.s, tCoord.t));" +
    	"vec4 c2 = texture2D(tex2, tCoord);" +
        "gl_FragColor = (1.0-v)*c2 + v*c1;"); 

    ctx.textureProgram("Movement",
        [["sampler2D", "tex1"], ["sampler2D", "prev"], ["float", "v"]],
    	"vec4 c1 = texture2D(tex1, tCoord);" +
    	"vec4 c2 = texture2D(prev, tCoord);" +
        "gl_FragColor = vec4(distance(c1,c2), 0.0, 0.0, 1.0);"); 

    ctx.textureProgram("box",
        [["sampler2D", "tex1"], ["sampler2D", "tex2"], ["float","w"], ["float","h"]],
        "float px = 1.0 / w;" +
    	"float py = 1.0 / h;" +
    	"const int sz = 4;" +
    	"vec4 acc = vec4(0.0,0.0,0.0,0.0);" +
    	"for (int i = -sz+1; i < sz; i++) {" +
    	"  for (int j = -sz+1; j < sz; j++) {" +
    	"    acc += texture2D(tex1, vec2(tCoord.s + px*float(i), tCoord.t + py*float(j)));" +
    	"} }" +
      "gl_FragColor = (1.0/float(sz*sz))*acc;"); 

}

function Viewer(elem) {
    var self = this;
    
    this.name = elem.id || ("moo"+Math.random());
    this.source = $(elem).find("video")[0];
    this.target = $(elem).find("canvas")[0];
    
    this.w = 720;
    this.h = 480;

    var gl = helper.initGL(this.target);
    if (gl) {
        
        $(elem).append(effectDiv(this.name));
        $("#" + this.name + "_effect").buttonset();
        
        this.target.onclick = function () { $("#" + self.name + "_effect").toggle(); };

        gl.clearDepth(1.0);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.disable(gl.DEPTH_TEST);
        if (!gl.getExtension("OES_texture_float")) console.log("Needs float textures");
    
        var ctx = new helper.Context(gl);
        setupPrograms(ctx);

        ctx.newTexture("earth", "gl/earth.jpg");
        ctx.newTexture("galvanized", "gl/galvanized.jpg");
        
        this.gl = gl;
        this.ctx = ctx;
        this.x = this.time = 0;
        this.resize(this.w, this.h);
        this.interval = setInterval(function () { self.update(); }, 50);
    }
    else {
        $(this.source).show();
        $(this.target).hide();
    }
}

Viewer.prototype.close = function () {
    if (this.interval) clearInterval(this.interval);
};

function Integrator(ctx, w, h, name, num) {
    this.num = num;
    this.x = 0;
    this.ctx = ctx;
    this.name = name;
    this.ctx.newFBOFloat(name + "0", w, h, null);
    this.ctx.newFBOFloat(name + "1", w, h, null);
    this.ctx.newFBO(name + "_store", w, h, null);
}

Integrator.prototype.add = function (name) {
    this.x++;
    var avg_tex = this.name + this.x%2;
    this.ctx.drawFBO(avg_tex, this.ctx.gl.TRIANGLES, "Blur", [], [], [["tex1", this.name + "_store"], ["tex2", this.name+((this.x+1)%2)], ["v", 1.0/Math.min(this.num, this.x+1)]]);
};

Integrator.prototype.current = function () {
    return this.name + this.x%2;
};

Integrator.prototype.store = function () {
    return this.name + "_store";
};

Viewer.prototype.resize = function (w, h) {
    console.log("Resizing ...");
    if (this.gl) {
        this.target.width = w;
        this.target.height = h;
        this.w = w;
        this.h = h;
        this.gl.viewportWidth = w;
        this.gl.viewportHeight = h;
        this.ctx.newFBO("blur0", this.w, this.h, null);
        this.ctx.newFBO("blur1", this.w, this.h, null);
        this.ctx.newFBOFloat("avg0", this.w, this.h, null);
        this.ctx.newFBOFloat("avg1", this.w, this.h, null);
        this.ctx.newFBO("prev", this.w, this.h, null);
        this.x = 0;
        
        this.move = new Integrator(this.ctx, this.w, this.h, "move", 3);
    }
    else {
        this.source.width = w;
        this.source.height = h;
    }
};

exports.Viewer = Viewer;

Viewer.prototype.getRadio = function () {
    var elems = document.getElementsByName(this.name + "_sel");
    for (var i in elems) {
        if (elems[i].checked) return elems[i].value;
	}
};

Viewer.prototype.update = function () {
    helper.updateVideoTexture(this.ctx, this.source.id);
    this.doDraw();
};

function avg(lst) {
    var res = 0;
    var total = 0;
    lst.forEach(function (x,i) { if (x > 0.05) { res += x*i; total += x; } });
    return res / total;
}

function sum(lst) {
    var total = 0;
    lst.forEach(function (x,i) { if (x > 0.05) { total += x; } })
    return total/lst.length;
}

function force(lst, orig) {
    var res = 0;
    var total = 0;
    lst.forEach(function (x,i) { if (x > 0.05) { res += x*i; total += x; } })
    return ((res / total) - orig) * total/lst.length;
}

function force2D(lst_x, lst_y, orig_x, orig_y) {
    var x = avg(lst_x);
    var y = avg(lst_y);
    var c = sum(lst_x) + sum(lst_y);
    return {x: (x-orig_x) * c, y: (y-orig_y) * c};
}

Viewer.prototype.doDraw = function () {
	var mode = this.getRadio();
    var ctx = this.ctx;
    var gl = this.gl;
    this.time += 0.004;
    var avg_tex = "avg" + (this.x+1)%2;
    ctx.drawFBO(avg_tex, gl.TRIANGLES, "Blur", [], [],
        [["tex1", this.source.id], ["tex2", "avg"+(this.x%2)], ["w", this.w], ["h", this.h], ["v", 1.0/Math.min(1000, this.x+1)]]);
    ctx.drawFBO(this.move.store(), gl.TRIANGLES, "Movement", [], [], [["tex1", this.source.id], ["tex2", "galvanized"], ["prev", "prev"]]);
    this.move.add();
	if (mode == "Blur") {
		if (this.x % 2 == 0) {
    		ctx.drawFBO("blur1", gl.TRIANGLES, "Blur", [], [], [["tex1", this.source.id], ["tex2", "blur0"], ["w", this.w], ["h", this.h], ["v", 0.1]]);
			ctx.draw(gl.TRIANGLES, "Normal", [], [], [["tex1", "blur1"], ["tex2", "galvanized"]]);
		}
		else {
			ctx.drawFBO("blur0", gl.TRIANGLES, "Blur", [], [], [["tex1", this.source.id], ["tex2", "blur1"], ["w", this.w], ["h", this.h], ["v", 0.1]]);
        	ctx.draw(gl.TRIANGLES, "Normal", [], [], [["tex1", "blur0"], ["tex2", "galvanized"]]);
		}
	}
    else if (mode == "Valotus") {
    	ctx.draw(gl.TRIANGLES, "Normal", [], [], [["tex1", "avg" + (1 + this.x)%2], ["tex2", "galvanized"], ["w", this.w], ["h", this.h]]);
    }
	else if (mode == "Detect edges") {
    	ctx.draw(gl.TRIANGLES, mode, [], [], [["tex1", this.source.id], ["tex2", "galvanized"], ["w", this.w], ["h", this.h]]);
	}
    else if (mode == "Movement" || mode == "Glow") {
    	ctx.drawFBO("blur0", gl.TRIANGLES, "Sum", [], [], [["tex1", this.move.current()], ["tex2", this.source.id], ["x", this.time]]);
        // Read pixels
        var hor = ctx.readBytes("blur0", 0, 0, this.w, 1);
        var vert = ctx.readBytes("blur0", 0, 0, 1, this.h);
        var h_lst = [];
        var v_lst = [];
        for (var i = 0; i < this.w; i++) h_lst.push(hor[i*4+1] / 255);
        for (var i = 0; i < this.h; i++) v_lst.push(vert[i*4] / 255);
        var x = avg(h_lst);
        var y = avg(v_lst);
        // console.log("X: " + x  + " Y: " + y);
            this.speedy = this.speedy || 0;
            this.locy = this.locy || this.h/2;
            this.speedx = this.speedx || 0;
            this.locx = this.locx || this.w/2;
        if (isNaN(y) && !isNan(x)) {
            this.speedx += force(h_lst, this.locx);
        }
        if (isNaN(x) && !isNaN(y)) {
            this.speedy += force(v_lst, this.locy);
            // console.log("speed: " + this.speedy);
        }
        if (!isNaN(x) && !isNaN(y)) {
            var f = force2D(h_lst, v_lst, this.locx, this.locy);
            this.speedy += f.y || 0;
            this.speedx += f.x || 0;
            // console.log("speed: " + this.speedy);
        }
            this.locx += this.speedx;
            this.speedx = 0.9 * this.speedx;
            this.locy += this.speedy;
            this.speedy = 0.9 * this.speedy;
        /*
        var elem = $("#blib").show()[0];
        elem.style.bottom = this.locy;
        elem.style.left = this.locx;
        */
        if (mode == "Glow") {
            ctx.draw(gl.TRIANGLES, "Glow", [], [], [["tex1", this.source.id], ["tex2", "galvanized"], ["avg", avg_tex], ["x", this.locx/this.w], ["y", this.locy/this.h],
                                        ["w", this.w], ["h", this.h], ["prev", "prev"]]);
        }
        else ctx.draw(gl.TRIANGLES, "Normal", [], [], [["tex1", "blur0"]]);
    }
	else {
        ctx.draw(gl.TRIANGLES, mode, [], [], [["tex1", this.source.id], ["tex2", "galvanized"], ["avg", avg_tex], ["x", this.time], ["w", this.w], ["h", this.h], ["prev", "prev"]]);
	}
    ctx.drawFBO("prev", gl.TRIANGLES, "Normal", [], [], [["tex1", this.source.id]]);
    this.x++;
}


