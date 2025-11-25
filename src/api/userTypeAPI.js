// src/api/userTypeAPI.js
import apiClient from "./index"; 

const API_PREFIX = ""; 


export const getTypeByCode = async ({ code }) => {
  
  const res = await apiClient.get(`${API_PREFIX}/types`, {
    params: { code },
  });

 
  const data = res.data?.data ?? res.data;
  return Array.isArray(data) ? data[0] : data;
};


export const patchMyType = async ({ typeCode }) => {
  const res = await apiClient.patch(
    `${API_PREFIX}/users/me`,
    { typeCode } 
  );

  return res.data;
};
