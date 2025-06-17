import { apiConnector } from '../apiConnector';
import { courseEndpoints } from '../apis';

export const showAllCategories = async () => {
  try {
    const response = await apiConnector("GET", courseEndpoints.COURSE_CATEGORIES_API);
    if (!response?.data?.success) {
      throw new Error("Could not fetch categories");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
