const express = require('express'),
      bodyParser = require('body-parser'),
      fluentFfmpeg = require('fluent-ffmpeg');


// https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
const app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));
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

app.get('/', (req, res) => res.send('Hello World!'));
app.post('/merge', (req, res) => {
    return handleMerge(res, req.body.links);
});


app.listen(3000, () => console.log('Running vidmerger!'));