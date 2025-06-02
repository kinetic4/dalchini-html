import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";
import DualTableIcon from 'assets/dualicons/table.svg?react'
import TableIcon from 'assets/dualicons/table.svg?react'

const ROOT_APPS = '/tables';

const path = (root, item) => `${root}${item}`;

export const tables = {
    id: 'tables',
    type: NAV_TYPE_ROOT,
    path: '/tables',
    title: 'Tables',
    transKey: 'nav.tables.tables',
    Icon: DualTableIcon,
    childs: [
        {
            id: 'tables.orders-datatable-1',
            path: path(ROOT_APPS, '/orders-datatable-1'),
            type: NAV_TYPE_ITEM,
            title: 'Orders Datatable 1',
            transKey: 'nav.tables.orders-datatable-1',
            Icon: TableIcon
        },
        {
            id: 'tables.calendar',
            path: path(ROOT_APPS, '/calendar'),
            type: NAV_TYPE_ITEM,
            title: 'Calendar',
            transKey: 'Calendar',
        }
    ]
}
