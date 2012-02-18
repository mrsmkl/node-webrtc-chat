
function MultiSet() {
	this.items = {};
}

MultiSet.prototype.size = function () {
    var res = 0;
    this.iter(function (el,num) { res += num; });
    return res;
};

MultiSet.prototype.contract = function (f) {
    var res = new MultiSet();
    this.iter(function (k,n) { res.add(f(k), n); });
    return res;
};

MultiSet.prototype.push = function (str, el) {
    var v = this.getValue(str) || [];
    v.push(el);
    this.set(str, v);
};

MultiSet.prototype.setList = function (str, num, el) {
    var v = this.getValue(str) || [];
    v[num] = el;
    this.set(str, v);
};

MultiSet.prototype.add = function (str, inc) {
	inc = inc == 0 ? 0 : (inc || 1);
	if (this.items["@"+str]) this.items["@"+str] += inc;
	else this.items["@"+str] = inc;
};

MultiSet.prototype.set = function (str, inc) {
	this.items["@"+str] = inc;
};

MultiSet.prototype.get = function (str) {
    if (this.items["@"+str] != undefined) return this.items["@"+str];
    else return 0;
};

MultiSet.prototype.getValue = function (str, def) {
    if (this.items["@"+str] != undefined) return this.items["@"+str];
    else if (def) {
        var res = def();
        this.items["@"+str] = res;
        return res;
    }
};

MultiSet.prototype.remove = function (str) {
	if (this.items["@"+str]) this.items["@"+str] = 0;
};

MultiSet.prototype.iter = function (f) {
    for (var i in this.items) {
    	if (this.items[i] != 0) f(i.substr(1), this.items[i]);
	}
};

MultiSet.prototype.iterAll = function (f) {
    for (var i in this.items) f(i.substr(1), this.items[i]);
};

MultiSet.prototype.copy = function () {
	var res = new MultiSet();
	this.iter(function (a,b) { res.add(a,JSON.parse(JSON.stringify(b))); });
	return res;
};

MultiSet.prototype.print = function (lim) {
	var lst = [];
	this.iter(function (a,b) { lst.push([a,b]); });
	lst.sort(function (x,y) { return x[1] - y[1]; });
	lst.forEach(function (el) { if (el[1] > lim) console.log(el[0] + ": " + el[1]); });
};

MultiSet.prototype.list = function () {
    var lst = [];
	this.iter(function (a,b) { lst.push([a,b]); });
	lst.sort(function (x,y) { return y[1] - x[1]; });
	return lst;
};

MultiSet.prototype.keys = function () {
    var lst = [];
	this.iter(function (a,b) { lst.push(a); });
	return lst;
};

MultiSet.fromList = function (lst) {
	var res = new MultiSet();
	for (var i in lst) res.add(lst[i]);
	return res;
};

MultiSet.prototype.addList = function (lst) {
    for (var i in lst) this.add(lst[i]);
};

MultiSet.prototype.addMS = function (lst, scale) {
    if (!lst) return;
    scale = scale || 1;
    var self = this;
    lst.iter(function (el,num) { self.add(el, num*scale); });
};

MultiSet.fromPairs = function (lst) {
    var res = new MultiSet();
	for (var i in lst) res.add(lst[i][0], lst[i][1]);
	return res;
};

MultiSet.scale = function (st, scale) {
    var res = new MultiSet();
    st.iter(function (el, x) { res.add(el, x*scale); });
    return res;
};

MultiSet.add = function (a, b) {
    var res = new MultiSet();
    a.iter(function (el, x) { res.add(el, x); });
    b.iter(function (el, x) { res.add(el, x); });
    return res;
};

exports.MultiSet = MultiSet;

// Multiset as a completion tool

MultiSet.prototype.findBest = function (str) {
	var regex = new RegExp("^" + str);
	var found = null;
	var v = 0;
	this.iter(function (el, num) { 
		var nv = (el.length - str.length) * num;
		if (nv > v && el.match(regex)) {
			found = el;
			v = nv;
		}
	});
	return found;
};

function reverseCase(str) {
	if (str == str.toLowerCase()) return str.toUpperCase();
	else return str.toLowerCase();
}

exports.reverseCase = reverseCase;

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
letters += letters.toLowerCase();

MultiSet.prototype.count = function (regex) {
	var count = 0;
	this.iter(function (el, num) {
			if (el.match(regex)) count += num;
	});
	return count;
};

MultiSet.prototype.capComplete = function (o_str) {
	var res = new MultiSet();
	for (var i = 0; i < letters.length; i++) {
		var str = o_str + letters[i];
		var best = this.findBest(str);
		if (!best || best.length == str.length) continue;
		var good = this.count(new RegExp("^" + best)) * (best.length - str.length);
		var bad = this.count(new RegExp("^" + o_str + reverseCase(letters[i])));
		if (good > bad) res.add(best, good - bad);
	}
	return res;
};

MultiSet.prototype.canComplete = function (o_str, ch) {
	var str = o_str + ch;
	var best = this.findBest(str);
	if (!best || best.length == str.length) return false;
	var good = this.count(new RegExp("^" + best)) * (best.length - str.length);
	var bad = this.count(new RegExp("^" + o_str + reverseCase(ch)));
	return (good > bad);
};

MultiSet.prototype.pack = function (str) {
	var res = "";
	for (var i = 0; i < str.length; i++) {
		var o_str = str.substr(0,i);
		if (this.canComplete(o_str, str[i])) {
			var best = this.findBest(o_str + str[i]);
			if (best == str) return res + reverseCase(str[i]);
		}
		if (this.canComplete(o_str, reverseCase(str[i]))) res += "§";
		res += str[i];
	}
	return res;
};

MultiSet.prototype.packPrefix = function (str, prefix) {
	var res = prefix;
	for (var i = prefix.length; i < str.length; i++) {
		var o_str = str.substr(0,i);
		if (this.canComplete(o_str, str[i])) {
			var best = this.findBest(o_str + str[i]);
			if (best == str) return res + reverseCase(str[i]);
		}
		if (this.canComplete(o_str, reverseCase(str[i]))) res += "§";
		res += str[i];
	}
	return res;
};

MultiSet.prototype.complexity = function () {
	var res = 0;
	this.iter(function (str,num) { res += str.length + 1; });
	return res;
};


