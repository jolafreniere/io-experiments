import * as fs from "fs/promises";
export async function removeFileIfExists(filePath: string) {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (error: any) {
        if (error!.code !== "ENOENT") {
            console.log(`An error occurred while removing ${filePath}:`, error);
        }
    }
}

export async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}