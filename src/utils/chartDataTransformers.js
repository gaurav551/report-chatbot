// utils/chartDataTransformers.js
export const transformHistoricalData = (historicalActuals) => {
  if (!Array.isArray(historicalActuals) || historicalActuals.length === 0) {
    return [];
  }

  const periodData = {};
  const limitedData = historicalActuals;
  
  limitedData.forEach((item) => {
    const period = item.accounting_period;
    const year = item.budget_year;
    const key = `${year}-${period.toString().padStart(2, '0')}`;
    
    if (!periodData[key]) {
      periodData[key] = {
        period: key,
        year: year,
        accounting_period: period,
        budget: 0,
        actuals: 0,
        cyExpYtdActuals: 0,
        cyRevYtdActuals: 0,
        fundCodes: new Set(),
        accounts: new Set(),
        departments: new Set(),
        parentDeptIds: new Set(),
      };
    }
    
    periodData[key].budget += parseFloat(item.budget) || 0;
    periodData[key].actuals += parseFloat(item.actuals) || 0;
    periodData[key].cyExpYtdActuals += parseFloat(item.cy_exp_ytd_actuals) || 0;
    periodData[key].cyRevYtdActuals += parseFloat(item.cy_rev_ytd_actuals) || 0;

    // Collect fund codes, accounts, and departments (avoid duplicates with Set)
    if (item.fund_code && item.fund_code !== 'NULL' && item.fund_code !== null) {
      periodData[key].fundCodes.add(item.fund_code);
    }
    if (item.account && item.account !== 'NULL' && item.account !== null) {
      periodData[key].accounts.add(item.account);
    }
    if (item.deptid && item.deptid !== 'NULL' && item.deptid !== null) {
      periodData[key].departments.add(item.deptid);
    }
    if (item.parent_deptid && item.parent_deptid !== 'NULL' && item.parent_deptid !== null) {
      periodData[key].parentDeptIds.add(item.parent_deptid);
    }
  });

  return Object.values(periodData)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.accounting_period - b.accounting_period;
    })
    .map(item => ({
      year: item.period,
      budget: Math.max(0, item.budget),
      actuals: Math.max(0, item.actuals),
      cyExpYtdActuals: Math.max(0, item.cyExpYtdActuals),
      cyRevYtdActuals: Math.max(0, item.cyRevYtdActuals),
      fundCodes: Array.from(item.fundCodes),
      accounts: Array.from(item.accounts),
      departments: Array.from(item.departments),
      parentDeptIds: Array.from(item.parentDeptIds),
    }));
};

export const transformForecastData = (forecastArray) => {
  if (!Array.isArray(forecastArray) || forecastArray.length === 0) {
    return [];
  }

  const periodMap = new Map();

  forecastArray.forEach((record) => {
    const year = parseInt(record.budget_year) || new Date().getFullYear();
    const month = parseInt(record.month_num) || parseInt(record.accounting_period) || 1;
    const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        period: periodKey,
        year: year,
        month: month,
        linear: 0,
        yoy: 0,
        mavg: 0,
        total: 0,
        fundCodes: new Set(),
        accounts: new Set(),
        departments: new Set(),
        parentDeptIds: new Set(),
      });
    }

    const periodData = periodMap.get(periodKey);
    const linearValue = parseFloat(record.linear) || 0;
    const yoyValue = parseFloat(record.yoy) || 0;
    const mavgValue = parseFloat(record.mavg) || 0;

    periodData.linear += linearValue;
    periodData.yoy += yoyValue;
    periodData.mavg += mavgValue;
    periodData.total += linearValue + yoyValue + mavgValue;

    // Collect fund codes, accounts, and departments (avoid duplicates with Set)
    if (record.fund_code && record.fund_code !== 'NULL' && record.fund_code !== null) {
      periodData.fundCodes.add(record.fund_code);
    }
    if (record.account && record.account !== 'NULL' && record.account !== null) {
      periodData.accounts.add(record.account);
    }
    if (record.deptid && record.deptid !== 'NULL' && record.deptid !== null) {
      periodData.departments.add(record.deptid);
    }
    if (record.parent_deptid && record.parent_deptid !== 'NULL' && record.parent_deptid !== null) {
      periodData.parentDeptIds.add(record.parent_deptid);
    }
  });

  return Array.from(periodMap.values())
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .map(item => ({
      period: item.period,
      year: item.year,
      month: item.month,
      linear: item.linear,
      yoy: item.yoy,
      mavg: item.mavg,
      total: item.total,
      fundCodes: Array.from(item.fundCodes),
      accounts: Array.from(item.accounts),
      departments: Array.from(item.departments),
      parentDeptIds: Array.from(item.parentDeptIds),
    }));
};