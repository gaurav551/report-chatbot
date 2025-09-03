import axios from "axios";
import { ChatBaseUrl } from "../const/url";

export const initWorkspaceApi = async (params) => {
  const response = await axios.post(
    `${ChatBaseUrl}api/rpt2/init-workspace`,
    params
  );
  return response.data;
};

// Example usage with the provided parameters structure


// Call the function
// const result = await initWorkspaceApi(exampleParams);