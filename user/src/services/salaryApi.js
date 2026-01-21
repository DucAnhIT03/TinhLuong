import client from '../apis/axios.js';

const request = async (path, payload) => {
  const url = `/salary/${path}`;
  try {
    const { data } = await client.post(url, payload);
    return data;
  } catch (err) {
    const message = err?.message || 'Request failed';
    throw new Error(message);
  }
};

export const salaryApi = {
  calculateGrossToNet: (payload) => request('gross-to-net', payload),
  calculateNetToGross: (payload) => request('net-to-gross', payload),
  getMeta: () => client.get('/salary/meta').then((res) => res.data),
};
