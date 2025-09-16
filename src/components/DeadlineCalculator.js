import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react';

const DeadlineCalculator = () => {
  const [startDate, setStartDate] = useState('');
  const [jurisdiction, setJurisdiction] = useState('federal');
  const [courtType, setCourtType] = useState('district');
  const [deadlineType, setDeadlineType] = useState('response_to_complaint');
  const [calculatedDeadlines, setCalculatedDeadlines] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludeHolidays, setExcludeHolidays] = useState(true);
  const [customDays, setCustomDays] = useState('');
  const [customName, setCustomName] = useState('');
  
  // Legal deadline types by jurisdiction
  const deadlineOptions = {
    federal: {
      district: [
        { value: 'response_to_complaint', label: 'Response to Complaint', days: 21 },
        { value: 'reply_to_counterclaim', label: 'Reply to Counterclaim', days: 21 },
        { value: 'discovery_requests', label: 'Response to Discovery Requests', days: 30 },
        { value: 'motion_to_dismiss', label: 'Motion to Dismiss', days: 21 },
        { value: 'summary_judgment', label: 'Summary Judgment Motion', days: 28 },
        { value: 'appeal_notice', label: 'Notice of Appeal', days: 30 },
        { value: 'motion_reconsideration', label: 'Motion for Reconsideration', days: 28 }
      ],
      appellate: [
        { value: 'appeal_brief', label: 'Appellant Brief', days: 30 },
        { value: 'response_brief', label: 'Response Brief', days: 30 },
        { value: 'reply_brief', label: 'Reply Brief', days: 14 },
        { value: 'petition_rehearing', label: 'Petition for Rehearing', days: 14 },
        { value: 'cert_petition', label: 'Petition for Certiorari', days: 90 }
      ]
    },
    state: {
      trial: [
        { value: 'response_to_complaint_state', label: 'Response to Complaint', days: 30 },
        { value: 'discovery_requests_state', label: 'Response to Discovery', days: 30 },
        { value: 'motion_to_dismiss_state', label: 'Motion to Dismiss', days: 30 },
        { value: 'summary_judgment_state', label: 'Summary Judgment Motion', days: 30 },
        { value: 'appeal_notice_state', label: 'Notice of Appeal', days: 30 }
      ],
      appellate: [
        { value: 'appeal_brief_state', label: 'Appellant Brief', days: 45 },
        { value: 'response_brief_state', label: 'Response Brief', days: 45 },
        { value: 'reply_brief_state', label: 'Reply Brief', days: 20 }
      ]
    }
  };
  
  // Federal holidays
  const federalHolidays = [
    { name: "New Year's Day", month: 0, day: 1 },
    { name: "Martin Luther King Jr. Day", month: 0, day: "3rd Monday" },
    { name: "Presidents' Day", month: 1, day: "3rd Monday" },
    { name: "Memorial Day", month: 4, day: "last Monday" },
    { name: "Independence Day", month: 6, day: 4 },
    { name: "Labor Day", month: 8, day: "1st Monday" },
    { name: "Columbus Day", month: 9, day: "2nd Monday" },
    { name: "Veterans Day", month: 10, day: 11 },
    { name: "Thanksgiving Day", month: 10, day: "4th Thursday" },
    { name: "Christmas Day", month: 11, day: 25 }
  ];
  
  // Get current deadline options based on jurisdiction and court type
  const getCurrentDeadlineOptions = () => {
    return deadlineOptions[jurisdiction][courtType] || [];
  };
  
  // Get days for selected deadline type
  const getDaysForDeadlineType = () => {
    const options = getCurrentDeadlineOptions();
    const selected = options.find(option => option.value === deadlineType);
    return selected ? selected.days : 0;
  };
  
  // Check if a date is a weekend
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };
  
  // Check if a date is a federal holiday
  const isHoliday = (date) => {
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Check each holiday
    for (const holiday of federalHolidays) {
      if (typeof holiday.day === 'number') {
        // Fixed date holiday
        if (month === holiday.month && day === holiday.day) {
          return true;
        }
      } else {
        // Floating holiday (e.g., "3rd Monday")
        const [ordinal, weekday] = holiday.day.split(' ');
        if (month === holiday.month) {
          const weekdayNum = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekday);
          
          if (weekdayNum !== -1) {
            // Calculate the date for this floating holiday
            let count = 0;
            let holidayDate;
            
            if (ordinal === 'last') {
              // Start from the end of the month and work backwards
              const lastDay = new Date(year, month + 1, 0);
              let currentDay = lastDay.getDate();
              
              while (currentDay > 0) {
                const testDate = new Date(year, month, currentDay);
                if (testDate.getDay() === weekdayNum) {
                  holidayDate = testDate;
                  break;
                }
                currentDay--;
              }
            } else {
              // Start from the beginning of the month
              const ordinalNum = ['1st', '2nd', '3rd', '4th', '5th'].indexOf(ordinal) + 1;
              
              for (let i = 1; i <= 31; i++) {
                const testDate = new Date(year, month, i);
                if (testDate.getMonth() !== month) break; // Stop if we go into the next month
                
                if (testDate.getDay() === weekdayNum) {
                  count++;
                  if (count === ordinalNum) {
                    holidayDate = testDate;
                    break;
                  }
                }
              }
            }
            
            if (holidayDate && holidayDate.getDate() === day) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  };
  
  // Calculate deadline date
  const calculateDeadline = (startDateStr, days) => {
    if (!startDateStr) return null;
    
    const start = new Date(startDateStr);
    let result = new Date(start);
    result.setDate(result.getDate() + parseInt(days));
    
    // Adjust for weekends and holidays if needed
    if (excludeWeekends || excludeHolidays) {
      let additionalDays = 0;
      let currentDate = new Date(start);
      
      // Add the specified number of days, skipping weekends and holidays as needed
      for (let i = 0; i < parseInt(days); i++) {
        currentDate.setDate(currentDate.getDate() + 1);
        
        let needToAddDay = false;
        
        if (excludeWeekends && isWeekend(currentDate)) {
          needToAddDay = true;
        }
        
        if (excludeHolidays && isHoliday(currentDate)) {
          needToAddDay = true;
        }
        
        if (needToAddDay) {
          additionalDays++;
        }
      }
      
      // Add any additional days needed to skip weekends and holidays
      result.setDate(result.getDate() + additionalDays);
      
      // Check if the final date is a weekend or holiday, and adjust if needed
      while ((excludeWeekends && isWeekend(result)) || (excludeHolidays && isHoliday(result))) {
        result.setDate(result.getDate() + 1);
      }
    }
    
    return result;
  };
  
  // Handle calculation
  const handleCalculate = () => {
    if (!startDate) {
      alert('Please enter a start date');
      return;
    }
    
    const days = getDaysForDeadlineType();
    const deadlineDate = calculateDeadline(startDate, days);
    
    if (deadlineDate) {
      const options = getCurrentDeadlineOptions();
      const selected = options.find(option => option.value === deadlineType);
      
      const newDeadline = {
        id: Date.now(),
        name: selected ? selected.label : 'Custom Deadline',
        startDate: new Date(startDate).toLocaleDateString(),
        dueDate: deadlineDate.toLocaleDateString(),
        days: days,
        jurisdiction: jurisdiction === 'federal' ? 'Federal' : 'State',
        courtType: courtType === 'district' ? 'District Court' : courtType === 'trial' ? 'Trial Court' : 'Appellate Court'
      };
      
      setCalculatedDeadlines([newDeadline, ...calculatedDeadlines]);
    }
  };
  
  // Handle custom deadline calculation
  const handleCustomCalculation = () => {
    if (!startDate || !customDays || !customName) {
      alert('Please enter a start date, number of days, and name for your custom deadline');
      return;
    }
    
    const deadlineDate = calculateDeadline(startDate, customDays);
    
    if (deadlineDate) {
      const newDeadline = {
        id: Date.now(),
        name: customName,
        startDate: new Date(startDate).toLocaleDateString(),
        dueDate: deadlineDate.toLocaleDateString(),
        days: customDays,
        jurisdiction: 'Custom',
        courtType: 'N/A'
      };
      
      setCalculatedDeadlines([newDeadline, ...calculatedDeadlines]);
      setCustomDays('');
      setCustomName('');
    }
  };
  
  // Delete a deadline
  const deleteDeadline = (id) => {
    setCalculatedDeadlines(calculatedDeadlines.filter(deadline => deadline.id !== id));
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <Calendar className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="font-semibold text-xl text-gray-900">Legal Deadline Calculator</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Calculate important legal deadlines based on jurisdiction-specific rules, including court holidays and weekend adjustments.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
            <select
              value={jurisdiction}
              onChange={(e) => {
                setJurisdiction(e.target.value);
                // Reset court type and deadline type when jurisdiction changes
                if (e.target.value === 'federal') {
                  setCourtType('district');
                } else {
                  setCourtType('trial');
                }
                setDeadlineType('');
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="federal">Federal</option>
              <option value="state">State</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Court Type</label>
            <select
              value={courtType}
              onChange={(e) => {
                setCourtType(e.target.value);
                setDeadlineType('');
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {jurisdiction === 'federal' ? (
                <>
                  <option value="district">District Court</option>
                  <option value="appellate">Appellate Court</option>
                </>
              ) : (
                <>
                  <option value="trial">Trial Court</option>
                  <option value="appellate">Appellate Court</option>
                </>
              )}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Type</label>
            <select
              value={deadlineType}
              onChange={(e) => setDeadlineType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a deadline type</option>
              {getCurrentDeadlineOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.days} days)
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show Advanced Options
                </>
              )}
            </button>
            
            {showAdvanced && (
              <div className="mt-3 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="excludeWeekends"
                    checked={excludeWeekends}
                    onChange={(e) => setExcludeWeekends(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="excludeWeekends" className="text-sm text-gray-700">
                    Exclude Weekends
                  </label>
                </div>
                
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="excludeHolidays"
                    checked={excludeHolidays}
                    onChange={(e) => setExcludeHolidays(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="excludeHolidays" className="text-sm text-gray-700">
                    Exclude Federal Holidays
                  </label>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Deadline</h4>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Deadline Name"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Days"
                      className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    onClick={handleCustomCalculation}
                    disabled={!startDate || !customDays || !customName}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm flex items-center disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Custom Deadline
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleCalculate}
            disabled={!startDate || !deadlineType}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Calculate Deadline
          </button>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            Calculated Deadlines
          </h4>
          
          {calculatedDeadlines.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {calculatedDeadlines.map(deadline => (
                <div key={deadline.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{deadline.name}</h5>
                      <p className="text-sm text-gray-600">
                        {deadline.jurisdiction} {deadline.courtType}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteDeadline(deadline.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm">{deadline.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-semibold">{deadline.dueDate}</p>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {deadline.days} days
                    {excludeWeekends && ' (weekends excluded)'}
                    {excludeHolidays && ' (holidays excluded)'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No deadlines calculated yet</p>
              <p className="text-sm">Enter a start date and select a deadline type</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Important Disclaimer</h4>
            <p className="text-sm text-blue-800">
              This calculator is provided for informational purposes only and should not be relied upon as legal advice. 
              Always verify deadlines with applicable court rules and consult with a licensed attorney. 
              Local rules, judge-specific practices, and service methods may affect actual deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineCalculator;