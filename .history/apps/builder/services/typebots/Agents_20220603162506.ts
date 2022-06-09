import { sendRequest } from 'utils'

export type getAuthorizedHeaders = {
    headers: {
        Authorization: string;
        'Content-Type': string;
    } | {
        Authorization: string;
        AppSubDomain: string;
        'Content-Type': string;
    };
} | {
    headers: {
        'Content-Type': string;
    } | {
        AppSubDomain: string;
        'Content-Type': string;
    };
};
export type getUnauthorizedHeaders = {
    headers: {
        'Content-Type': string;
    } | {
        AppSubDomain: string;
        'Content-Type': string;
    };
};


export const agents = (
  auth: getAuthorizedHeaders
) =>
  sendRequest({
    method: 'GET',
    url: `https://chat.qaoctadesk.services/api/agents`,
    body: auth,
  })
