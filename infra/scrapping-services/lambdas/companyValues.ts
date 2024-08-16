import companyValues from './modules/companyValues';

export const handler = async (event: any) => {
    const URL = 'https://www.linkedin.com/jobs/view/3985173581/'
    const result =  companyValues(URL);
    return { statusCode: 200, body: result };
}