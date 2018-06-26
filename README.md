# vidmerger instructions
1) cd into root directory and run `npm install`
2) run `node server.js` and you should see the message *Running vidmerger!*
3) make a post request to `127.0.0.1:3000/merge` with `application/json` formatted post data with links specified as so:
```
{
	"token": "secret123",
	"links": [
		"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
		"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "etc..."
	]
}
```
and if you wish to have a remote link to the file add `"remote": 1` to the json object

4) After your request returns, the link will be under the 'link' field in the response body.
