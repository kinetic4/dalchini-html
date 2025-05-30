// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useCallback, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";
import { OrdersDrawer } from "./OrdersDrawer";
import { EditOrderModal } from "./EditOrderModal";
import { useDisclosure } from "hooks";

// ----------------------------------------------------------------------

export function RowActions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const [isDrawerOpen, { close: closeDrawer, open: openDrawer }] =
    useDisclosure(false);
  const [isEditModalOpen, { close: closeEditModal, open: openEditModal }] =
    useDisclosure(false);

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRows = useCallback(() => {
    setConfirmDeleteLoading(true);
    setTimeout(() => {
      table.options.meta?.deleteRow(row);
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
    }, 1000);
  }, [row, table]);

  const handleEditSave = useCallback((rowIndex, updatedFields) => {
    table.options.meta?.updateData(rowIndex, updatedFields);
  }, [table]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <Menu as="div" className="relative">
        <MenuButton
          as={Button}
          variant="flat"
          isIcon
          className="size-8 rounded-full"
        >
          <EllipsisHorizontalIcon className="size-4.5" />
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            anchor={{ to: "bottom end", gap: "4px" }}
            className="z-100 w-40 overflow-hidden rounded-lg border border-gray-300 bg-white py-1 text-xs-plus capitalize shadow-soft outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none"
          >
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openDrawer}
                  className={clsx(
                    "flex w-full items-center space-x-2 px-3 py-2 text-gray-800 outline-hidden transition-colors dark:text-dark-100",
                    focus && "bg-gray-100 dark:bg-dark-600",
                  )}
                >
                  <EyeIcon className="size-4.5 stroke-1" />
                  <span>View</span>
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openEditModal}
                  className={clsx(
                    "flex w-full items-center space-x-2 px-3 py-2 text-gray-800 outline-hidden transition-colors dark:text-dark-100",
                    focus && "bg-gray-100 dark:bg-dark-600",
                  )}
                >
                  <PencilIcon className="size-4.5 stroke-1" />
                  <span>Edit</span>
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openModal}
                  className={clsx(
                    "flex w-full items-center space-x-2 px-3 py-2 text-red-600 outline-hidden transition-colors dark:text-red-400",
                    focus && "bg-gray-100 dark:bg-dark-600",
                  )}
                >
                  <TrashIcon className="size-4.5 stroke-1" />
                  <span>Delete</span>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>

      <OrdersDrawer
        isOpen={isDrawerOpen}
        close={closeDrawer}
        row={row}
      />

      <EditOrderModal
        isOpen={isEditModalOpen}
        close={closeEditModal}
        row={row}
        onSave={handleEditSave}
      />

      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        onOk={handleDeleteRows}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
