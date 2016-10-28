const electron = require('electron');
const {remote,ipcRenderer} = electron;
const main = remote.require('./main.js');
const rita = require('rita');
const ristr = new RiString();
const rilex = new RiLexicon();
const rngs = {noun:[0,/^nn/],verb:[0,/^vb/],adjc:[0,/^jj/],advb:[0,/^rb/]};
const prev = main.valState();

rngs.noun[0] = document.getElementById('noun_rng').value = prev.noun;
document.getElementById('noun_odds').textContent = prev.noun != 0 ? prev.noun.toString().concat('0%') : '';
rngs.verb[0] = document.getElementById('verb_rng').value = prev.verb;
document.getElementById('verb_odds').textContent = prev.verb != 0 ? prev.verb.toString().concat('0%') : '';
rngs.adjc[0] = document.getElementById('adjc_rng').value = prev.adjc;
document.getElementById('adjc_odds').textContent = prev.adjc != 0 ? prev.adjc.toString().concat('0%') : '';
rngs.advb[0] = document.getElementById('advb_rng').value = prev.advb;
document.getElementById('advb_odds').textContent = prev.advb != 0 ? prev.advb.toString().concat('0%') : '';
document.getElementById('inp_fld').value = prev.inpfld;
document.getElementById('out_fld').innerHTML = prev.outfld;

let renderOut = () => {
	document.getElementById('out_fld').innerHTML = '';
	let cnt = 0;
	for(let par of document.getElementById('inp_fld').value.split('\n\n')) {
		ristr.text(par);
		let out = [];
		for (let i = 0; i < ristr.wordCount(); i++) {
			let wrd = ristr.wordAt(i);
			let rpl = '';
			let cap = false;
			let hit = false;
			let pos = ristr.posAt(i);
			for (let key of Object.keys(rngs)) {
				if (rngs[key][0] != 0 && rngs[key][1].test(pos)) {
					if (Math.ceil(Math.random() * 5) <= rngs[key][0]) {
						let syl = RiTa.getSyllables(wrd).split('/').length;
						rpl = rilex.randomWord(pos, syl);
						cap = /^[A-Z]/.test(wrd);
						out.push('<em class="' + key + '">' + (cap ? rpl.charAt(0).toUpperCase() + rpl.slice(1) : rpl) + '</em>');
						hit = true;
						cnt++;
					}
				}
			}
			if (!hit) {
				if (out.length && RiTa.isPunctuation(wrd)) {
					out[out.length - 1] = out[out.length - 1].concat(wrd);
				} else {
					out.push(wrd);
				}
			}
		}
		document.getElementById('out_fld').innerHTML = document.getElementById('out_fld').innerHTML.concat('<p>'+out.join(' ')+'</p>');
	}
	document.getElementById('chgs').textContent = cnt ? (cnt > 1 ? cnt.toString().concat(' changes') : cnt.toString().concat(' change')) : '';
	ipcUpd({inpfld:document.getElementById('inp_fld').value,outfld:document.getElementById('out_fld').innerHTML});
};

let cntUpd = () => {
	let cnt = RiTa.getWordCount(RiTa.stripPunctuation(document.getElementById('inp_fld').value));
	document.getElementById('words').textContent = cnt ? (cnt > 1 ? cnt.toString().concat(' words') : cnt.toString().concat(' word')) : '';
};

document.getElementById('noun_rng').addEventListener('change', (e) => {
	rngs.noun[0] = e.target.value;
	document.getElementById('noun_odds').textContent = e.target.value != 0 ? e.target.value.toString().concat('0%') : '';
	renderOut();
	ipcUpd({noun:e.target.value});
},false);
document.getElementById('verb_rng').addEventListener('change', (e) => {
	rngs.verb[0] = e.target.value;
	document.getElementById('verb_odds').textContent = e.target.value != 0 ? e.target.value.toString().concat('0%') : '';
	renderOut();
	ipcUpd({verb:e.target.value});
},false);
document.getElementById('adjc_rng').addEventListener('change', (e) => {
	rngs.adjc[0] = e.target.value;
	document.getElementById('adjc_odds').textContent = e.target.value != 0 ? e.target.value.toString().concat('0%') : '';
	renderOut();
	ipcUpd({adjc:e.target.value})
},false);
document.getElementById('advb_rng').addEventListener('change', (e) => {
	rngs.advb[0] = e.target.value;
	document.getElementById('advb_odds').textContent = e.target.value != 0 ? e.target.value.toString().concat('0%') : '';
	renderOut();
	ipcUpd({advb:e.target.value});
},false);

document.getElementById('inp_fld').addEventListener('input', (e) => {
	cntUpd();
	ipcUpd({inpfld:e.target.value});
},false);

document.getElementById('seed_btn').addEventListener('click', () => {
	document.getElementById('inp_fld').value = 'It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.';
	cntUpd();
},false);

document.getElementById('gen_btn').addEventListener('click', () => {
	renderOut();
},false);

document.getElementById('subwinbtn').addEventListener('click', () => {
	main.subWindow();
},false);

let ipcUpd = (itm) => {
	ipcRenderer.send('state',itm);
};