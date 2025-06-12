// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  HashtagIcon
} from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";

// Local Imports
// import { Button, Select } from "components/ui";
import { orderStatusOptions } from "./data";

// ----------------------------------------------------------------------

// Enhanced Input Component
const FormInput = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  required = false,
  min,
  className = ""
}) => (
  <div className="group">
    <label className="mb-2 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200">
      {Icon && <Icon className="mr-2 h-4 w-4 text-gray-500" />}
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`
          w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 
          transition-all duration-200 placeholder:text-gray-400
          focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10
          dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-500
          dark:focus:border-blue-400 dark:focus:bg-gray-800 dark:focus:ring-blue-400/10
          hover:border-gray-300 dark:hover:border-gray-500
          ${className}
        `}
      />
    </div>
  </div>
);

// Enhanced Select Component
const FormSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  icon: Icon,
  required = false 
}) => (
  <div className="group">
    <label className="mb-2 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200">
      {Icon && <Icon className="mr-2 h-4 w-4 text-gray-500" />}
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="
          w-full appearance-none rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 pr-10 text-gray-900 
          transition-all duration-200
          focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10
          dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-100
          dark:focus:border-blue-400 dark:focus:bg-gray-800 dark:focus:ring-blue-400/10
          hover:border-gray-300 dark:hover:border-gray-500
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500' },
    completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500' },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <div className={`mr-2 h-2 w-2 rounded-full ${config.dot}`}></div>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

export function EditOrderModal({ isOpen, close, row, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState(row.original.status);
  const [name, setName] = useState(row.original.name || '');
  const [email, setEmail] = useState(row.original.email || '');
  const [phone, setPhone] = useState(row.original.phone || '');
  const [date, setDate] = useState(dayjs(row.original.date).format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState(row.original.startTime || '');
  const [endTime, setEndTime] = useState(row.original.endTime || '');
  const [guests, setGuests] = useState(row.original.guests || 1);
  const [createdAt] = useState(dayjs(row.original.createdAt).format('YYYY-MM-DDTHH:mm'));

  const handleSave = () => {
    onSave(row.index, {
      status: selectedStatus,
      name: name,
      email: email,
      phone: phone,
      date: date,
      startTime: startTime,
      endTime: endTime,
      guests: Number(guests),
      createdAt: dayjs(createdAt).toISOString(),
    });
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={DialogPanel}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
              className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gray-900"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6 py text-white ">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Edit Order</h3>
                    <p className="mt-1 text-blue-100">Update order information and status</p>
                  </div>
                  <button
                    onClick={close}
                    className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Order ID Card */}
                <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100">Order ID</p>
                      <p className="font-mono text-lg font-semibold">{row.original._id}</p>
                    </div>
                    <StatusBadge status={selectedStatus} />
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="max-h-[70vh] overflow-y-auto px-8 py-6">
                <div className="space-y-6">
                  {/* Status Section */}
                  <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Order Status
                    </h4>
                    <FormSelect
                      label="Current Status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      options={orderStatusOptions}
                      required
                    />
                  </div>

                  {/* Customer Information */}
                  <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormInput
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter customer name"
                        icon={UserIcon}
                        required
                      />
                      <FormInput
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@example.com"
                        icon={EnvelopeIcon}
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <FormInput
                        label="Phone Number"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        icon={PhoneIcon}
                        required
                      />
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Reservation Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormInput
                        label="Reservation Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        icon={CalendarDaysIcon}
                        required
                      />
                      <FormInput
                        label="Start Time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        icon={ClockIcon}
                        required
                      />
                      <FormInput
                        label="End Time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        icon={ClockIcon}
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <FormInput
                        label="Number of Guests"
                        type="number"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        placeholder="1"
                        icon={UsersIcon}
                        required
                      />
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Order Information
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <HashtagIcon className="mr-2 h-4 w-4" />
                      Created on {dayjs(createdAt).format('MMMM D, YYYY [at] h:mm A')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-8 py-6 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

EditOrderModal.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  row: PropTypes.object,
  onSave: PropTypes.func,
};