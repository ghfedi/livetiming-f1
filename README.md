# livetiming-f1
Negotiating a connection
To negotiate a connection, you do a GET request to the signalr endpoint with an appended /negotiate path. For the f1 signalr endpoint this looks like this:

https://livetiming.formula1.com/signalr/negotiate?connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D&clientProtocol=1.5
clientProtocol is hardcoded to 1.5.

connectionData is a urlencoded json object of the form:

[{"name": "Streaming"}]
where “Streaming” is the name of the hub we want to connect to. Currently only the streaming hub is known.

This’ll return a response with a bunch of data, like KeepAliveTimeout and LongPollDelay, but the only body value we’re interested in is the ConnectionToken. The rest probably serves a purpose but we won’t use them.

The headers contain a cookie we have to use to connect to the hub, so grab the Set-Cookie header value as well.

An example nodejs implementation for the negotiation looks as follows:


Websocket connection
Connecting
Once you have the data from the negotiation, you’ll need to build a websocket connection to the server. This happens over wss, The url is as follows:

wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=<sometoken>&connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D

Where clientProtocol again is always 1.5, connectionData is again the json stringified hub to connect to, and connectionToken is the urlencoded connection token you got from the negotiation. In addition, you’ll have to supply the following headers:

User-Agent: BestHTTP
Accept-Encoding: gzip,identity
Cookie: <cookie from negotiation>
NOTE: The headers are case sensitive for some reason, and the server will 500 if you pass in the wrong case. It’ll 400 if some required header is missing.




Invoking methods
If all went well, you should have a websocket connection with the signalr endpoint at this point, what’s left is to invoke the Subscribe method with the data you want to receive. This is done by sending a json message over the websocket connection with the following body:

{
	"H": "Streaming",
	"M": "Subscribe",
	"A": [["TimingData", "Heartbeat"]],
	"I": 1
}
NOTE: The “A” field really is an array of array of string.

The structure is as follows:

{
	H: The hub to invoke the method on
	M: The method to invoke
	A: The arguments to pass to the method
	I: Client side id for the request/response
}
For the f1 endpoint, hub is always Streaming, the method is always: Subscribe.

With the code above, this looks as follows:

sock.send(JSON.stringify(
	{
		"H": "Streaming",
		"M": "Subscribe",
		"A": [["TimingData", "Heartbeat"]],
		"I": 1
	}
));
For the subscribe method the following datastreams are available:

"Heartbeat", "CarData.z", "Position.z",
"ExtrapolatedClock", "TopThree", "RcmSeries",
"TimingStats", "TimingAppData",
"WeatherData", "TrackStatus", "DriverList",
"RaceControlMessages", "SessionInfo",
"SessionData", "LapCount", "TimingData"
After invoking the method, you should be seeing data coming back if there’s a session going on.
