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


export const getSalesFcast = async ({ 
  user_id = "", 
  session_id = "", 
  budget_year = "2025", 
  fund_code = [], 
  deptid = [], 
  group_by = true, 
  include_forecast = true, 
  forecast_fallback = true, 
  limit = 1000, 
  offset = 0 ,
  account = []
}) => {
  try {
    // Ensure required fields are not empty
    if (!user_id || !session_id) {
      throw new Error("user_id and session_id are required parameters");
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('user_id', user_id.toString());
    params.append('session_id', session_id.toString());
    params.append('budget_year', budget_year.toString());
    
    // Handle arrays by adding multiple values with same key
    if (Array.isArray(fund_code) && fund_code.length > 0) {
      fund_code.forEach(code => params.append('fund_code', code.toString()));
    }
    if (Array.isArray(account) && account.length > 0) {
      account.forEach(code => params.append('account', code.toString()));
    }
    
    if (Array.isArray(deptid) && deptid.length > 0) {
      deptid.forEach(dept => params.append('deptid', dept.toString()));
    }
    
    params.append('group_by', Boolean(group_by).toString());
    params.append('include_forecast', Boolean(include_forecast).toString());
    params.append('forecast_fallback', Boolean(forecast_fallback).toString());
    params.append('limit', Number(limit).toString());
    params.append('offset', Number(offset).toString());

    const response = await axios.get(
      `https://agentic.aiweaver.ai/api/rpt2/get-fcast-workspace?${params.toString()}`,
      {
        headers: {
          "Accept": "application/json"
        },
        timeout: 30000 // 30 second timeout
      }
    );
    return response.data;
  } catch (error) {
    console.error("getSalesFcast error:", error.response?.data || error.message);
    throw error;
  }
};
// Example usage with the provided parameters structure


// Call the function
// const result = await initWorkspaceApi(exampleParams);