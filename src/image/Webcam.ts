const { spawn } = require('child_process');

// You would have to provide the full path to the CommandCam executable if it is not in the same directory


export function captureImage(path: string = "default.png") {
    let child = spawn('CommandCam', ['/filename', path], { detached: true });

    child.stdout.on('data', (data: any) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data: any) => {
        console.log(`stderr: ${data}`);
    });

    child.on('close', (code: any) => {
        console.log(`child process exited with code ${code}`);
    });
}