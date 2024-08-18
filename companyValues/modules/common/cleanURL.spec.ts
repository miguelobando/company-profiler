import { describe, it, expect } from 'vitest';
import cleanURL from './cleanURL.ts';
describe('getBaseJobUrl', () => {
    it('should return the base job URL', () => {
        const URL = 'https://www.linkedin.com/jobs/view/3985173581/?eBP=CwEAAAGRXG_BpFfe2XYrVWC8F2Yt3q6FRERIrGqEkod_QZrASXS3xD91ATbqjdKzN_wofOLZEWA2TtKB6p1dmL84eRkjBjmhabdy89X_zT5x67i7dcNWEV05mUiwu_bIRWr5jr20KM1jVIODgPjfw5P14TU5Plczm3BUKzh0kHjoZzJOpro6kzoh7jgyMG4L-07wWPFrholP85BOYqyCSy8t-fSOWwJxw79n1YUX8LP8l4RfaF0-FPSti_lCS1JGsOd-M0zgC3nmrQfxMn13UZyTZL3isSTQIoW-ibOVTV1GlHDiSXWTYUlTnCevRkAhn4SbBM4_OS_bMVBmhz51RIsnycpjJIWBGLkJ8EKHHgtNFME7sBLxZySGzrKIMW58zz3NyjiwFm2OjLCalDOm8v24FSoGpIOgWoc-mM5LYhjvU72DtgxBGQ6Dcu_r3Wjk4gCKDqlK_vsYlNEcn6AMX9GaE4qwiW0mrtnU-4Y1i-Un&refId=bj1vzoqkM%2BGk3UDTvtDyyw%3D%3D&trackingId=McEjTo9famoEh2M41SDutQ%3D%3D&trk=flagship3_jobs_discovery_jymbii'
        const result =  cleanURL(URL);
        expect(result).toBe('https://www.linkedin.com/jobs/view/3985173581/');
    });
});