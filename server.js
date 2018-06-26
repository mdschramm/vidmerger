const express = require('express'),
    bodyParser = require('body-parser'),
    fluentFfmpeg = require('fluent-ffmpeg'),
    fs = require('fs'),
    Storage = require('@google-cloud/storage'),
    projectId = 'vidmerger-1530039402349',
    bucketName = 'vidmerger',
    fName = 'mergedVideo.mp4',
    localLink = '127.0.0.1:3000/video';

const storage = new Storage({
    projectId: projectId
});

const bucket = storage.bucket(bucketName);

//gcloud service account: starting-account-idtuskoafmxb

// https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.body.token !== 'secret123') {
        return res.status(403).json({err: 'Missing token.'});
    }
    next();
});
//

// Takes in response and array of links returns {link: *link* } as response
let handleMerge = (res, links, remote) => {
    let handleErr = e => {
        res.status(500).json({err: e.message});
    };

    let mergedVideo = fluentFfmpeg();
    // https://stackoverflow.com/questions/28877848/merge-multiple-videos-using-node-fluent-ffmpeg
    // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/master/examples/mergeVideos.js
    links.forEach(name => {
        mergedVideo = mergedVideo.addInput(name);
    });
    mergedVideo
        .on('end', () => {
            if (!remote) {
                return res.status(200).json({link: localLink});
            }
            let file = bucket.file(`${fName}`);
            fs.createReadStream(`./${fName}`)
                .pipe(file.createWriteStream({
                    resumable: true
                }))
                .on('error', handleErr)
                .on('finish', () => {
                    file.getSignedUrl({
                        action: 'read',
                        expires: '06-28-2018'
                    }).then(signedUrls => {
                        console.log(signedUrls);
                        res.status(200).json({link: signedUrls[0]})
                    });
                });
        })
        .on('error', handleErr)
        .mergeToFile(`./${fName}`, './tmp/');
    //
};

// index for viewing
let home = (req, res) => {
    fs.readFile('index.html', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
};

// Getting video locally

app.get('/', home);
//https://medium.com/@daspinola/video-stream-with-node-js-and-html5-320b3191a6b6
app.get('/video', (req, res) => {
    const stat = fs.statSync(fName);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(fName, {start, end});
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
        fs.createReadStream(fName).pipe(res)
    }
});
//

app.post('/merge', (req, res) => {
    return handleMerge(res, req.body.links, req.body.remote);
});


app.listen(3000, () => {
    console.log('Running vidmerger!')
});