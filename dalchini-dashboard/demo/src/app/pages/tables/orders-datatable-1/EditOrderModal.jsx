// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";

// Local Imports
import { Button, Select } from "components/ui";
import { orderStatusOptions } from "./data";

// ----------------------------------------------------------------------

export function EditOrderModal({ isOpen, close, row, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState(row.original.order_status);
  const [createdAt, setCreatedAt] = useState(dayjs(Number(row.original.created_at)).format('YYYY-MM-DDTHH:mm'));
  const [startTime, setStartTime] = useState(dayjs(Number(row.original.start_time)).format('YYYY-MM-DDTHH:mm'));
  const [endTime, setEndTime] = useState(dayjs(Number(row.original.end_time)).format('YYYY-MM-DDTHH:mm'));
  const [numberOfGuests, setNumberOfGuests] = useState(row.original.number_of_guests || 1);
  const [phoneNumber, setPhoneNumber] = useState(row.original.phone_number || '');

  const handleSave = () => {
    onSave(row.index, {
      order_status: selectedStatus,
      created_at: dayjs(createdAt).valueOf().toString(),
      start_time: dayjs(startTime).valueOf().toString(),
      end_time: dayjs(endTime).valueOf().toString(),
      number_of_guests: Number(numberOfGuests),
      phone_number: phoneNumber,
    });
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="fixed left-1/2 top-1/2 z-100 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-xl dark:bg-dark-700"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">
              Edit Order
            </h3>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="mt-4">
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                Order ID
              </label>
              <div className="text-gray-900 dark:text-dark-100">
                {row.original.order_id}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                Status
              </label>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full"
              >
                {orderStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                Order Date
              </label>
              <input
                type="datetime-local"
                className="w-full rounded border border-gray-300 px-2 py-1 dark:bg-dark-700 dark:text-dark-100"
                value={createdAt}
                onChange={e => setCreatedAt(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                Start Time
              </label>
              <input
                type="datetime-local"
                className="w-full rounded border border-gray-300 px-2 py-1 dark:bg-dark-700 dark:text-dark-100"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                End Time
              </label>
              <input
                type="datetime-local"
                className="w-full rounded border border-gray-300 px-2 py-1 dark:bg-dark-700 dark:text-dark-100"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                Number of Guests
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded border border-gray-300 px-2 py-1 dark:bg-dark-700 dark:text-dark-100"
                value={numberOfGuests}
                onChange={e => setNumberOfGuests(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-dark-200">
                Phone Number
              </label>
              <input
                type="text"
                className="w-full rounded border border-gray-300 px-2 py-1 dark:bg-dark-700 dark:text-dark-100"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="flat" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </TransitionChild>
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