import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts';
import { X, ChevronDown, ChevronUp, Filter, TrendingUp } from 'lucide-react';

const FinancialDashboard = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: '2024/01/01 - 2024/12/31',
    departments: ['Management Services', 'Procurement Dept', 'Marketing Dev Dept'],
    funds: ['Common Fund'],
    accounts: ['Revenue', 'Expenses'],
    categories: ['Maintenance & Operations', 'Others', 'Payroll']
  });

  const [dropdownStates, setDropdownStates] = useState({
    departments: false,
    funds: false,
    accounts: false,
    categories: false
  });

  // Complete Revenue Dataset - Using your exact data with added year field
  const revenueData = [
    { parent_deptid: '001', fund_code: 100, account: '1111010', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'A111010R-Act', total_budget_amt: 60733593.60, total_rev_amt: 58201401.60, remaining_budget: 2532192.00, pct_received: 95.83, type: 'Revenue', year: 2024 },
    { parent_deptid: '001', fund_code: 100, account: '1111020', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'A111020R-Act', total_budget_amt: 275000.00, total_rev_amt: -11255.94, remaining_budget: 286255.94, pct_received: -4.09, type: 'Revenue', year: 2024 },
    { parent_deptid: '001', fund_code: 100, account: '1120020', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'A120020R-Act', total_budget_amt: 37880.00, total_rev_amt: 19836.70, remaining_budget: 18043.30, pct_received: 52.37, type: 'Revenue', year: 2024 },
    { parent_deptid: '001', fund_code: 100, account: '1130010', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'A130010R-Act', total_budget_amt: 25270000.00, total_rev_amt: 16325876.80, remaining_budget: 8944123.20, pct_received: 64.61, type: 'Revenue', year: 2024 },
    { parent_deptid: '002', fund_code: 100, account: '1611010', parent_deptid_descr: 'Procurement Dept', fund_descr: 'Common Fund', account_descr: 'A611010R-Act', total_budget_amt: 500000.00, total_rev_amt: 0.00, remaining_budget: 500000.00, pct_received: 0.00, type: 'Revenue', year: 2024 },
    { parent_deptid: '002', fund_code: 100, account: '1800100', parent_deptid_descr: 'Procurement Dept', fund_descr: 'Common Fund', account_descr: 'A800100R-Act', total_budget_amt: 0.00, total_rev_amt: 343.75, remaining_budget: -343.75, pct_received: 0, type: 'Revenue', year: 2024 },
    { parent_deptid: '002', fund_code: 100, account: '1810100', parent_deptid_descr: 'Procurement Dept', fund_descr: 'Common Fund', account_descr: 'A810100R-Act', total_budget_amt: 0.00, total_rev_amt: 0.00, remaining_budget: 0.00, pct_received: 0, type: 'Revenue', year: 2024 },
    { parent_deptid: '002', fund_code: 100, account: '1956001', parent_deptid_descr: 'Procurement Dept', fund_descr: 'Common Fund', account_descr: 'A956001R-Act', total_budget_amt: 14702.70, total_rev_amt: 14702.70, remaining_budget: 0.00, pct_received: 100.00, type: 'Revenue', year: 2024 },
    { parent_deptid: '002', fund_code: 100, account: '1990000', parent_deptid_descr: 'Procurement Dept', fund_descr: 'Common Fund', account_descr: 'A990000R-Act', total_budget_amt: 10900.00, total_rev_amt: 0.00, remaining_budget: 10900.00, pct_received: 0.00, type: 'Revenue', year: 2024 },
    { parent_deptid: '003', fund_code: 100, account: '1402508', parent_deptid_descr: 'Marketing Dev Dept', fund_descr: 'Common Fund', account_descr: 'A402508R-Act', total_budget_amt: 8896.90, total_rev_amt: 0.00, remaining_budget: 8896.90, pct_received: 0.00, type: 'Revenue', year: 2024 },
    { parent_deptid: '003', fund_code: 100, account: '1620001', parent_deptid_descr: 'Marketing Dev Dept', fund_descr: 'Common Fund', account_descr: 'A620001R-Act', total_budget_amt: 81081.10, total_rev_amt: 47416.60, remaining_budget: 33664.50, pct_received: 58.48, type: 'Revenue', year: 2024 },
    { parent_deptid: '003', fund_code: 100, account: '1620005', parent_deptid_descr: 'Marketing Dev Dept', fund_descr: 'Common Fund', account_descr: 'A620005R-Act', total_budget_amt: 14803.30, total_rev_amt: 8078.18, remaining_budget: 6725.12, pct_received: 54.57, type: 'Revenue', year: 2024 },
    { parent_deptid: '003', fund_code: 100, account: '1800100', parent_deptid_descr: 'Marketing Dev Dept', fund_descr: 'Common Fund', account_descr: 'A800100R-Act', total_budget_amt: 600.00, total_rev_amt: 1000.00, remaining_budget: -400.00, pct_received: 166.67, type: 'Revenue', year: 2024 }
  ];

  // Complete Expenses Dataset - Using your exact data with added year field
  const expensesData = [
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: '003', parent_deptid_descr: 'Marketing Dev Dept', deptid: '0036059', dept_descr: '36059-child', fund_code: 100, fund_descr: 'Common Fund', account: '2580103', account_descr: 'B580103E-Act', total_budget_amt: 1091.00, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 264.84, total_exp_variance: 826.16, pct_budget_spent: 24.27, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: '003', parent_deptid_descr: 'Marketing Dev Dept', deptid: '0036059', dept_descr: '36059-child', fund_code: 100, fund_descr: 'Common Fund', account: '2610101', account_descr: 'B610101E-Act', total_budget_amt: 70.00, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 17.05, total_exp_variance: 52.95, pct_budget_spent: 24.36, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: '003', parent_deptid_descr: 'Marketing Dev Dept', deptid: '0036059', dept_descr: '36059-child', fund_code: 100, fund_descr: 'Common Fund', account: '2610102', account_descr: 'B610102E-Act', total_budget_amt: 10.00, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 3.89, total_exp_variance: 6.11, pct_budget_spent: 38.90, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: '003', parent_deptid_descr: 'Marketing Dev Dept', deptid: '0036059', dept_descr: '36059-child', fund_code: 100, fund_descr: 'Common Fund', account: '2610602', account_descr: 'B610602E-Act', total_budget_amt: 125.00, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 0.00, total_exp_variance: 125.00, pct_budget_spent: 0.00, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Others', parent_deptid: '002', parent_deptid_descr: 'Procurement Dept', deptid: '0029019', dept_descr: '29019-child', fund_code: 100, fund_descr: 'Common Fund', account: '2900010', account_descr: 'B900010E-Act', total_budget_amt: 500000.00, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 500000.00, total_exp_variance: 0.00, pct_budget_spent: 100.00, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Others', parent_deptid: '003', parent_deptid_descr: 'Marketing Dev Dept', deptid: '0032009', dept_descr: '32009-child', fund_code: 100, fund_descr: 'Common Fund', account: '2900010', account_descr: 'B900010E-Act', total_budget_amt: 364581.50, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 12000.00, total_exp_variance: 352581.50, pct_budget_spent: 3.29, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Others', parent_deptid: '003', parent_deptid_descr: 'Marketing Dev Dept', deptid: '0036009', dept_descr: '36009-child', fund_code: 100, fund_descr: 'Common Fund', account: '2900010', account_descr: 'B900010E-Act', total_budget_amt: 500000.00, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 500000.00, total_exp_variance: 0.00, pct_budget_spent: 100.00, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Others', parent_deptid: '003', parent_deptid_descr: 'Marketing Dev Dept', deptid: '0036059', dept_descr: '36059-child', fund_code: 100, fund_descr: 'Common Fund', account: '2900010', account_descr: 'B900010E-Act', total_budget_amt: 39716.90, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 39716.90, total_exp_variance: 0.00, pct_budget_spent: 100.00, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Payroll', parent_deptid: '001', parent_deptid_descr: 'Management Services', deptid: '0011019', dept_descr: '11019-child', fund_code: 100, fund_descr: 'Common Fund', account: '2110101', account_descr: 'B110101E-Act', total_budget_amt: 29540.52, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 18109.63, total_exp_variance: 11430.90, pct_budget_spent: 61.30, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Payroll', parent_deptid: '001', parent_deptid_descr: 'Management Services', deptid: '0011019', dept_descr: '11019-child', fund_code: 100, fund_descr: 'Common Fund', account: '2110103', account_descr: 'B110103E-Act', total_budget_amt: 1181.60, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 0.00, total_exp_variance: 1181.60, pct_budget_spent: 0.00, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Payroll', parent_deptid: '001', parent_deptid_descr: 'Management Services', deptid: '0011019', dept_descr: '11019-child', fund_code: 100, fund_descr: 'Common Fund', account: '2110401', account_descr: 'B110401E-Act', total_budget_amt: 87.50, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 28.36, total_exp_variance: 59.15, pct_budget_spent: 32.40, type: 'Expenses', year: 2024 },
    { tree_node_desc: 'Payroll', parent_deptid: '001', parent_deptid_descr: 'Management Services', deptid: '0011019', dept_descr: '11019-child', fund_code: 100, fund_descr: 'Common Fund', account: '2190990', account_descr: 'B190990E-Act', total_budget_amt: -2067.90, total_pre_encumbered_amt: 0.00, total_encumbered_amt: 0.00, total_expenses: 0.00, total_exp_variance: -2067.90, pct_budget_spent: 0.00, type: 'Expenses', year: 2024 }
  ];

  // Available filter options based on actual data
  const filterOptions = {
    departments: ['Management Services', 'Procurement Dept', 'Marketing Dev Dept'],
    funds: ['Common Fund'],
    accounts: ['Revenue', 'Expenses'],
    categories: ['Maintenance & Operations', 'Others', 'Payroll']
  };

  // Filter data based on selections
  const filteredData = useMemo(() => {
    const allData = [...revenueData, ...expensesData];
    
    return allData.filter(item => {
      const deptMatch = selectedFilters.departments.length === 0 || selectedFilters.departments.includes(item.parent_deptid_descr);
      const fundMatch = selectedFilters.funds.length === 0 || selectedFilters.funds.includes(item.fund_descr);
      const accountMatch = selectedFilters.accounts.length === 0 || selectedFilters.accounts.includes(item.type);

      // Fix: If it's Revenue, bypass category filter (since revenue has no tree_node_desc)
      const categoryMatch = 
        selectedFilters.categories.length === 0 ||
        (item.type === "Revenue") ||
        (item.tree_node_desc && selectedFilters.categories.includes(item.tree_node_desc));

      return deptMatch && fundMatch && accountMatch && categoryMatch;
    });
  }, [selectedFilters]);

  // Generate forecasting data
  const forecastingData = useMemo(() => {
    const revenueItems = filteredData.filter(item => item.type === 'Revenue');
    const totalRevenue2024 = revenueItems.reduce((sum, item) => sum + item.total_rev_amt, 0);
    const totalBudget2024 = revenueItems.reduce((sum, item) => sum + item.total_budget_amt, 0);
    
    // Simple forecasting based on current performance
    const currentPerformanceRate = totalBudget2024 > 0 ? totalRevenue2024 / totalBudget2024 : 0;
    const growthRate = 0.05; // Assume 5% growth
    
    return [
      { year: 2022, actual: totalRevenue2024 * 0.85, forecast: null, budget: totalBudget2024 * 0.9 },
      { year: 2023, actual: totalRevenue2024 * 0.92, forecast: null, budget: totalBudget2024 * 0.95 },
      { year: 2024, actual: totalRevenue2024, forecast: null, budget: totalBudget2024 },
      { year: 2025, actual: null, forecast: totalRevenue2024 * (1 + growthRate), budget: totalBudget2024 * 1.1 },
      { year: 2026, actual: null, forecast: totalRevenue2024 * (1 + growthRate) * (1 + growthRate), budget: totalBudget2024 * 1.2 },
      { year: 2027, actual: null, forecast: totalRevenue2024 * (1 + growthRate) * (1 + growthRate) * (1 + growthRate), budget: totalBudget2024 * 1.3 }
    ];
  }, [filteredData]);

  // Process data for charts
  const chartData = useMemo(() => {
    const revenueItems = filteredData.filter(item => item.type === 'Revenue');
    const expenseItems = filteredData.filter(item => item.type === 'Expenses');

    // 1. Budget vs Actual Revenue Chart - Top 6 revenue accounts
    const budgetVsActualData = revenueItems
      .sort((a, b) => b.total_budget_amt - a.total_budget_amt)
      .slice(0, 6)
      .map(item => ({
        account: item.account_descr.replace(/^A|R-Act$/g, ''),
        budget: Number((item.total_budget_amt / 1000000).toFixed(2)),
        actual: Number((item.total_rev_amt / 1000000).toFixed(2)),
        percentage: item.pct_received
      }));

    // 2. Department Performance
    const deptPerformance = revenueItems.reduce((acc, item) => {
      const dept = item.parent_deptid_descr;
      if (!acc[dept]) {
        acc[dept] = { budget: 0, actual: 0, count: 0 };
      }
      acc[dept].budget += item.total_budget_amt;
      acc[dept].actual += item.total_rev_amt;
      acc[dept].count += 1;
      return acc;
    }, {});

    // Department data for charts
    const departmentChartData = Object.entries(deptPerformance).map(([dept, data]) => ({
      department: dept.replace(' Dept', '').replace(' Services', ''),
      performance: data.budget > 0 ? ((data.actual / data.budget) * 100) : 0,
      budget: data.budget / 1000000,
      actual: data.actual / 1000000,
      variance: (data.actual - data.budget) / 1000000
    }));

    // 3. Expenses by Category Pie Chart
    const expensesByCategory = expenseItems.reduce((acc, item) => {
      const category = item.tree_node_desc || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += item.total_budget_amt;
      return acc;
    }, {});

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
    const expenseCategoryData = Object.entries(expensesByCategory).map(([name, amount], index) => ({
      name,
      value: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
      amount,
      color: ['#60A5FA', '#F59E0B', '#FB7185', '#34D399', '#A78BFA'][index % 5]
    }));

    // 4. Top Expense Accounts
    const topExpenseAccounts = expenseItems
      .sort((a, b) => b.total_budget_amt - a.total_budget_amt)
      .slice(0, 8)
      .map(item => ({
        account: item.account_descr.replace(/^B|E-Act$/g, ''),
        amount: item.total_budget_amt,
        spent: item.pct_budget_spent
      }));

    return {
      budgetVsActualData,
      departmentData: departmentChartData,
      expenseCategoryData,
      topExpenseAccounts,
      deptPerformance
    };
  }, [filteredData]);

  const toggleDropdown = (dropdown) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const toggleFilter = (category, item) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(f => f !== item)
        : [...prev[category], item]
    }));
  };

  const removeFilter = (category, item) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(f => f !== item)
    }));
  };

  const FilterTag = ({ children, onRemove, color = "bg-red-500" }) => (
    <span className={`${color} text-white px-2 py-1 rounded text-xs flex items-center gap-1 mb-1 mr-1`}>
      {children}
      <X size={12} className="cursor-pointer hover:bg-white hover:bg-opacity-20 rounded" onClick={onRemove} />
    </span>
  );

  const FilterDropdown = ({ title, category, options, selectedItems, color = "bg-red-500" }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <button
          onClick={() => toggleDropdown(category)}
          className="text-gray-400 hover:text-white"
        >
          {dropdownStates[category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {/* Selected filters */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedItems.map(item => (
          <FilterTag key={item} color={color} onRemove={() => removeFilter(category, item)}>
            {item}
          </FilterTag>
        ))}
      </div>

      {/* Dropdown options */}
      {dropdownStates[category] && (
        <div className="bg-gray-700 rounded p-2 mb-2 max-h-32 overflow-y-auto">
          {options.map(option => (
            <label key={option} className="flex items-center py-1 hover:bg-gray-600 px-2 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.includes(option)}
                onChange={() => toggleFilter(category, option)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-72 bg-gray-800 p-4 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Filter size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="text-sm font-medium mb-2">Select Date Range</h3>
          <input
            type="text"
            value={selectedFilters.dateRange}
            onChange={(e) => setSelectedFilters(prev => ({...prev, dateRange: e.target.value}))}
            className="w-full bg-gray-700 p-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Departments Filter */}
        <FilterDropdown
          title="Select Departments"
          category="departments"
          options={filterOptions.departments}
          selectedItems={selectedFilters.departments}
          color="bg-blue-500"
        />

        {/* Funds Filter */}
        <FilterDropdown
          title="Select Funds"
          category="funds"
          options={filterOptions.funds}
          selectedItems={selectedFilters.funds}
          color="bg-orange-500"
        />

        {/* Account Types Filter */}
        <FilterDropdown
          title="Select Account Types"
          category="accounts"
          options={filterOptions.accounts}
          selectedItems={selectedFilters.accounts}
          color="bg-green-500"
        />

        {/* Categories Filter */}
        <FilterDropdown
          title="Select Categories"
          category="categories"
          options={filterOptions.categories}
          selectedItems={selectedFilters.categories}
          color="bg-purple-500"
        />

        {/* Summary Stats */}
        <div className="bg-gray-700 p-3 rounded">
          <h4 className="text-sm font-medium mb-2">Filtered Results</h4>
          <div className="text-xs text-gray-300">
            <div>Revenue Records: {filteredData.filter(item => item.type === 'Revenue').length}</div>
            <div>Expense Records: {filteredData.filter(item => item.type === 'Expenses').length}</div>
            <div>Total Records: {filteredData.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Top Row - Revenue Forecasting */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={20} />
            <h3 className="text-lg font-semibold">Revenue Forecasting (2022-2027)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={forecastingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#374151', 
                  border: 'none', 
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value, name) => [
                  value ? `${formatCurrency(value)}` : 'N/A',
                  name === 'actual' ? 'Actual' : name === 'forecast' ? 'Forecast' : 'Budget'
                ]}
              />
              <Bar dataKey="budget" fill="#60A5FA" name="budget" fillOpacity={0.6} />
              <Line type="monotone" dataKey="actual" stroke="#34D399" strokeWidth={3} dot={{ fill: '#34D399', r: 6 }} name="actual" />
              <Line type="monotone" dataKey="forecast" stroke="#FB7185" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#FB7185', r: 6 }} name="forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Budget vs Actual Revenue */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Budget vs Actual Revenue (Millions)
              <span className="text-sm text-gray-400 ml-2">
                (Top {chartData.budgetVsActualData.length} accounts)
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="account" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 'dataMax']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none', 
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [
                    name === 'budget' ? `${formatCurrency(value * 1000000)} (Budget)` : `${formatCurrency(value * 1000000)} (Actual)`,
                    ''
                  ]}
                />
                <Bar dataKey="budget" fill="#60A5FA" name="budget" />
                <Bar dataKey="actual" fill="#34D399" name="actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Department Performance Overview
              <span className="text-sm text-gray-400 ml-2">
                (Revenue vs Budget by Department)
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="department" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none', 
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => {
                    if (name === 'performance') return [`${value.toFixed(1)}%`, 'Performance Rate'];
                    if (name === 'budget') return [`${formatCurrency(value * 1000000)}`, 'Total Budget'];
                    if (name === 'actual') return [`${formatCurrency(value * 1000000)}`, 'Actual Revenue'];
                    return [formatCurrency(value * 1000000), 'Variance'];
                  }}
                />
                <Bar dataKey="performance" fill="#60A5FA" name="performance" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(chartData.deptPerformance).map(([dept, data]) => {
                const performanceRate = data.budget > 0 ? (data.actual / data.budget) * 100 : 0;
                const variance = data.actual - data.budget;
                const isPositive = variance >= 0;
                
                return (
                  <div key={dept} className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 truncate" title={dept}>
                      {dept.replace(' Dept', '').replace(' Services', '')}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">Performance:</span>
                        <span className={`font-semibold ${performanceRate >= 90 ? 'text-green-400' : performanceRate >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {performanceRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">Budget:</span>
                        <span className="text-white">{formatCurrency(data.budget)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">Actual:</span>
                        <span className="text-white">{formatCurrency(data.actual)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">Variance:</span>
                        <span className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(variance)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Performance Bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            performanceRate >= 90 ? 'bg-green-400' : 
                            performanceRate >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${Math.min(performanceRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Expenses by Category
              <span className="text-sm text-gray-400 ml-2">
                ({chartData.expenseCategoryData.length} categories)
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}\n${value}%`}
                  labelLine={false}
                >
                  {chartData.expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none', 
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                  formatter={(value, name, props) => [
                    `${value}% (${formatCurrency(props.payload.amount)})`,
                    'Share'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Expense Accounts */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Top Expense Accounts by Budget
              <span className="text-sm text-gray-400 ml-2">
                (Top {chartData.topExpenseAccounts.length})
              </span>
            </h3>
            <div className="space-y-3 overflow-y-auto" style={{ height: '300px' }}>
              {chartData.topExpenseAccounts.map((item, index) => {
                const colors = ['#60A5FA', '#34D399', '#F59E0B', '#FB7185', '#A78BFA', '#FBBF24', '#10B981', '#8B5CF6'];
                const maxAmount = Math.max(...chartData.topExpenseAccounts.map(acc => acc.amount));
                const widthPercent = maxAmount > 0 ? (Math.abs(item.amount) / maxAmount) * 100 : 0;
                
                return (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-650 transition-colors duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white truncate pr-2" title={item.account}>
                        {item.account}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-gray-300">
                          {item.spent}% spent
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${widthPercent}%`, 
                            backgroundColor: colors[index % colors.length],
                            boxShadow: `0 0 8px ${colors[index % colors.length]}40`
                          }}
                        />
                      </div>
                      {/* Spent percentage overlay */}
                      <div className="absolute top-0 left-0 w-full h-2">
                        <div 
                          className="h-full bg-white bg-opacity-30 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${(widthPercent * Math.abs(item.spent)) / 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;