const electron = require('electron');
const {app,ipcMain,BrowserWindow,Menu} = electron;
const state = require('./state');
const uxvals = {ctl:{
	noun:0,
	verb:0,
	adjc:0,
	advb:0,
	inpfld:'',
	outfld:''
	},win:{
	x:0,
	y:0,
	wdt:840,
	hgt:840,
	max:false
}};
let win,prefWindow;

const template = [
	{
		label:'Edit',
		submenu:[
			{role:'undo'},
			{role:'redo'},
			{type:'separator'},
			{role:'cut'},
			{role:'copy'},
			{role:'paste'},
			{role:'pasteandmatchstyle'},
			{role:'delete'},
			{role:'selectall'},
		]
	},
	{
		label:'Custom',
		submenu:[
			{label:'This One'},
			{label:'That One'},
			{label:'Another (3rd)'}
		]
	},
	{
		label:'View',
		submenu:[
			{
				label:'Reload',
				accelerator: 'CmdOrCtrl+R',
				click(item,focusedWindow){if(focusedWindow)focusedWindow.reload();}
			},
			{role:'togglefullscreen'},
			{
				label:'Toggle Developer Tools',
				accelerator:process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
				click(item,focusedWindow){if(focusedWindow)focusedWindow.webContents.toggleDevTools();}
			}
		]
	},
	{
		role:'window',
		submenu:[
			{role:'minimize'},
			{role:'close'},
		]
	},
	{
		role:'help',
		submenu:[
			{
				label:'Learn More',
				click(){require('electron').shell.openExternal('http://electron.atom.io');}
			}
		]
	}
];

if(process.platform === 'darwin'){
	const name = app.getName();
	template.unshift({
		label:name,
		submenu:[
			{role:'about'},
			{type:'separator'},
			{
				label:'Preferences...',
				accelerator:'CmdOrCtrl+,',
				click(){
					if(prefWin) {
						prefWin.isVisible() ? prefWin.hide() : prefWin.show();
					} else {
						prefGen();
						prefWin.show();
					}
				}
			},
			{type:'separator'},
			{
				role:'services',
				submenu:[]
			},
			{type:'separator'},
			{role:'hide'},
			{role:'hideothers'},
			{role:'unhide'},
			{type:'separator'},
			{role:'quit'}
		]
	});
	// Window menu ...
	template[3].submenu = [
		{
			label:'Close',
			accelerator:'CmdOrCtrl+W',
			role:'close'
		},
		{
			label:'Minimize',
			accelerator:'CmdOrCtrl+M',
			role:'minimize'
		},
		{
			label:'Zoom',
			role:'zoom'
		},
		{type:'separator'},
		{
			label:'Bring All to Front',
			role:'front'
		}
	];
}

let prefGen = () => {
	prefWin = new BrowserWindow({
		width:400,
		height:400,
		show:false
	});
	prefWin.loadURL(`file://${__dirname}/../prefs.html`);
	prefWin.on('closed',() => {
		prefWin = null;
	});
};

let setup = () => {
	prefGen();
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
	let prevState = state.get('prevState');
	if(prevState === null){
		prevState = uxvals;
	}
	win = new BrowserWindow({
		x:prevState.win.x,
		y:prevState.win.y,
		width:prevState.win.wdt,
		height:prevState.win.hgt
	});
	if(prevState.win.max){
		win.maximize();
	}
	Object.keys(prevState.ctl).forEach((key) => {
		uxvals.ctl[key] = prevState.ctl[key];
	});
	win.loadURL(`file://${__dirname}/../index.html`);
//	win.webContents.openDevTools();
	win.on('close', (e) => {
		let bounds = win.getBounds();
		uxvals.win = {
			x:bounds.x,
			y:bounds.y,
			wdt:bounds.width,
			hgt:bounds.height,
			max:win.isMaximized()
		};
		state.set('prevState',uxvals);
	});
	win.on('closed', () => {
		win = null;
	});
};

app.on('ready',setup);
app.on('window-all-closed',() => {
	if(process.platform !== 'darwin'){
		app.quit();
	}
});
app.on('activate', () => {
	if(win === null){
		setup();
	}
});

ipcMain.on('state', (evt,arg) => {
	Object.keys(arg).forEach((key) => {
		uxvals.ctl[key] = arg[key];
	});
});

exports.subWindow = () => {
	let sub = new BrowserWindow({
		width:400,
		height:200
	});
	sub.loadURL(`file://${__dirname}/../subwin.html`)
};

exports.valState = () => {
	return uxvals.ctl;
};