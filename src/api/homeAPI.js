// src/api/homeAPI.js
import apiClient from "./index";


export const getTypesWithTags = async () => {
  const res = await apiClient.get(`/types`);

  return res.data;
};

export const getCoursesByTag = async ({ tag, order }) => {
  const res = await apiClient.get(`/courses`, {
    params: { tag, order },
  });

  return res.data;
};
