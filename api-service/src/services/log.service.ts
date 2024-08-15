export class LogService {
  logMessage(module: string, message: string) {
    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
    console.log(`[${formattedDate}] ${module} - info - ${message}`);
  }

  logError(module: string, message: string) {
    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
    console.log(`[${formattedDate}] ${module} - error - ${message}`);
  }
}
