import axios from "axios";
import { ChatBaseUrl } from "../const/url";

export const initWorkspaceApi = async (params) => {
  const response = await axios.post(
    `${ChatBaseUrl}api/rpt2/init-workspace`,
    params
  );
  return response.data;
};
export const generateReportApi = async (
  params
) => {
  const response = await axios.post(
    "https://agentic.aiweaver.ai/api/rpt2/generate-report",
    params
  );
  return response.data;
};


export const initForecastWorkspaceApi = async ({ user_id, session_id, budgetYear = 2022 }) => {
  const response = await axios.post(
    "https://agentic.aiweaver.ai/api/rpt2/init-fcast-workspace",
    {
      user_id,
      session_id,
      budgetYear
    }
  );
  return response.data;
};


export const getSalesFcast = async ({ user_id, session_id,  }) => {
  const response = await axios.get(
    `https://agentic.aiweaver.ai/api/rpt2/get-fcast-workspace?user_id=${user_id}&session_id=${session_id}`
  );
  return response.data;
};
// Example usage with the provided parameters structure


// Call the function
// const result = await initWorkspaceApi(exampleParams);