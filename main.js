// npm i axios signalr
const axios = require('axios');
const ws = require('ws');




async function negotiate() {
	const hub = encodeURIComponent(JSON.stringify([{name:"Streaming"}]));
	const url = `https://livetiming.formula1.com/signalr/negotiate?connectionData=${hub}&clientProtocol=1.5`
	const resp = await axios.get(url);
	return resp;
}

async function connectwss(token, cookie) {
	const hub = encodeURIComponent(JSON.stringify([{name:"Streaming"}]));
	const encodedToken = encodeURIComponent(token);
	
	const url = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`
	const p = new Promise((res, rej) => {

		const sock = new ws.WebSocket(url, {headers: {
			'User-Agent': 'BestHTTP',
			'Accept-Encoding': 'gzip,identity',
			'Cookie': cookie
		}})

		sock.on('open', ev => {
			res(sock);
		});
		sock.on('message', (data) => {
			console.log('received %s', data);
		});
	});
	return p
}

async function main() {
	try {
		const resp = await negotiate();

		console.log(resp.data);
		console.log(resp.headers);
		const sock = await connectwss(resp.data['ConnectionToken'], resp.headers['set-cookie']);

		sock.send(JSON.stringify(
			{
				"H": "Streaming",
				"M": "Subscribe",
				"A": [["TimingData", "Heartbeat"]],
				"I": 1
			}
		));
	} catch(e) {
		console.error(e);
	}
}

main();
