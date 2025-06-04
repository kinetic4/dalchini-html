// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ClockIcon as ClockIconOutline } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import dayjs from "dayjs";
import PropTypes from "prop-types";

// Local Imports
import {
  Badge,
  Button,
} from "components/ui";
import { orderStatusOptions } from "./data";
import { useLocaleContext } from "app/contexts/locale/context";

// ----------------------------------------------------------------------

export function OrdersDrawer({ isOpen, close, row }) {
  let statusOption = orderStatusOptions.find(
    (item) => item.value === row.original.status,
  );
  if (!statusOption) {
    console.warn(
      "Unknown reservation status:",
      row.original.status,
      "for reservation:",
      row.original._id
    );
    statusOption = {
      value: "pending",
      label: "Pending",
      color: "warning",
      icon: ClockIconOutline,
    };
  }

  const { locale } = useLocaleContext();
  const date = dayjs(row.original.date).locale(locale).format("DD MMM YYYY");
  const startTime = dayjs(row.original.startTime).locale(locale).format("hh:mm A");
  const endTime = dayjs(row.original.endTime).locale(locale).format("hh:mm A");

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
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed right-0 top-0 flex h-full w-full max-w-xl transform-gpu flex-col bg-white py-4 transition-transform duration-200 dark:bg-dark-700"
        >
          <div className="flex justify-between px-4 sm:px-5">
            <div>
              <div className="font-semibold">Reservation ID:</div>
              <div className="text-xl font-medium text-primary-600 dark:text-primary-400">
                {row.original._id} &nbsp;
                <Badge className="align-text-bottom" color={statusOption.color}>
                  {statusOption.label}
                </Badge>
              </div>
            </div>

            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="mt-3 flex w-full justify-between px-4 sm:px-5">
            <div className="flex flex-col">
              <div className="mb-1.5 font-semibold">Customer:</div>
              <div className="mt-1.5 text-lg font-medium text-gray-800 dark:text-dark-50">
                {row.original.name}
              </div>
              <div className="text-sm text-gray-500">
                {row.original.email}
              </div>
              <div className="text-sm text-gray-500">
                {row.original.phone}
              </div>
            </div>
            <div className="text-end">
              <div className="font-semibold">Date:</div>
              <div className="mt-1.5">
                <p className="font-medium">{date}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-300">
                  {startTime} - {endTime}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 px-4 sm:px-5">
            <div className="font-semibold">Reservation Details:</div>
            <div className="mt-2 space-y-2">
              <div>
                <span className="text-sm text-gray-500">Number of Guests:</span>
                <p className="font-medium">{row.original.guests}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created At:</span>
                <p className="font-medium">
                  {dayjs(row.original.createdAt).locale(locale).format("DD MMM YYYY hh:mm A")}
                </p>
              </div>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

OrdersDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  row: PropTypes.object.isRequired,
};
