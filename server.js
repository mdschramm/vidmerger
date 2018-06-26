const express = require('express'),
      bodyParser = require('body-parser'),
      fluentFfmpeg = require('fluent-ffmpeg'),
      fs = require('fs');


// https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
const app = express();
app.use( bodyParser.json() );
//

let handleMerge = (res, links ) => {
    let mergedVideo = fluentFfmpeg();
    // https://stackoverflow.com/questions/28877848/merge-multiple-videos-using-node-fluent-ffmpeg
    links.forEach(name => {
        mergedVideo.addInput(name);
    });
    mergedVideo.mergeToFile('./mergedVideo.mp4', './tmp/');
    //
    res.status(200).json({response: 200});
};

let home = (req, res) => {
    fs.readFile('index.html', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
};

app.get('/', home);
//https://medium.com/@daspinola/video-stream-with-node-js-and-html5-320b3191a6b6
app.get('/video', (req, res) => {
    const path = 'mergedVideo.mp4';
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start)+1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res)
    }
});
//

app.post('/merge', (req, res) => {
    return handleMerge(res, req.body.links);
});


app.listen(3000, () => console.log('Running vidmerger!'));