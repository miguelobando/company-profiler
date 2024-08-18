export default function getBaseJobUrl(linkedinUrl: string): string {
    try {
        const url = new URL(linkedinUrl); 
        const jobPath = url.pathname.split('/').slice(0, 4).join('/'); 
        const baseJobUrl = `${url.origin}${jobPath}/`; 
    
        return baseJobUrl;
    } catch (error) {
        console.error("Invalid URL:", error);
        return "";
    }
}
