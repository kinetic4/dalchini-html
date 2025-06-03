import { useState, Fragment, useEffect } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

const API_URL = 'http://localhost:8080/api/calendar';

export default function CalendarPage() {
  const [unavailableDates, setUnavailableDates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);

  // Fetch calendar data on component mount
  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      console.log('Fetching calendar data...');
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received calendar data:', data);
      
      const datesMap = {};
      data.forEach(date => {
        datesMap[date.date] = { status: date.status, note: date.note, unavailableTimes: date.unavailableTimes || [] };
      });
      
      console.log('Processed dates map:', datesMap);
      setUnavailableDates(datesMap);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      alert('Error loading calendar data. Please refresh the page.');
    }
  };

  // At the top of your component, derive month and year from currentDate
  const [leftCurrentDate, setLeftCurrentDate] = useState(new Date());
  const [rightCurrentDate, setRightCurrentDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  });
  
  // Calculate separate month/year for each calendar
  const leftMonth = leftCurrentDate.getMonth();
  const leftYear = leftCurrentDate.getFullYear();
  const rightMonth = rightCurrentDate.getMonth();
  const rightYear = rightCurrentDate.getFullYear();
  
  // Generate days for LEFT calendar
  const leftFirstDayOfMonth = new Date(leftYear, leftMonth, 1);
  const leftDaysInMonth = new Date(leftYear, leftMonth + 1, 0).getDate();
  const leftStartingDayOfWeek = leftFirstDayOfMonth.getDay();
  
  const leftDays = Array.from({ length: leftStartingDayOfWeek }, () => null).concat(
    Array.from({ length: leftDaysInMonth }, (_, i) => i + 1)
  );
  
  // Generate days for RIGHT calendar
  const rightFirstDayOfMonth = new Date(rightYear, rightMonth, 1);
  const rightDaysInMonth = new Date(rightYear, rightMonth + 1, 0).getDate();
  const rightStartingDayOfWeek = rightFirstDayOfMonth.getDay();
  
  const rightDays = Array.from({ length: rightStartingDayOfWeek }, () => null).concat(
    Array.from({ length: rightDaysInMonth }, (_, i) => i + 1)
  );

  // Your handlers remain the same
  const handleNewButtonClick = () => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    setSelectedDateInfo({ 
      day: today.getDate(), 
      status: unavailableDates[todayString]?.status || 'available', 
      note: unavailableDates[todayString]?.note || '' 
    });
    setIsModalOpen(true);
  };

  const handleDayClick = (day, isLeftCalendar = true) => {
    const year = isLeftCalendar ? leftYear : rightYear;
    const month = isLeftCalendar ? leftMonth : rightMonth;
    // Format dateString with leading zeros
    const monthWithLeadingZero = String(month + 1).padStart(2, '0');
    const dayWithLeadingZero = String(day).padStart(2, '0');
    const dateString = `${year}-${monthWithLeadingZero}-${dayWithLeadingZero}`;
    
    setSelectedDateInfo({ 
      day, 
      year,
      month,
      status: unavailableDates[dateString]?.status || 'available', 
      note: unavailableDates[dateString]?.note || '' 
    });
    setIsModalOpen(true);
  };

 // In the CalendarPage component
