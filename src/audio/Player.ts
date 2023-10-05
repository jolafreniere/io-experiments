import { spawn } from 'child_process';

export function playSound(filename: string): void {
    const play = spawn('cmdmp3', [filename]);

    play.on('error', (err) => {
        // console.error(`Failed to play '${filename}' because of: ${err}`);
    });

    play.on('exit', (code) => {
        // console.info(`Sound '${filename}' finished playing with exit code: ${code}`);
    });
}

