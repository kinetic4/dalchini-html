// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Badge } from "components/ui";
import { format } from "date-fns";

// Local Imports
import { RowActions } from "./RowActions";
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";
import {
    
} from "./rows";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'cancelled':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const columns = [
    columnHelper.display({
        id: "select",
        label: "Row Selection",
        header: SelectHeader,
        cell: SelectCell,
    }),
    columnHelper.accessor("name", {
        id: "name",
        label: "Name",
        header: "Name",
        cell: ({ getValue, row }) => {
            const name = getValue();
            const email = row.original.email;
            const phone = row.original.phone;
            return (
                <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-gray-500 text-sm">{email}</div>
                    <div className="text-gray-500 text-sm">{phone}</div>
                </div>
            );
        }
    }),
    columnHelper.accessor("date", {
        id: "date",
        label: "Date",
        header: "Date",
        cell: ({ getValue }) => format(new Date(getValue()), 'EEEE, MMMM d, yyyy'),
    }),
    columnHelper.accessor("startTime", {
        id: "startTime",
        label: "Time",
        header: "Time",
        cell: ({ getValue, row }) => `${getValue()} - ${row.original.endTime}`,
    }),
    columnHelper.accessor("persons", {
        id: "persons",
        label: "Guests",
        header: "Guests",
        cell: ({ getValue }) => getValue() || '-',
    }),
    columnHelper.accessor("status", {
        id: "status",
        label: "Status",
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue();
            return (
                <Badge
                    color={getStatusColor(status)}
                    className="capitalize"
                >
                    {status}
                </Badge>
            );
        }
    }),
    columnHelper.accessor("createdAt", {
        id: "createdAt",
        label: "Created At",
        header: "Created At",
        cell: ({ getValue }) => {
            const value = getValue();
            return value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "-";
        },
    }),
    columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: "Actions",
        cell: RowActions
    }),
];


// In your columns.jsx
