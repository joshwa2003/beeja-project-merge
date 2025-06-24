import axios from "axios"

export const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'Accept': 'application/json'
    }
});

export const apiConnector = (method, url, bodyData, headers, params) => {
    // Determine if we're sending FormData (for file uploads)
    const isFormData = bodyData instanceof FormData;
    
    // Set default headers, but don't override Content-Type for FormData
    const defaultHeaders = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(headers?.Authorization ? { 'Authorization': headers.Authorization } : {})
    };

    // Extract axios-specific options from params
    const axiosOptions = {};
    let queryParams = null;
    
    if (params) {
        // If params contains responseType, it's an axios option
        if (params.responseType) {
            axiosOptions.responseType = params.responseType;
        } else {
            // Otherwise, it's query parameters
            queryParams = params;
        }
    }

    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData !== undefined && bodyData !== null ? bodyData : undefined,
        headers: {
            ...defaultHeaders,
            ...headers
        },
        params: queryParams,
        withCredentials: true,
        ...axiosOptions
    });
}
