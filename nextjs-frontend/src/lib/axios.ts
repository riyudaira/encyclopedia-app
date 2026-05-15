import Axios from 'axios';

const axios = Axios.create({
    baseURL:process.env.NEXT_PUBLIC_BACKEND_URL,
    headers:{
        'x-Requested-With':'XMLHttpRequest'
    },
    withCredentials:true,
    withXSRFToken:true,
});

export default axios;