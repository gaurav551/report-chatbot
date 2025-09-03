import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const FinancialDashboard = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: '2024/01/01 - 2024/12/31',
    departments: ['Management Services', 'Human Resources', 'Finance'],
    funds: ['Common Fund', 'Special Fund', 'Operations Fund'],
    accounts: ['Revenue', 'Expenses'],
    categories: ['Maintenance & Operations', 'Personnel', 'Equipment']
  });

  const [dropdownStates, setDropdownStates] = useState({
    departments: false,
    funds: false,
    accounts: false,
    categories: false
  });

  // Complete Revenue Dataset
  const revenueData = [
    { parent_deptid: 1, fund_code: 100, account: '1111010', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'Revenue-Operations', total_budget_amt: 60733594, total_rev_amt: 58201402, remaining_budget: 2532192, pct_received: 95.83, type: 'Revenue' },
    { parent_deptid: 1, fund_code: 100, account: '1111020', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'Revenue-Admin', total_budget_amt: 275000, total_rev_amt: 264744, remaining_budget: 10256, pct_received: 96.27, type: 'Revenue' },
    { parent_deptid: 1, fund_code: 100, account: '1120020', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'Revenue-Grants', total_budget_amt: 37880, total_rev_amt: 19836, remaining_budget: 18044, pct_received: 52.37, type: 'Revenue' },
    { parent_deptid: 1, fund_code: 100, account: '1130010', parent_deptid_descr: 'Management Services', fund_descr: 'Common Fund', account_descr: 'Revenue-Services', total_budget_amt: 25270000, total_rev_amt: 16325877, remaining_budget: 8944123, pct_received: 64.61, type: 'Revenue' },
    { parent_deptid: 2, fund_code: 101, account: '1143010', parent_deptid_descr: 'Human Resources', fund_descr: 'Special Fund', account_descr: 'Revenue-HR', total_budget_amt: 820835, total_rev_amt: 512764, remaining_budget: 308071, pct_received: 62.47, type: 'Revenue' },
    { parent_deptid: 2, fund_code: 101, account: '1161010', parent_deptid_descr: 'Human Resources', fund_descr: 'Special Fund', account_descr: 'Revenue-Training', total_budget_amt: 205709, total_rev_amt: 105493, remaining_budget: 100216, pct_received: 51.28, type: 'Revenue' },
    { parent_deptid: 3, fund_code: 102, account: '1164100', parent_deptid_descr: 'Finance', fund_descr: 'Operations Fund', account_descr: 'Revenue-Finance', total_budget_amt: 422450, total_rev_amt: 361222, remaining_budget: 61228, pct_received: 85.62, type: 'Revenue' },
    { parent_deptid: 3, fund_code: 102, account: '1182010', parent_deptid_descr: 'Finance', fund_descr: 'Operations Fund', account_descr: 'Revenue-Audit', total_budget_amt: 573020, total_rev_amt: 431051, remaining_budget: 141969, pct_received: 75.22, type: 'Revenue' }
  ];

  // Complete Expenses Dataset
  const expensesData = [
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: 1, parent_deptid_descr: 'Management Services', fund_code: 100, fund_descr: 'Common Fund', account: '2310601', account_descr: 'Utilities', total_budget_amt: 15000, total_expenses: 14500, pct_budget_spent: 96.67, type: 'Expenses' },
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: 1, parent_deptid_descr: 'Management Services', fund_code: 100, fund_descr: 'Common Fund', account: '2310602', account_descr: 'Facilities', total_budget_amt: 25000, total_expenses: 23800, pct_budget_spent: 95.20, type: 'Expenses' },
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: 1, parent_deptid_descr: 'Management Services', fund_code: 100, fund_descr: 'Common Fund', account: '2310604', account_descr: 'Supplies', total_budget_amt: 8779, total_expenses: 8200, pct_budget_spent: 93.41, type: 'Expenses' },
    { tree_node_desc: 'Personnel', parent_deptid: 1, parent_deptid_descr: 'Management Services', fund_code: 100, fund_descr: 'Common Fund', account: '2330201', account_descr: 'Salaries', total_budget_amt: 180000, total_expenses: 175000, pct_budget_spent: 97.22, type: 'Expenses' },
    { tree_node_desc: 'Personnel', parent_deptid: 2, parent_deptid_descr: 'Human Resources', fund_code: 101, fund_descr: 'Special Fund', account: '2410101', account_descr: 'Benefits', total_budget_amt: 45000, total_expenses: 42500, pct_budget_spent: 94.44, type: 'Expenses' },
    { tree_node_desc: 'Personnel', parent_deptid: 2, parent_deptid_descr: 'Human Resources', fund_code: 101, fund_descr: 'Special Fund', account: '2410105', account_descr: 'Training', total_budget_amt: 12000, total_expenses: 10800, pct_budget_spent: 90.00, type: 'Expenses' },
    { tree_node_desc: 'Equipment', parent_deptid: 2, parent_deptid_descr: 'Human Resources', fund_code: 101, fund_descr: 'Special Fund', account: '2500102', account_descr: 'IT Equipment', total_budget_amt: 35000, total_expenses: 28000, pct_budget_spent: 80.00, type: 'Expenses' },
    { tree_node_desc: 'Equipment', parent_deptid: 3, parent_deptid_descr: 'Finance', fund_code: 102, fund_descr: 'Operations Fund', account: '2520101', account_descr: 'Office Equipment', total_budget_amt: 22000, total_expenses: 19500, pct_budget_spent: 88.64, type: 'Expenses' },
    { tree_node_desc: 'Equipment', parent_deptid: 3, parent_deptid_descr: 'Finance', fund_code: 102, fund_descr: 'Operations Fund', account: '2520109', account_descr: 'Software', total_budget_amt: 18000, total_expenses: 16200, pct_budget_spent: 90.00, type: 'Expenses' },
    { tree_node_desc: 'Maintenance & Operations', parent_deptid: 3, parent_deptid_descr: 'Finance', fund_code: 102, fund_descr: 'Operations Fund', account: '2520110', account_descr: 'Security', total_budget_amt: 28000, total_expenses: 26500, pct_budget_spent: 94.64, type: 'Expenses' }
  ];

  // Available filter options
  const filterOptions = {
    departments: ['Management Services', 'Human Resources', 'Finance'],
    funds: ['Common Fund', 'Special Fund', 'Operations Fund'],
    accounts: ['Revenue', 'Expenses'],
    categories: ['Maintenance & Operations', 'Personnel', 'Equipment']
  };

  // Filter data based on selections
  const filteredData = useMemo(() => {
    const allData = [...revenueData, ...expensesData];
    
    return allData.filter(item => {
      const deptMatch = selectedFilters.departments.length === 0 || selectedFilters.departments.includes(item.parent_deptid_descr);
      const fundMatch = selectedFilters.funds.length === 0 || selectedFilters.funds.includes(item.fund_descr);
      const accountMatch = selectedFilters.accounts.length === 0 || selectedFilters.accounts.includes(item.type);
      const categoryMatch = selectedFilters.categories.length === 0 || 
        (item.tree_node_desc && selectedFilters.categories.includes(item.tree_node_desc)) ||
        (!item.tree_node_desc && selectedFilters.accounts.includes('Revenue'));
      
      return deptMatch && fundMatch && accountMatch && categoryMatch;
    });
  }, [selectedFilters]);

  // Process data for charts
  const chartData = useMemo(() => {
    const revenueItems = filteredData.filter(item => item.type === 'Revenue');
    const expenseItems = filteredData.filter(item => item.type === 'Expenses');

    // 1. Budget vs Actual Revenue Chart
    const budgetVsActualData = revenueItems.length > 0 
      ? revenueItems.slice(0, 6).map(item => ({
          account: item.account_descr.replace('Revenue-', ''),
          budget: Number((item.total_budget_amt / 1000000).toFixed(2)),
          actual: Number((item.total_rev_amt / 1000000).toFixed(2)),
          percentage: item.pct_received
        }))
      : [
          { account: 'Operations', budget: 60.73, actual: 58.20, percentage: 95.83 },
          { account: 'Admin', budget: 0.28, actual: 0.26, percentage: 96.27 },
          { account: 'Grants', budget: 0.04, actual: 0.02, percentage: 52.37 },
          { account: 'Services', budget: 25.27, actual: 16.33, percentage: 64.61 }
        ];

    // 2. Monthly Revenue Trend Chart
    const avgPerformance = revenueItems.length > 0 
      ? revenueItems.reduce((sum, item) => sum + item.pct_received, 0) / revenueItems.length
      : 75;

    const monthlyTrendData = [
      { month: 'Jan', budget: 95.2, actual: Math.max(50, avgPerformance * 0.9 + Math.random() * 10 - 5) },
      { month: 'Feb', budget: 94.8, actual: Math.max(50, avgPerformance * 0.92 + Math.random() * 10 - 5) },
      { month: 'Mar', budget: 93.5, actual: Math.max(50, avgPerformance * 0.95 + Math.random() * 10 - 5) },
      { month: 'Apr', budget: 92.1, actual: Math.max(50, avgPerformance * 0.88 + Math.random() * 10 - 5) },
      { month: 'May', budget: 91.8, actual: Math.max(50, avgPerformance * 0.85 + Math.random() * 10 - 5) },
      { month: 'Jun', budget: 90.5, actual: Math.max(50, avgPerformance * 0.82 + Math.random() * 10 - 5) }
    ].map(item => ({
      ...item,
      actual: Number(item.actual.toFixed(1))
    }));

    // 3. Expenses by Category Pie Chart
    let expensesByCategory = [];
    if (expenseItems.length > 0) {
      const categoryGroups = expenseItems.reduce((acc, item) => {
        const category = item.tree_node_desc || 'Other';
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += item.total_budget_amt;
        acc[category].count += 1;
        return acc;
      }, {});

      const totalExpenses = Object.values(categoryGroups).reduce((sum, cat) => sum + cat.total, 0);
      expensesByCategory = Object.entries(categoryGroups).map(([name, data], index) => ({
        name,
        value: Number(((data.total / totalExpenses) * 100).toFixed(1)),
        amount: data.total,
        color: ['#60A5FA', '#F59E0B', '#FB7185', '#34D399', '#A78BFA'][index % 5]
      }));
    } else {
      expensesByCategory = [
        { name: 'Maintenance & Operations', value: 45.2, amount: 76779, color: '#60A5FA' },
        { name: 'Personnel', value: 32.8, amount: 237000, color: '#F59E0B' },
        { name: 'Equipment', value: 22.0, amount: 75000, color: '#FB7185' }
      ];
    }

    // 4. Top Expense Accounts Horizontal Bar Chart
    const topExpenseAccounts = expenseItems.length > 0
      ? expenseItems
          .sort((a, b) => b.total_budget_amt - a.total_budget_amt)
          .slice(0, 8)
          .map(item => ({
            account: item.account_descr,
            amount: item.total_budget_amt,
            spent: Number(item.pct_budget_spent.toFixed(1))
          }))
      : [
          { account: 'Salaries', amount: 180000, spent: 97.2 },
          { account: 'Facilities', amount: 25000, spent: 95.2 },
          { account: 'IT Equipment', amount: 35000, spent: 80.0 },
          { account: 'Security', amount: 28000, spent: 94.6 },
          { account: 'Office Equipment', amount: 22000, spent: 88.6 },
          { account: 'Software', amount: 18000, spent: 90.0 },
          { account: 'Utilities', amount: 15000, spent: 96.7 },
          { account: 'Benefits', amount: 45000, spent: 94.4 }
        ];

    return {
      budgetVsActualData,
      monthlyTrendData,
      expensesByCategory,
      topExpenseAccounts
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
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Budget vs Actual Revenue */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Budget vs Actual Revenue (Millions)
              <span className="text-sm text-gray-400 ml-2">
                ({chartData.budgetVsActualData.length} accounts)
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="account" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
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

          {/* Revenue Collection Trend */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Revenue Collection Trend (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none', 
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [`${value}%`, name === 'budget' ? 'Budget Target' : 'Actual Collection']}
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#60A5FA" 
                  strokeWidth={3}
                  dot={{ fill: '#60A5FA', r: 6 }}
                  name="budget"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#FB7185" 
                  strokeWidth={3}
                  dot={{ fill: '#FB7185', r: 6 }}
                  name="actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses by Category */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Expenses by Category
              <span className="text-sm text-gray-400 ml-2">
                ({chartData.expensesByCategory.length} categories)
              </span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}\n${value}%`}
                  labelLine={false}
                >
                  {chartData.expensesByCategory.map((entry, index) => (
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
            <div className="space-y-3">
              {chartData.topExpenseAccounts.map((item, index) => {
                const colors = ['#60A5FA', '#34D399', '#F59E0B', '#FB7185', '#A78BFA', '#FBBF24', '#10B981', '#8B5CF6'];
                const maxAmount = Math.max(...chartData.topExpenseAccounts.map(acc => acc.amount));
                const widthPercent = (item.amount / maxAmount) * 100;
                
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
                            width: `${(widthPercent * item.spent) / 100}%`
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