const handleModalSubmit = async (status, note, unavailableTimes = []) => {
    if (!selectedDateInfo) return;
    
    const year = selectedDateInfo.year;
    const month = String(selectedDateInfo.month + 1).padStart(2, '0');
    const day = String(selectedDateInfo.day).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    try {
      const response = await fetch(`${API_URL}/date/${dateString}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ status, note, unavailableTimes }),
      });

      if (response.ok) {
        setUnavailableDates(prevDates => ({
          ...prevDates,
        [dateString]: { status, note, unavailableTimes }
        }));
        setIsModalOpen(false);
        await fetchCalendarData();
      } else {
      const errorData = await response.json();
      console.error('Failed to update date status:', errorData.error || response.statusText);
      }
    } catch (error) {
      console.error('Error updating date status:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDateInfo(null); // Clear selected date info on close
  };

  return (
    <><div
      className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f2f4] px-10 py-3">
          <div className="flex items-center gap-8">
          
            <div className="flex items-center gap-9">
              <a
                className="text-[#121416] text-sm font-medium leading-normal"
                href="#"
              >
                Today
              </a>
              <a
                className="text-[#121416] text-sm font-medium leading-normal"
                href="#"
              >
                Month
              </a>
              <a
                className="text-[#121416] text-sm font-medium leading-normal"
                href="#"
              >
                Week
              </a>
              <a
                className="text-[#121416] text-sm font-medium leading-normal"
                href="#"
              >
                Day
              </a>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <label className="flex flex-col min-w-40 !h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                <div
                  className="text-[#6a7681] flex border-none bg-[#f1f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0"
                  data-icon="MagnifyingGlass"
                  data-size="24px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                  </svg>
                </div>
                <input
                  placeholder="Search"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border-none bg-[#f1f2f4] focus:border-none h-full placeholder:text-[#6a7681] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  defaultValue="" />
              </div>
            </label>
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#dce8f3] text-[#121416] text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={handleNewButtonClick} // Add onClick handler
            >
              <span className="truncate">New</span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCq0hz9BPFDi9jI96bvSfVak1qpcpwB1Z0EcVb1So4glX6qPRzIm6lAm6mDgklNJUL1_YyDwfz77e0xdYZ7oon5HlZ48shdgZCzgMawQxWlHwYxQ0HIS6lK71SW3tFBIb7a9dVc5PxbercCoxxwi-bBIdt6HBZZExEOk2EqFTrlkMHun5_k22b2nrPxpXR5dRzrDWb91zcXaCyFO0MtnkW5ObjllxTtqjV0notNceDnfeRY76_LyZr6YzKOlPOMmuIf1eKwjBkSLQg")'
              }} />
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap items-center justify-center gap-6 p-4">
            <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
    <div className="flex items-center p-1 justify-between">
    <button onClick={() => setLeftCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))}>
        <div className="text-[#121416] flex size-10 items-center justify-center" data-icon="CaretLeft" data-size="18px" data-weight="regular">
          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
          </svg>
        </div>
      </button>
      <p className="text-[#121416] text-base font-bold leading-tight flex-1 text-center pr-10">
      {leftCurrentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>
      <button onClick={() => setLeftCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))}>
      <div className="text-[#121416] flex size-10 items-center justify-center" data-icon="CaretRight" data-size="18px" data-weight="regular">
          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
          </svg>
        </div>
      </button>
    </div>
    <div className="grid grid-cols-7 text-black">
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">S</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">M</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">T</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">W</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">T</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">F</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">S</p>
      {leftDays.map((day, index) => {
  // Format dateKey with leading zeros
  const monthWithLeadingZero = String(leftMonth + 1).padStart(2, '0');
  const dayWithLeadingZero = String(day).padStart(2, '0');
  const dateKey = `${leftYear}-${monthWithLeadingZero}-${dayWithLeadingZero}`;
  
  const dayInfo = unavailableDates[dateKey];
  const isUnavailable = dayInfo?.status === 'unavailable';
  
  return (
    <button
      key={index}
      className={`h-12 w-full text-sm font-medium leading-normal relative ${
        day === null ? '' : 'hover:bg-gray-100 transition-colors'
      }`}
      onClick={() => day !== null && handleDayClick(day, true)}
      disabled={day === null}
    >
      <div className="flex size-full items-center justify-center rounded-full relative">
        {day}
        {isUnavailable && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            !
          </span>
        )}
      </div>
    </button>
  );
})}
    </div>
  </div>

  <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
    <div className="flex items-center p-1 justify-between">
    <button onClick={() => setRightCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))}>
        <div className="text-[#121416] flex size-10 items-center justify-center" data-icon="CaretLeft" data-size="18px" data-weight="regular">
          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
          </svg>
        </div>
      </button>
      <p className="text-[#121416] text-base font-bold leading-tight flex-1 text-center pr-10">
        {rightCurrentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>
      <button onClick={() => setRightCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))}>
      <div className="text-[#121416] flex size-10 items-center justify-center" data-icon="CaretRight" data-size="18px" data-weight="regular">
          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
          </svg>
        </div>
      </button>
    </div>
    <div className="grid grid-cols-7 text-black">
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">S</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">M</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">T</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">W</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">T</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">F</p>
      <p className="text-[#121416] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">S</p>
      {rightDays.map((day, index) => {
          // Format dateKey with leading zeros
          const monthWithLeadingZero = String(rightMonth + 1).padStart(2, '0');
          const dayWithLeadingZero = String(day).padStart(2, '0');
          const dateKey = `${rightYear}-${monthWithLeadingZero}-${dayWithLeadingZero}`;
        
          const dayInfo = unavailableDates[dateKey];
          const isUnavailable = dayInfo?.status === 'unavailable';
        
        return (
          <button
            key={index}
            className={`h-12 w-full text-sm font-medium leading-normal relative ${
              day === null ? '' : 'hover:bg-gray-100 transition-colors'
            }`}
            onClick={() => day !== null && handleDayClick(day, false)}
            disabled={day === null}
          >
            <div className="flex size-full items-center justify-center rounded-full relative">
              {day}
              {/* Badge for unavailable dates */}
              {isUnavailable && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>

            </div>
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-xl border border-[#dde1e3] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-120 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Time
                      </th>
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-240 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Sunday
                      </th>
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-360 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Monday
                      </th>
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-480 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Tuesday
                      </th>
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-600 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Wednesday
                      </th>
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-720 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Thursday
                      </th>
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-840 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Friday
                      </th>
                      <th className="table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-960 px-4 py-3 text-left text-[#121416] w-[400px] text-sm font-medium leading-normal">
                        Saturday
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const time = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
                      const time24 = `${hour.toString().padStart(2, '0')}:00`;
                      
                      // Assuming the weekly view starts from today's week
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay()); // Set to the previous Sunday
                      
                      return (
                        <tr key={hour} className="border-t border-t-[#dde1e3]">
                          <td className="h-[72px] px-4 py-2 w-[120px] text-[#6a7681] text-sm font-normal leading-normal">
                            {time}
                      </td>
                          {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                            const dayDate = new Date(startOfWeek);
                            dayDate.setDate(startOfWeek.getDate() + dayIndex);
                            const dayString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                            
                            // Check if the date is in the past
                            const isPast = dayDate < today;
                            
                            // Check if the time slot is unavailable based on fetched data
                            const isUnavailable = unavailableDates[dayString]?.unavailableTimes?.includes(time24);
                            
                            return (
                              <td 
                                key={dayIndex} 
                                className={`h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal ${
                                  isPast ? 'text-[#a0a0a0]' : (isUnavailable ? 'text-red-600' : 'text-green-600')
                                }`}
                              >
                                {isPast ? 'Past' : (isUnavailable ? '❌ Unavailable' : '✅ Available')}
                      </td>
                            );
                          })}
                    </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <style
                dangerouslySetInnerHTML={{
                  __html: "\n                          @container(max-width:120px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-120{display: none;}}\n                @container(max-width:240px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-240{display: none;}}\n                @container(max-width:360px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-360{display: none;}}\n                @container(max-width:480px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-480{display: none;}}\n                @container(max-width:600px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-600{display: none;}}\n                @container(max-width:720px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-720{display: none;}}\n                @container(max-width:840px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-840{display: none;}}\n                @container(max-width:960px){.table-ecc6cef6-fa2b-4e3b-9978-5f7e4d2fadbc-column-960{display: none;}}\n                      "
                }} />
            </div>
            <div className="flex justify-end overflow-hidden px-5 pb-5">
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-[#dce8f3] text-[#121416] text-base font-bold leading-normal tracking-[0.015em] min-w-0 px-2 gap-4 pl-4 pr-6">
                <div
                  className="text-[#121416]"
                  data-icon="Plus"
                  data-size="24px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Transition appear show={isModalOpen} as={Fragment}>
  <Dialog
    as="div"
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
    onClose={handleModalClose}
  >
    <TransitionChild
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity" />
    </TransitionChild>

    <TransitionChild
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <DialogPanel className="relative flex w-full max-w-lg origin-bottom flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDateInfo ? `Manage Day ${selectedDateInfo.day}` : 'Add New Event'}
            </h3>
            <button
              onClick={handleModalClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col p-6 space-y-6">
          {selectedDateInfo && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                Selected Date: {selectedDateInfo.day}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                selectedDateInfo.status === 'Unavailable' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {selectedDateInfo.status || 'Available'}
              </span>
            </div>
          )}

          {/* Status Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Availability Status
            </label>
            <select
              value={selectedDateInfo?.status || 'available'}
              onChange={(e) => setSelectedDateInfo(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="available">✅ Available</option>
              <option value="unavailable">❌ Unavailable</option>
            </select>
          </div>

{          /* In the DialogPanel component */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Unavailable Time Slots
  </label>
  <div className="grid grid-cols-4 gap-2">
    {Array.from({ length: 24 }, (_, i) => {
      const time = `${i.toString().padStart(2, '0')}:00`;
      const isSelected = selectedDateInfo?.unavailableTimes?.includes(time);
      return (
        <button
          key={time}
          type="button"
          onClick={() => {
            setSelectedDateInfo(prev => {
              const currentTimes = prev.unavailableTimes || [];
              const newTimes = isSelected 
                ? currentTimes.filter(t => t !== time)
                : [...currentTimes, time];
              return { ...prev, unavailableTimes: newTimes };
            });
          }}
          className={`px-2 py-1 text-xs rounded-md ${
            isSelected 
              ? 'bg-red-100 text-red-800 border-red-300'
              : 'bg-gray-100 text-gray-800 border-gray-300'
          } border`}
        >
          {time}
        </button>
      );
    })}
  </div>
          </div>

          {/* Note Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={selectedDateInfo?.note || ''}
              onChange={(e) => setSelectedDateInfo(prev => ({ ...prev, note: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Add any additional notes or details for this date..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleModalClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleModalSubmit(selectedDateInfo?.status || 'available', selectedDateInfo?.note || '', selectedDateInfo?.unavailableTimes || [])}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </DialogPanel>
    </TransitionChild>
  </Dialog>
</Transition>
      </>

  );
} 