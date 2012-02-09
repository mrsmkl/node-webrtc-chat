
// document.compatMode=='CSS1Compat'

/* Return the text of the specified url, script element or file */
function gettext(url) {
		var req = new XMLHttpRequest();
		req.open("GET", url, false);             // Note synchronous get
		req.send(null);
		if (req.status && req.status != 200) throw req.statusText;
		return req.responseText;
}

function makeFileName(id) {
    if (id.substring(0,2) == "./" || id.substring(0,3) == "../")
        id = normalize(my_require._current_module_dir, id);

    // Now resolve the toplevel id relative to require.dir
    return  my_require.dir + id + ".js";

    function normalize(dir, file) {
        for(;;) {
            if (file.substring(0,2) == "./")
                file = file.substring(2);
            else if (file.substring(0,3) == "../") {
                file = file.substring(3);
                dir = up(dir);
            }
            else break;
        }
        return dir+file;
        
        function up(dir) { // Return the parent directory of dir
            if (dir == "") throw "Can't go up from ''";
            if (dir.charAt(dir.length-1) != "/") throw "dir doesn't end in /";
            return dir.substring(0, dir.lastIndexOf('/', dir.length-2)+1);
        }
    }
}

/*
 * An implementation of the CommonJS Modules 1.0
 * Copyright (c) 2009 by David Flanagan
 */
var require = function require(id, str) {
    if (id[0] != ".") id = "./" + id;
    var origid = id;
    var filename = makeFileName(id);
    
    // throw ("File: " + filename + " from " + id);
    // console.log("File: " + filename + " from " + id);

    // Only load the module if it is not already cached.
    if (!my_require._cache.hasOwnProperty(filename)) {

        // Remember the directory we're loading this module from
        var olddir = my_require._current_module_dir;
        my_require._current_module_dir = filename.substring(1, filename.lastIndexOf('/')+1);
        // console.log("Entered directory " + my_require._current_module_dir);
        try {
            // Load the text of the module
            var text = str || gettext(filename);
            var modtext = text + "\n//@ sourceURL=" + filename;
            // Wrap it in a function
            var f = new Function("require", "exports", "module", modtext);
            // Prepare function arguments
            var context = {};                            // Invoke on empty obj
            var exports = my_require._cache[filename] = {}; // API goes here
            var module = { id: id, uri: filename };      // For Modules 1.1
            f.call(context, require, exports, module);   // Execute the module
        }
        catch(x) {
            throw new Error("Can't load module " + origid + ": " + x);
        }
        finally { // Restore the directory we saved above
            my_require._current_module_dir = olddir;
        }
    }
    // console.log("Loaded " + filename);
    return my_require._cache[filename];  // Return the module API from the cache

};

var my_require = require;

function rerequire(fn, str) {
    delete my_require._cache[makeFileName(fn)];
    return my_require(fn, str);
}

function define(name, lst, md) {
	var exports = {};
	md(require, exports, name);
	my_require._cache["/" + name + ".js"] = exports;
}

// Set require.dir to point to the directory from which modules should be
// loaded.  It must be an empty string or a string that ends with "/".
// require.dir = "/";
// require.dir = document.location.pathname.match(/.*\//g);

if (typeof importScripts == "function") {
    // require.dir = "./";
    // require.dir = location.pathname.match(/.*\//g);
    require.dir = "/";
    require._current_module_dir = "./." + location.pathname.match(/.*\//g);
}
else {
    // require.dir = document.location.pathname.match(/.*\//g);
    // require._current_module_dir = "./";
    require.dir = "/";
    require._current_module_dir = "./." + document.location.pathname.match(/.*\//g);
}

// require.dir = "/workspace/site/";
require._cache = {};               // So we only load modules once

